const MODULE_ID = "lancer-nhp-toolkit";
const MODULE_API = "lancerNhpToolkit";
const LANCER_SYSTEM_ID = "lancer";

const IMG = {
  memetic: "modules/lancer-nhp-toolkit/images/memetic-spark.png",
  transmuting: "modules/lancer-nhp-toolkit/images/transmuting-spark.png",
  osiris: "modules/lancer-nhp-toolkit/images/hurl-into-the-duat.png"
};

const OSIRIS_GATES = {
  1: { label: "First Gate", color: "#4fc3f7", effect: "Control target's standard move next turn." },
  2: { label: "Second Gate", color: "#f06292", effect: "Target becomes Slowed and Impaired until end of their next turn." },
  3: { label: "Third Gate", color: "#ba68c8", effect: "Target becomes Stunned until end of their next turn." },
  4: { label: "Fourth Gate", color: "#ff7043", effect: "Target changes allegiance until end of their next turn (ends if damaged or attacked)." }
};

function isSupportedSystem() {
  return game.system?.id === LANCER_SYSTEM_ID;
}

function requireSupportedSystem() {
  if (isSupportedSystem()) return true;
  ui.notifications.warn("Lancer NHP Toolkit only supports the Lancer game system.");
  return false;
}

function getState(actor) {
  return {
    die: actor.getFlag(MODULE_ID, "transcendenceDie") ?? 3,
    transcendent: actor.getFlag(MODULE_ID, "isTranscendent") ?? false,
    osirisGate: actor.getFlag(MODULE_ID, "osirisGate") ?? 1
  };
}

async function setState(actor, data) {
  for (const [key, value] of Object.entries(data)) {
    await actor.setFlag(MODULE_ID, key, value);
  }
}

function countNHPs(actor) {
  return actor.items.filter((item) => {
    if (item.system?.destroyed) return false;
    const tags = item.system?.tags ?? [];
    const hasAITag = tags.some((tag) => tag?.lid === "tg_ai");
    const hasAIType = item.system?.type === "AI";
    return hasAITag || hasAIType;
  }).length;
}

function diePips(value) {
  return Array.from({ length: 3 }, (_, index) => (index < value ? "*" : "o")).join(" ");
}

async function ensureMacro(macroData) {
  const existing = game.macros.getName(macroData.name);
  if (existing) return false;

  await Macro.create({ ...macroData, type: "script" });
  console.log(`${MODULE_ID} | Created macro: ${macroData.name}`);
  return true;
}

