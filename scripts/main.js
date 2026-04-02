// ── Image paths ───────────────────────────────────────────────────────────────
const IMG = {
    memetic:     "modules/lancer-sparks/images/memetic-spark.png",
    transmuting: "modules/lancer-sparks/images/transmuting-spark.png",
    osiris:      "modules/lancer-sparks/images/hurl-into-the-duat.png"
};

const MODULE_ID = 'lancer-sparks';

// ── OSIRIS Gate definitions ───────────────────────────────────────────────────
const OSIRIS_GATES = {
    1: { label: "First Gate",  color: "#4fc3f7", effect: "Control target's standard move next turn." },
    2: { label: "Second Gate", color: "#f06292", effect: "Target becomes Slowed and Impaired until end of their next turn." },
    3: { label: "Third Gate",  color: "#ba68c8", effect: "Target becomes Stunned until end of their next turn." },
    4: { label: "Fourth Gate", color: "#ff7043", effect: "Target changes allegiance until end of their next turn (ends if damaged or attacked)." },
};

// ── State helpers (stored as actor flags so they persist) ─────────────────────
function getState(actor) {
    return {
        die:          actor.getFlag(MODULE_ID, 'transcendenceDie') ?? 3,
        transcendent: actor.getFlag(MODULE_ID, 'isTranscendent')   ?? false,
        osirisGate:   actor.getFlag(MODULE_ID, 'osirisGate')       ?? 1,
    };
}

async function setState(actor, data) {
    for (const [key, val] of Object.entries(data))
        await actor.setFlag(MODULE_ID, key, val);
}

// ── Count undestroyed NHP systems on actor ────────────────────────────────────
// NHPs = items with tg_ai tag OR system.type 'AI' that are not destroyed
// (Technophile/homebrew NHPs often lack tg_ai but always have type 'AI')
function countNHPs(actor) {
    return actor.items.filter(item => {
        if (item.system?.destroyed) return false;
        const tags      = item.system?.tags ?? [];
        const hasAITag  = tags.some(t => t?.lid === 'tg_ai');
        const hasAIType = item.system?.type === 'AI';
        return hasAITag || hasAIType;
    }).length;
}

// ── Transcendence Die pip display (◆◆◆ / ◆◆◇ / ◆◇◇) ──────────────────────
function diePips(value) {
    return Array.from({ length: 3 }, (_, i) => i < value ? '◆' : '◇').join(' ');
}

// ── OSIRIS Gate display block ─────────────────────────────────────────────────
function osirisGateBlock(actorId, gate) {
    const current = OSIRIS_GATES[gate];
    const nextGate = (gate % 4) + 1;
    const next    = OSIRIS_GATES[nextGate];
    return `
        <div style="margin-top:8px;border-top:1px solid #1a3a4a;padding-top:8px;">
            <div style="color:#4fc3f7;font-size:0.8em;font-weight:bold;margin-bottom:4px;">
                ⚙ OSIRIS — Hurl Into the Duat
            </div>
            <div style="color:${current.color};font-size:0.85em;margin-bottom:2px;">
                Next inflict: <b>${current.label}</b>
            </div>
            <div style="color:#888;font-size:0.78em;margin-bottom:6px;font-style:italic;">
                ${current.effect}
            </div>
            <div style="display:flex;gap:4px;">
                <button class="osiris-hit-btn" data-actor-id="${actorId}"
                    style="flex:1;background:#0d3a5c;color:#4fc3f7;border:1px solid #4fc3f7;
                           padding:3px 8px;border-radius:3px;cursor:pointer;font-size:0.8em;">
                    Hit — Inflict ${current.label} &amp; Advance
                </button>
                <button class="osiris-reset-btn" data-actor-id="${actorId}"
                    style="background:#2a1a0a;color:#888;border:1px solid #555;
                           padding:3px 8px;border-radius:3px;cursor:pointer;font-size:0.75em;"
                    title="Reset on rest / Full Repair">
                    ↺
                </button>
            </div>
            <div style="color:#555;font-size:0.73em;margin-top:3px;">
                After advance → ${next.label}: ${next.effect}
            </div>
        </div>`;
}