Hooks.on("renderChatMessage", (_message, html) => {
  html.find(".lancer-dmg-btn").on("click", async (event) => {
    const button = event.currentTarget;
    const token = canvas.tokens.get(button.dataset.tokenId);
    const actor = token?.actor;

    if (!actor) return ui.notifications.error("Token not found.");
    if (!actor.isOwner && !game.user.isGM) return ui.notifications.warn("You don't own that token.");

    const damage = Number.parseInt(button.dataset.damage, 10);
    const ap = button.dataset.ap === "true";
    const armor = ap ? 0 : (actor.system.armor ?? 0);
    const finalDamage = Math.max(0, damage - armor);
    const oldHP = actor.system.hp.value;
    const newHP = Math.max(0, oldHP - finalDamage);

    await actor.update({ "system.hp.value": newHP });

    button.disabled = true;
    button.textContent = `Applied (${finalDamage} dmg)`;
    button.style.cssText += "; background:#2a6e2a; cursor:default;";

    await ChatMessage.create({
      content: `<em><b>${actor.name}</b> takes <b>${finalDamage} ${button.dataset.type}</b>${ap ? " (AP)" : ""} damage. HP: ${oldHP} -> ${newHP}</em>`
    });
  });

  html.find(".osiris-hit-btn").on("click", async (event) => {
    const button = event.currentTarget;
    const actor = game.actors.get(button.dataset.actorId);

    if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

    const currentGate = actor.getFlag(MODULE_ID, "osirisGate") ?? 1;
    const gateDef = OSIRIS_GATES[currentGate];
    const nextGate = (currentGate % 4) + 1;

    await setState(actor, { osirisGate: nextGate });

    button.disabled = true;
    button.textContent = `${gateDef.label} inflicted`;
    button.style.cssText += "; background:#0d3a5c; cursor:default;";

    await ChatMessage.create({
      content: `
        <div style="border:1px solid #4fc3f7;border-radius:4px;padding:10px;background:#001a2a;">
          <div style="color:#4fc3f7;font-weight:bold;margin-bottom:4px;">OSIRIS | ${gateDef.label} inflicted</div>
          <div style="color:#aaa;font-size:0.85em;margin-bottom:6px;">${gateDef.effect}</div>
          <div style="color:#555;font-size:0.8em;">
            Gate advances to: <span style="color:${OSIRIS_GATES[nextGate].color}">${OSIRIS_GATES[nextGate].label}</span>
          </div>
        </div>`
    });
  });

  html.find(".osiris-reset-btn").on("click", async (event) => {
    const button = event.currentTarget;
    const actor = game.actors.get(button.dataset.actorId);

    if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

    await setState(actor, { osirisGate: 1 });

    button.disabled = true;
    button.textContent = "Reset";
    button.style.cssText += "; cursor:default;";

    await ChatMessage.create({
      content: "<em>OSIRIS gate reset to <b>First Gate</b> (rest / Full Repair).</em>"
    });
  });

  html.find(".transcendence-activate-btn").on("click", async (event) => {
    const button = event.currentTarget;
    const actor = game.actors.get(button.dataset.actorId);

    if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

    await setState(actor, { transcendenceDie: 3, isTranscendent: true });

    button.disabled = true;
    button.textContent = "Transcendence Active";
    button.style.cssText += "; background:#6a3ea1; cursor:default;";

    await ChatMessage.create({
      content: `
        <div style="border:1px solid #9b59b6;border-radius:4px;padding:10px;background:#1a0033;">
          <div style="color:#c39bd3;font-weight:bold;font-size:1.1em;margin-bottom:6px;">
            ${actor.name} enters a Transcendent State
          </div>
          <div style="color:#aaa;font-size:0.85em;line-height:1.6;">
            Until the end of your next turn:<br>
            - Transcendence Die resets to ${diePips(3)} and cannot decrease<br>
            - Memetic Spark: +4 damage, Range 3->8<br>
            - Immune to involuntary movement<br>
            - Hovering 1 space above any surface
          </div>
          <button class="transcendence-end-btn" data-actor-id="${actor.id}"
            style="margin-top:10px;width:100%;background:#4a2a6a;color:#ddd;border:1px solid #9b59b6;padding:4px;border-radius:3px;cursor:pointer;">
            End Transcendence
          </button>
        </div>`
    });
  });

  html.find(".transcendence-end-btn").on("click", async (event) => {
    const button = event.currentTarget;
    const actor = game.actors.get(button.dataset.actorId);

    if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

    await setState(actor, { isTranscendent: false });

    button.disabled = true;
    button.textContent = "Transcendence Ended";
    button.style.cssText += "; cursor:default; opacity:0.6;";

    await ChatMessage.create({
      content: `<em>${actor.name}'s Transcendent State has ended.</em>`
    });
  });
});