// ── Click handlers ────────────────────────────────────────────────────────────
Hooks.on('renderChatMessage', (msg, html) => {

    // Apply damage button
    html.find('.lancer-dmg-btn').on('click', async ev => {
        const btn   = ev.currentTarget;
        const token = canvas.tokens.get(btn.dataset.tokenId);
        const actor = token?.actor;

        if (!actor)
            return ui.notifications.error("Token not found.");
        if (!actor.isOwner && !game.user.isGM)
            return ui.notifications.warn("You don't own that token.");

        const dmg      = parseInt(btn.dataset.damage);
        const ap       = btn.dataset.ap === 'true';
        const armor    = ap ? 0 : (actor.system.armor ?? 0);
        const finalDmg = Math.max(0, dmg - armor);
        const oldHP    = actor.system.hp.value;
        const newHP    = Math.max(0, oldHP - finalDmg);

        await actor.update({ "system.hp.value": newHP });

        btn.disabled = true;
        btn.textContent = `✓ Applied (${finalDmg} dmg)`;
        btn.style.cssText += '; background:#2a6e2a; cursor:default;';

        ChatMessage.create({ content:
            `<em><b>${actor.name}</b> takes <b>${finalDmg} ${btn.dataset.type}</b>`
            + `${ap ? ' (AP)' : ''} damage. HP: ${oldHP} → ${newHP}</em>`
        });
    });

    // OSIRIS Hit — inflict gate & advance
    html.find('.osiris-hit-btn').on('click', async ev => {
        const btn   = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);

        if (!actor?.isOwner && !game.user.isGM)
            return ui.notifications.warn("Not your actor.");

        const currentGate = actor.getFlag(MODULE_ID, 'osirisGate') ?? 1;
        const gateDef     = OSIRIS_GATES[currentGate];
        const nextGate    = (currentGate % 4) + 1;

        await setState(actor, { osirisGate: nextGate });

        btn.disabled = true;
        btn.textContent = `✓ ${gateDef.label} inflicted`;
        btn.style.cssText += '; background:#0d3a5c; cursor:default;';

        ChatMessage.create({ content: `
            <div style="border:1px solid #4fc3f7;border-radius:4px;padding:10px;background:#001a2a;">
                <div style="color:#4fc3f7;font-weight:bold;margin-bottom:4px;">
                    ⚙ OSIRIS — ${gateDef.label} inflicted
                </div>
                <div style="color:#aaa;font-size:0.85em;margin-bottom:6px;">
                    ${gateDef.effect}
                </div>
                <div style="color:#555;font-size:0.8em;">
                    Gate advances to: <span style="color:${OSIRIS_GATES[nextGate].color}">${OSIRIS_GATES[nextGate].label}</span>
                </div>
            </div>`
        });
    });

    // OSIRIS Reset gate
    html.find('.osiris-reset-btn').on('click', async ev => {
        const btn   = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);

        if (!actor?.isOwner && !game.user.isGM)
            return ui.notifications.warn("Not your actor.");

        await setState(actor, { osirisGate: 1 });

        btn.disabled = true;
        btn.textContent = '✓';
        btn.style.cssText += '; cursor:default;';

        ChatMessage.create({ content:
            `<em>OSIRIS gate reset to <b>First Gate</b> (rest / Full Repair).</em>`
        });
    });

    // Enter Transcendence button
    html.find('.transcendence-activate-btn').on('click', async ev => {
        const btn   = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);

        if (!actor?.isOwner && !game.user.isGM)
            return ui.notifications.warn("Not your actor.");

        await setState(actor, { transcendenceDie: 3, isTranscendent: true });

        btn.disabled = true;
        btn.textContent = '✓ Transcendence Active';
        btn.style.cssText += '; background:#6a3ea1; cursor:default;';

        ChatMessage.create({ content: `
            <div style="border:1px solid #9b59b6;border-radius:4px;padding:10px;background:#1a0033;">
                <div style="color:#c39bd3;font-weight:bold;font-size:1.1em;margin-bottom:6px;">
                    ✨ ${actor.name} enters a Transcendent State
                </div>
                <div style="color:#aaa;font-size:0.85em;line-height:1.6;">
                    Until the end of your next turn:<br>
                    • Transcendence Die resets to ${diePips(3)} and cannot decrease<br>
                    • Memetic Spark: +4 damage, Range 3→8<br>
                    • Immune to involuntary movement<br>
                    • Hovering 1 space above any surface
                </div>
                <button class="transcendence-end-btn" data-actor-id="${actor.id}"
                    style="margin-top:10px;width:100%;background:#4a2a6a;color:#ddd;
                           border:1px solid #9b59b6;padding:4px;border-radius:3px;cursor:pointer;">
                    End Transcendence
                </button>
            </div>`
        });
    });

    // End Transcendence button
    html.find('.transcendence-end-btn').on('click', async ev => {
        const btn   = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);

        if (!actor?.isOwner && !game.user.isGM)
            return ui.notifications.warn("Not your actor.");

        await setState(actor, { isTranscendent: false });

        btn.disabled = true;
        btn.textContent = '✓ Transcendence Ended';
        btn.style.cssText += '; cursor:default; opacity:0.6;';

        ChatMessage.create({ content:
            `<em>${actor.name}'s Transcendent State has ended.</em>`
        });
    });
});

// ── Memetic Spark ─────────────────────────────────────────────────────────────
async function sendMemeticSpark() {
    const caster = canvas.tokens.controlled[0]?.actor;
    if (!caster) return ui.notifications.warn("Select your own token first.");

    const targets = Array.from(game.user.targets);
    if (!targets.length) return ui.notifications.warn("Target at least one token first.");

    const { die, transcendent, osirisGate } = getState(caster);
    const nhpCount = countNHPs(caster);
    const baseDmg  = 1 + nhpCount;
    const bonusDmg = transcendent ? 4 : 0;
    const totalDmg = baseDmg + bonusDmg;
    const range    = transcendent ? 8 : 3;

    const rows = targets.map(t => {
        const name = t.actor?.name ?? t.name;
        return `
            <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                <span style="flex:1;color:#ddd;">${name}</span>
                <button class="lancer-dmg-btn"
                    data-token-id="${t.id}"
                    data-damage="${totalDmg}"
                    data-type="Energy"
                    data-ap="true"
                    style="background:#8b1a1a;color:#fff;border:1px solid #c44;
                           padding:3px 12px;border-radius:3px;cursor:pointer;">
                    Apply ${totalDmg} Energy (AP)
                </button>
            </div>`;
    }).join('');

    const transcBadge = transcendent ? `
        <div style="color:#c39bd3;font-size:0.8em;margin-top:2px;">
            ✨ Transcendent: +4 dmg, Range ${range}
        </div>` : '';

    await ChatMessage.create({ content: `
        <div style="border:1px solid #8b1a1a;border-radius:4px;overflow:hidden;background:#110000;">
            <img src="${IMG.memetic}" style="width:100%;display:block;" />
            <div style="padding:10px;">
                <div style="color:#ff6060;font-weight:bold;font-size:1.1em;margin-bottom:2px;">
                    💥 Memetic Spark
                </div>
                <div style="color:#aaa;font-size:0.85em;margin-bottom:4px;">
                    ${totalDmg} Energy Damage (AP) — Range ${range}
                </div>
                <div style="color:#7ec8e3;font-size:0.8em;margin-bottom:4px;">
                    NHPs online: ${nhpCount} (+${nhpCount} dmg)${bonusDmg ? ` + Transcendence (+${bonusDmg} dmg)` : ''}
                </div>
                ${transcBadge}
                <div style="margin-top:8px;">${rows}</div>
            </div>
        </div>`
    });
}

// ── Hurl Into the Duat ────────────────────────────────────────────────────────
async function sendHurlIntotheDuat() {
    const caster = canvas.tokens.controlled[0]?.actor;
    if (!caster) return ui.notifications.warn("Select your own token first.");

    const gate    = caster.getFlag(MODULE_ID, 'osirisGate') ?? 1;
    const gateDef = OSIRIS_GATES[gate];

    await ChatMessage.create({ content: `
        <div style="border:1px solid #4fc3f7;border-radius:4px;overflow:hidden;background:#001a2a;">
            <img src="${IMG.osiris}" style="width:100%;display:block;" />
            <div style="padding:10px;">
                <div style="color:#4fc3f7;font-weight:bold;font-size:1.1em;margin-bottom:2px;">
                    ⚙ OSIRIS — Hurl Into the Duat
                </div>
                <div style="color:#aaa;font-size:0.85em;margin-bottom:8px;">
                    Quick Tech · Tech Attack · Sensors range · 2 Heat on hit
                </div>
                <div style="border:1px solid #1a3a4a;border-radius:3px;padding:8px;margin-bottom:10px;background:#002030;">
                    <div style="color:${gateDef.color};font-weight:bold;font-size:0.9em;margin-bottom:3px;">
                        On hit: ${gateDef.label}
                    </div>
                    <div style="color:#aaa;font-size:0.82em;font-style:italic;">
                        ${gateDef.effect}
                    </div>
                </div>
                <button class="osiris-hit-btn" data-actor-id="${caster.id}"
                    style="display:block;width:100%;background:#0d3a5c;color:#4fc3f7;
                           border:1px solid #4fc3f7;padding:6px;border-radius:3px;
                           cursor:pointer;font-size:0.9em;margin-bottom:6px;">
                    ✓ Hit — Inflict &amp; Advance Gate
                </button>
                <button class="osiris-reset-btn" data-actor-id="${caster.id}"
                    style="display:block;width:100%;background:#1a1a1a;color:#666;
                           border:1px solid #444;padding:4px;border-radius:3px;
                           cursor:pointer;font-size:0.78em;"
                    title="Use on rest / Full Repair">
                    ↺ Reset Gate (rest / Full Repair)
                </button>
            </div>
        </div>`
    });
}