async function sendMemeticSpark() {
  if (!requireSupportedSystem()) return;

  const caster = canvas.tokens.controlled[0]?.actor;
  if (!caster) return ui.notifications.warn("Select your own token first.");

  const targets = Array.from(game.user.targets);
  if (!targets.length) return ui.notifications.warn("Target at least one token first.");

  const { transcendent } = getState(caster);
  const nhpCount = countNHPs(caster);
  const baseDamage = 1 + nhpCount;
  const bonusDamage = transcendent ? 4 : 0;
  const totalDamage = baseDamage + bonusDamage;
  const range = transcendent ? 8 : 3;

  const rows = targets.map((target) => {
    const name = target.actor?.name ?? target.name;
    return `
      <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
        <span style="flex:1;color:#ddd;">${name}</span>
        <button class="lancer-dmg-btn"
          data-token-id="${target.id}"
          data-damage="${totalDamage}"
          data-type="Energy"
          data-ap="true"
          style="background:#8b1a1a;color:#fff;border:1px solid #c44;padding:3px 12px;border-radius:3px;cursor:pointer;">
          Apply ${totalDamage} Energy (AP)
        </button>
      </div>`;
  }).join("");

  const transcendentBadge = transcendent
    ? `<div style="color:#c39bd3;font-size:0.8em;margin-top:2px;">Transcendent: +4 dmg, Range ${range}</div>`
    : "";

  await ChatMessage.create({
    content: `
      <div style="border:1px solid #8b1a1a;border-radius:4px;overflow:hidden;background:#110000;">
        <img src="${IMG.memetic}" style="width:100%;display:block;" />
        <div style="padding:10px;">
          <div style="color:#ff6060;font-weight:bold;font-size:1.1em;margin-bottom:2px;">Memetic Spark</div>
          <div style="color:#aaa;font-size:0.85em;margin-bottom:4px;">${totalDamage} Energy Damage (AP) | Range ${range}</div>
          <div style="color:#7ec8e3;font-size:0.8em;margin-bottom:4px;">
            NHPs online: ${nhpCount} (+${nhpCount} dmg)${bonusDamage ? ` + Transcendence (+${bonusDamage} dmg)` : ""}
          </div>
          ${transcendentBadge}
          <div style="margin-top:8px;">${rows}</div>
        </div>
      </div>`
  });
}

async function sendHurlIntoTheDuat() {
  if (!requireSupportedSystem()) return;

  const caster = canvas.tokens.controlled[0]?.actor;
  if (!caster) return ui.notifications.warn("Select your own token first.");

  const gate = caster.getFlag(MODULE_ID, "osirisGate") ?? 1;
  const gateDef = OSIRIS_GATES[gate];

  await ChatMessage.create({
    content: `
      <div style="border:1px solid #4fc3f7;border-radius:4px;overflow:hidden;background:#001a2a;">
        <img src="${IMG.osiris}" style="width:100%;display:block;" />
        <div style="padding:10px;">
          <div style="color:#4fc3f7;font-weight:bold;font-size:1.1em;margin-bottom:2px;">OSIRIS | Hurl Into the Duat</div>
          <div style="color:#aaa;font-size:0.85em;margin-bottom:8px;">Quick Tech | Tech Attack | Sensors range | 2 Heat on hit</div>
          <div style="border:1px solid #1a3a4a;border-radius:3px;padding:8px;margin-bottom:10px;background:#002030;">
            <div style="color:${gateDef.color};font-weight:bold;font-size:0.9em;margin-bottom:3px;">On hit: ${gateDef.label}</div>
            <div style="color:#aaa;font-size:0.82em;font-style:italic;">${gateDef.effect}</div>
          </div>
          <button class="osiris-hit-btn" data-actor-id="${caster.id}"
            style="display:block;width:100%;background:#0d3a5c;color:#4fc3f7;border:1px solid #4fc3f7;padding:6px;border-radius:3px;cursor:pointer;font-size:0.9em;margin-bottom:6px;">
            Hit | Inflict and Advance Gate
          </button>
          <button class="osiris-reset-btn" data-actor-id="${caster.id}"
            style="display:block;width:100%;background:#1a1a1a;color:#666;border:1px solid #444;padding:4px;border-radius:3px;cursor:pointer;font-size:0.78em;"
            title="Use on rest / Full Repair">
            Reset Gate (rest / Full Repair)
          </button>
        </div>
      </div>`
  });
}