// ── Transmuting Spark ─────────────────────────────────────────────────────────
async function sendTransmutingSpark() {
    const caster = canvas.tokens.controlled[0]?.actor;
    if (!caster) return ui.notifications.warn("Select your own token first.");

    const targets = Array.from(game.user.targets);
    if (!targets.length) return ui.notifications.warn("Target at least one token first.");

    const { die, transcendent } = getState(caster);

    // Die can't decrease during transcendence; otherwise floor at 1
    const atOne  = die <= 1;
    const newDie = transcendent ? die : Math.max(1, die - 1);
    await setState(caster, { transcendenceDie: newDie });

    const rows = targets.map(t => {
        const name = t.actor?.name ?? t.name;
        return `
            <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                <span style="flex:1;color:#ddd;">${name}</span>
                <button class="lancer-dmg-btn"
                    data-token-id="${t.id}"
                    data-damage="2"
                    data-type="Energy"
                    data-ap="true"
                    style="background:#8b1a1a;color:#fff;border:1px solid #c44;
                           padding:3px 12px;border-radius:3px;cursor:pointer;">
                    Apply 2 Energy (AP)
                </button>
            </div>`;
    }).join('');

    // Show transcendence option only when die was at 1 and not already transcendent
    const transcendBtn = (atOne && !transcendent) ? `
        <div style="margin-top:10px;border-top:1px solid #9b59b6;padding-top:10px;">
            <div style="color:#c39bd3;font-size:0.85em;margin-bottom:6px;">
                ✨ Die at minimum — you may enter a Transcendent State
            </div>
            <button class="transcendence-activate-btn" data-actor-id="${caster.id}"
                style="width:100%;background:#6a3ea1;color:#fff;border:1px solid #9b59b6;
                       padding:4px 12px;border-radius:3px;cursor:pointer;">
                Enter Transcendence &amp; Reset Die to ${diePips(3)}
            </button>
        </div>` : '';

    const dieLabel = transcendent
        ? `<span style="color:#c39bd3;">✨ ${diePips(newDie)} (Transcendent — locked)</span>`
        : `<span style="color:#7ec8e3;">Transcendence Die: ${diePips(newDie)}</span>`;

    await ChatMessage.create({ content: `
        <div style="border:1px solid #8b1a1a;border-radius:4px;overflow:hidden;background:#110000;">
            <img src="${IMG.transmuting}" style="width:100%;display:block;" />
            <div style="padding:10px;">
                <div style="color:#ff6060;font-weight:bold;font-size:1.1em;margin-bottom:2px;">
                    💥 Transmuting Spark
                </div>
                <div style="color:#aaa;font-size:0.85em;margin-bottom:6px;">
                    2 Energy Damage (AP) — Line 3
                </div>
                <div style="font-size:0.9em;margin-bottom:8px;">${dieLabel}</div>
                ${rows}
                ${transcendBtn}
            </div>
        </div>`
    });
}

// ── Auto-create/update macros on load ─────────────────────────────────────────
Hooks.once('ready', async () => {
    if (!game.user.isGM) return;

    const macros = [
        { name: "Memetic Spark",        img: IMG.memetic,     command: `game.lancerSparks.sendMemeticSpark()` },
        { name: "Transmuting Spark",    img: IMG.transmuting, command: `game.lancerSparks.sendTransmutingSpark()` },
        { name: "Hurl Into the Duat",   img: IMG.osiris, command: `game.lancerSparks.sendHurlIntotheDuat()` }
    ];

    for (const m of macros) {
        const existing = game.macros.getName(m.name);
        if (existing) {
            await existing.update({ command: m.command, img: m.img });
        } else {
            await Macro.create({ name: m.name, type: "script", img: m.img, command: m.command });
        }
        console.log(`lancer-sparks | Registered macro: ${m.name}`);
    }
});

// ── Expose API ────────────────────────────────────────────────────────────────
Hooks.once('init', () => {
    game.lancerSparks = { sendMemeticSpark, sendTransmutingSpark, sendHurlIntotheDuat };
});