async function sendTransmutingSpark() {
  if (!requireSupportedSystem()) return;

  const caster = canvas.tokens.controlled[0]?.actor;
  if (!caster) return ui.notifications.warn("Select your own token first.");

  const targets = Array.from(game.user.targets);
  if (!targets.length) return ui.notifications.warn("Target at least one token first.");

  const { die, transcendent } = getState(caster);
  const atOne = die <= 1;
  const newDie = transcendent ? die : Math.max(1, die - 1);
  await setState(caster, { transcendenceDie: newDie });

  const rows = targets.map((target) => {
    const name = target.actor?.name ?? target.name;
    return `
      <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
        <span style="flex:1;color:#ddd;">${name}</span>
        <button class="lancer-dmg-btn"
          data-token-id="${target.id}"
          data-damage="2"
          data-type="Energy"
          data-ap="true"
          style="background:#8b1a1a;color:#fff;border:1px solid #c44;padding:3px 12px;border-radius:3px;cursor:pointer;">
          Apply 2 Energy (AP)
        </button>
      </div>`;
  }).join("");

  const transcendButton = (atOne && !transcendent)
    ? `
      <div style="margin-top:10px;border-top:1px solid #9b59b6;padding-top:10px;">
        <div style="color:#c39bd3;font-size:0.85em;margin-bottom:6px;">Die at minimum - you may enter a Transcendent State</div>
        <button class="transcendence-activate-btn" data-actor-id="${caster.id}"
          style="width:100%;background:#6a3ea1;color:#fff;border:1px solid #9b59b6;padding:4px 12px;border-radius:3px;cursor:pointer;">
          Enter Transcendence and Reset Die to ${diePips(3)}
        </button>
      </div>`
    : "";

  const dieLabel = transcendent
    ? `<span style="color:#c39bd3;">${diePips(newDie)} (Transcendent - locked)</span>`
    : `<span style="color:#7ec8e3;">Transcendence Die: ${diePips(newDie)}</span>`;

  await ChatMessage.create({
    content: `
      <div style="border:1px solid #8b1a1a;border-radius:4px;overflow:hidden;background:#110000;">
        <img src="${IMG.transmuting}" style="width:100%;display:block;" />
        <div style="padding:10px;">
          <div style="color:#ff6060;font-weight:bold;font-size:1.1em;margin-bottom:2px;">Transmuting Spark</div>
          <div style="color:#aaa;font-size:0.85em;margin-bottom:6px;">2 Energy Damage (AP) | Line 3</div>
          <div style="font-size:0.9em;margin-bottom:8px;">${dieLabel}</div>
          ${rows}
          ${transcendButton}
        </div>
      </div>`
  });
}

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  if (!isSupportedSystem()) {
    console.warn(`${MODULE_ID} | Expected system "${LANCER_SYSTEM_ID}" but found "${game.system?.id ?? "unknown"}".`);
    return;
  }

  const macros = [
    { name: "Memetic Spark", img: IMG.memetic, command: `game.${MODULE_API}.sendMemeticSpark()` },
    { name: "Transmuting Spark", img: IMG.transmuting, command: `game.${MODULE_API}.sendTransmutingSpark()` },
    { name: "Hurl Into the Duat", img: IMG.osiris, command: `game.${MODULE_API}.sendHurlIntoTheDuat()` }
  ];

  let created = 0;
  for (const macro of macros) {
    if (await ensureMacro(macro)) created += 1;
  }

  if (created > 0) {
    ui.notifications.info(`Lancer NHP Toolkit created ${created} world macro${created === 1 ? "" : "s"} for first-time setup.`);
  }
});

Hooks.once("init", () => {
  game[MODULE_API] = { sendMemeticSpark, sendTransmutingSpark, sendHurlIntoTheDuat };
});
