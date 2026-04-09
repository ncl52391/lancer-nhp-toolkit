# Standalone Macro Bundle

Create a new Script macro in Foundry for each section below, then copy the code block contents into it.

## memetic-spark

```js
(async () => {
  const FLAG_NS = "lancer";

  if (game.system?.id !== "lancer") {
    return ui.notifications.warn("This macro only works in a Lancer world.");
  }

  if (!globalThis._lancerDmgHook) {
    globalThis._lancerDmgHook = true;
    Hooks.on("renderChatMessage", (_msg, html) => {
      html.find(".lancer-dmg-btn").on("click", async (ev) => {
        const btn = ev.currentTarget;
        const token = canvas.tokens.get(btn.dataset.tokenId);
        const actor = token?.actor;

        if (!actor) return ui.notifications.error("Token not found.");
        if (!actor.isOwner && !game.user.isGM) {
          return ui.notifications.warn("You don't own that token.");
        }

        const dmg = Number.parseInt(btn.dataset.damage, 10);
        const ap = btn.dataset.ap === "true";
        const armor = ap ? 0 : (actor.system.armor ?? 0);
        const finalDmg = Math.max(0, dmg - armor);
        const oldHP = actor.system.hp.value;
        const newHP = Math.max(0, oldHP - finalDmg);

        await actor.update({ "system.hp.value": newHP });

        btn.disabled = true;
        btn.textContent = `Applied (${finalDmg} dmg)`;
        btn.style.cssText += "; background:#2a6e2a; cursor:default;";

        await ChatMessage.create({
          content: `<em><b>${actor.name}</b> takes <b>${finalDmg} ${btn.dataset.type}</b>${ap ? " (AP)" : ""} damage. HP: ${oldHP} -> ${newHP}</em>`
        });
      });
    });
  }

  const actor = canvas.tokens.controlled[0]?.actor;
  if (!actor) return ui.notifications.warn("Select your token first.");

  const targets = Array.from(game.user.targets);
  if (!targets.length) return ui.notifications.warn("Target at least one token first.");

  const transcendent = actor.getFlag(FLAG_NS, "isTranscendent") ?? false;
  const nhpCount = actor.items.filter((item) => {
    if (item.system?.destroyed) return false;
    const tags = item.system?.tags ?? [];
    const hasAITag = tags.some((tag) => tag?.lid === "tg_ai");
    const hasAIType = item.system?.type === "AI";
    return hasAITag || hasAIType;
  }).length;

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

  await ChatMessage.create({
    content: `
      <div style="border:1px solid #8b1a1a;border-radius:4px;padding:10px;background:#110000;">
        <div style="color:#ff6060;font-weight:bold;font-size:1.1em;margin-bottom:2px;">Memetic Spark</div>
        <div style="color:#aaa;font-size:0.85em;margin-bottom:4px;">${totalDamage} Energy Damage (AP) | Range ${range}</div>
        <div style="color:#7ec8e3;font-size:0.8em;margin-bottom:4px;">NHPs online: ${nhpCount}${bonusDamage ? ` + Transcendence (+${bonusDamage})` : ""}</div>
        ${transcendent ? `<div style="color:#d6b9ff;font-size:0.8em;margin-bottom:4px;">Transcendent state active</div>` : ""}
        <div style="margin-top:8px;">${rows}</div>
      </div>`
  });
})();
```

## transmuting-spark

```js
(async () => {
  const FLAG_NS = "lancer";

  if (game.system?.id !== "lancer") {
    return ui.notifications.warn("This macro only works in a Lancer world.");
  }

  if (!globalThis._lancerDmgHook) {
    globalThis._lancerDmgHook = true;
    Hooks.on("renderChatMessage", (_msg, html) => {
      html.find(".lancer-dmg-btn").on("click", async (ev) => {
        const btn = ev.currentTarget;
        const token = canvas.tokens.get(btn.dataset.tokenId);
        const actor = token?.actor;

        if (!actor) return ui.notifications.error("Token not found.");
        if (!actor.isOwner && !game.user.isGM) {
          return ui.notifications.warn("You don't own that token.");
        }

        const dmg = Number.parseInt(btn.dataset.damage, 10);
        const ap = btn.dataset.ap === "true";
        const armor = ap ? 0 : (actor.system.armor ?? 0);
        const finalDmg = Math.max(0, dmg - armor);
        const oldHP = actor.system.hp.value;
        const newHP = Math.max(0, oldHP - finalDmg);

        await actor.update({ "system.hp.value": newHP });

        btn.disabled = true;
        btn.textContent = `Applied (${finalDmg} dmg)`;
        btn.style.cssText += "; background:#2a6e2a; cursor:default;";

        await ChatMessage.create({
          content: `<em><b>${actor.name}</b> takes <b>${finalDmg} ${btn.dataset.type}</b>${ap ? " (AP)" : ""} damage. HP: ${oldHP} -> ${newHP}</em>`
        });
      });
    });
  }

  const actor = canvas.tokens.controlled[0]?.actor;
  if (!actor) return ui.notifications.warn("Select your token first.");

  const targets = Array.from(game.user.targets);
  if (!targets.length) return ui.notifications.warn("Target at least one token first.");

  const die = actor.getFlag(FLAG_NS, "transcendenceDie") ?? 3;
  const transcendent = actor.getFlag(FLAG_NS, "isTranscendent") ?? false;
  const newDie = transcendent ? die : Math.max(1, die - 1);

  await actor.setFlag(FLAG_NS, "transcendenceDie", newDie);

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

  await ChatMessage.create({
    content: `
      <div style="border:1px solid #8b1a1a;border-radius:4px;padding:10px;background:#110000;">
        <div style="color:#ff6060;font-weight:bold;font-size:1.1em;margin-bottom:2px;">Transmuting Spark</div>
        <div style="color:#aaa;font-size:0.85em;margin-bottom:6px;">2 Energy Damage (AP) | Line 3</div>
        <div style="color:#7ec8e3;font-size:0.9em;margin-bottom:8px;">Transcendence Die: ${die} -> ${newDie}${transcendent ? " (locked while Transcendent)" : ""}</div>
        <div style="margin-top:8px;">${rows}</div>
      </div>`
  });
})();
```

## hurl-into-the-duat

```js
(async () => {
  const FLAG_NS = "lancer";
  const GATES = {
    1: { label: "First Gate", color: "#4fc3f7", effect: "Control target's standard move next turn." },
    2: { label: "Second Gate", color: "#f06292", effect: "Target becomes Slowed and Impaired until end of their next turn." },
    3: { label: "Third Gate", color: "#ba68c8", effect: "Target becomes Stunned until end of their next turn." },
    4: { label: "Fourth Gate", color: "#ff7043", effect: "Target changes allegiance until end of their next turn (ends if damaged or attacked)." }
  };

  if (game.system?.id !== "lancer") {
    return ui.notifications.warn("This macro only works in a Lancer world.");
  }

  const actor = canvas.tokens.controlled[0]?.actor;
  if (!actor) return ui.notifications.warn("Select your token first.");

  const currentGate = actor.getFlag(FLAG_NS, "osirisGate") ?? 1;
  const nextGate = (currentGate % 4) + 1;
  const gate = GATES[currentGate];

  const content = `
    <p><b>${actor.name}</b></p>
    <p>Current gate: <b style="color:${gate.color};">${gate.label}</b></p>
    <p>${gate.effect}</p>
  `;

  const actions = {
    advance: async () => {
      await actor.setFlag(FLAG_NS, "osirisGate", nextGate);
      await ChatMessage.create({
        content: `<div style="border:1px solid #4fc3f7;border-radius:4px;padding:10px;background:#001a2a;">
          <div style="color:#4fc3f7;font-weight:bold;">OSIRIS Gate advanced</div>
          <div style="margin-top:4px;">${gate.label} was just applied.</div>
          <div style="margin-top:4px;">Next gate: <b style="color:${GATES[nextGate].color};">${GATES[nextGate].label}</b></div>
        </div>`
      });
    },
    reset: async () => {
      await actor.setFlag(FLAG_NS, "osirisGate", 1);
      await ChatMessage.create({ content: `<em>OSIRIS gate reset to <b>First Gate</b>.</em>` });
    }
  };

  try {
    if (globalThis.Dialog) {
      new Dialog({
        title: "OSIRIS Gate Tracker",
        content,
        buttons: {
          advance: { label: "Advance Gate", callback: actions.advance },
          reset: { label: "Reset to First Gate", callback: actions.reset },
          cancel: { label: "Cancel" }
        },
        default: "advance"
      }).render(true);
      return;
    }

    const DialogV2 = foundry?.applications?.api?.DialogV2;
    if (DialogV2) {
      new DialogV2({
        window: { title: "OSIRIS Gate Tracker" },
        content,
        buttons: [
          { action: "advance", label: "Advance Gate", callback: async () => actions.advance() },
          { action: "reset", label: "Reset to First Gate", callback: async () => actions.reset() },
          { action: "cancel", label: "Cancel" }
        ]
      }).render({ force: true });
      return;
    }

    ui.notifications.warn("No compatible dialog API was found in this Foundry version.");
    await ChatMessage.create({
      content: `<em>OSIRIS tracker failed to open a dialog for ${actor.name}. Current gate: <b>${gate.label}</b>.</em>`
    });
  } catch (error) {
    console.error("Lancer standalone OSIRIS tracker failed", error);
    ui.notifications.error("OSIRIS tracker failed to open. Check the browser console for details.");
  }
})();
```

## transcendence-tracker

```js
(async () => {
  const FLAG_NS = "lancer";

  function diePips(value) {
    return Array.from({ length: 3 }, (_, index) => (index < value ? "*" : "o")).join(" ");
  }

  if (game.system?.id !== "lancer") {
    return ui.notifications.warn("This macro only works in a Lancer world.");
  }

  if (!globalThis._lnhpTranscendenceHook) {
    globalThis._lnhpTranscendenceHook = true;

    Hooks.on("renderChatMessage", (_msg, html) => {
      html.find(".lnhp-trans-lower").on("click", async (ev) => {
        const btn = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);
        if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

        const transcendent = actor.getFlag(FLAG_NS, "isTranscendent") ?? false;
        if (transcendent) {
          return ui.notifications.warn("The die cannot decrease while Transcendent.");
        }

        const die = actor.getFlag(FLAG_NS, "transcendenceDie") ?? 3;
        const newDie = Math.max(1, die - 1);
        await actor.setFlag(FLAG_NS, "transcendenceDie", newDie);

        btn.disabled = true;
        btn.textContent = `Die lowered to ${newDie}`;

        await ChatMessage.create({
          content: `<em>${actor.name}'s Transcendence Die is now <b>${newDie}</b>.</em>`
        });
      });

      html.find(".lnhp-trans-reset").on("click", async (ev) => {
        const btn = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);
        if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

        await actor.setFlag(FLAG_NS, "transcendenceDie", 3);

        btn.disabled = true;
        btn.textContent = "Die reset";

        await ChatMessage.create({
          content: `<em>${actor.name}'s Transcendence Die resets to <b>3</b>.</em>`
        });
      });

      html.find(".lnhp-trans-enter").on("click", async (ev) => {
        const btn = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);
        if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

        await actor.setFlag(FLAG_NS, "transcendenceDie", 3);
        await actor.setFlag(FLAG_NS, "isTranscendent", true);

        btn.disabled = true;
        btn.textContent = "Transcendence Active";

        await ChatMessage.create({
          content: `<em><b>${actor.name}</b> enters a <b>Transcendent State</b>. Die resets to <b>${diePips(3)}</b>.</em>`
        });
      });

      html.find(".lnhp-trans-end").on("click", async (ev) => {
        const btn = ev.currentTarget;
        const actor = game.actors.get(btn.dataset.actorId);
        if (!actor?.isOwner && !game.user.isGM) return ui.notifications.warn("Not your actor.");

        await actor.setFlag(FLAG_NS, "isTranscendent", false);

        btn.disabled = true;
        btn.textContent = "Transcendence Ended";

        await ChatMessage.create({
          content: `<em>${actor.name}'s Transcendent State has ended.</em>`
        });
      });
    });
  }

  const actor = canvas.tokens.controlled[0]?.actor;
  if (!actor) return ui.notifications.warn("Select your token first.");

  const die = actor.getFlag(FLAG_NS, "transcendenceDie") ?? 3;
  const transcendent = actor.getFlag(FLAG_NS, "isTranscendent") ?? false;

  await ChatMessage.create({
    content: `
      <div style="border:1px solid #9b59b6;border-radius:4px;padding:10px;background:#1a0033;">
        <div style="color:#d6b9ff;font-weight:bold;font-size:1.1em;margin-bottom:6px;">Transcendence Tracker</div>
        <div style="color:#ddd;margin-bottom:4px;"><b>${actor.name}</b></div>
        <div style="color:#aaa;font-size:0.9em;margin-bottom:4px;">Transcendence Die: <b>${diePips(die)}</b> (${die})</div>
        <div style="color:#aaa;font-size:0.9em;margin-bottom:8px;">Transcendent: <b>${transcendent ? "Yes" : "No"}</b></div>
        <div style="display:grid;gap:6px;">
          <button class="lnhp-trans-lower" data-actor-id="${actor.id}" style="padding:4px;border-radius:3px;cursor:pointer;">Lower Die</button>
          <button class="lnhp-trans-reset" data-actor-id="${actor.id}" style="padding:4px;border-radius:3px;cursor:pointer;">Reset Die to 3</button>
          <button class="lnhp-trans-enter" data-actor-id="${actor.id}" style="padding:4px;border-radius:3px;cursor:pointer;">Enter Transcendence</button>
          <button class="lnhp-trans-end" data-actor-id="${actor.id}" style="padding:4px;border-radius:3px;cursor:pointer;">End Transcendence</button>
        </div>
      </div>`
  });
})();
```

## apply-immobilized-and-shredded

```js
(async () => {
  function findStatusId(candidates) {
    const effects = CONFIG.statusEffects ?? [];
    const lowered = candidates.map((candidate) => String(candidate).toLowerCase());

    for (const effect of effects) {
      const haystacks = [
        effect.id,
        effect.name,
        effect.label,
        effect.slug,
        ...(Array.isArray(effect.statuses) ? effect.statuses : [])
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      if (lowered.some((candidate) => haystacks.includes(candidate))) {
        return effect.id ?? effect.statuses?.[0] ?? effect.slug;
      }
    }

    return null;
  }

  async function ensureStatus(token, statusId, label) {
    const doc = token.document ?? token;
    const actor = token.actor;

    if (!statusId) {
      return { ok: false, message: `${label} status was not found in this world.` };
    }

    if (!actor) {
      return { ok: false, message: "Token has no actor." };
    }

    if (!actor.isOwner && !game.user.isGM) {
      return { ok: false, message: `You do not own ${actor.name}.` };
    }

    try {
      const alreadyActive =
        typeof doc.hasStatusEffect === "function" ? doc.hasStatusEffect(statusId) : false;

      if (alreadyActive) {
        return { ok: true, changed: false, message: `${label} already active.` };
      }

      if (typeof doc.toggleStatusEffect === "function") {
        await doc.toggleStatusEffect(statusId, { active: true, overlay: false });
        return { ok: true, changed: true, message: `${label} applied.` };
      }

      if (typeof actor.toggleStatusEffect === "function") {
        await actor.toggleStatusEffect(statusId, { active: true, overlay: false });
        return { ok: true, changed: true, message: `${label} applied.` };
      }

      return { ok: false, message: `${label} could not be applied by this Foundry version.` };
    } catch (error) {
      console.error(`Failed to apply ${label} to ${actor.name}`, error);
      return { ok: false, message: `${label} failed: ${error.message}` };
    }
  }

  const targets = Array.from(game.user.targets);
  if (!targets.length) {
    return ui.notifications.warn("Target at least one token first.");
  }

  const immobilizedId = findStatusId(["immobilized", "immobile"]);
  const shreddedId = findStatusId(["shredded", "shred"]);

  const rows = [];

  for (const target of targets) {
    const targetName = target.actor?.name ?? target.name;
    const immobilized = await ensureStatus(target, immobilizedId, "Immobilized");
    const shredded = await ensureStatus(target, shreddedId, "Shredded");

    const parts = [immobilized.message, shredded.message];
    const tone = immobilized.ok && shredded.ok ? "#7ec8e3" : "#ff9b9b";

    rows.push(`
      <div style="margin:6px 0;padding:6px 8px;border:1px solid #444;border-radius:4px;">
        <div style="color:#ddd;font-weight:bold;">${targetName}</div>
        <div style="color:${tone};font-size:0.9em;">${parts.join(" | ")}</div>
      </div>`);
  }

  await ChatMessage.create({
    content: `
      <div style="border:1px solid #8b1a1a;border-radius:4px;padding:10px;background:#110000;">
        <div style="color:#ff6060;font-weight:bold;font-size:1.1em;margin-bottom:6px;">
          Apply Immobilized + Shredded
        </div>
        ${rows.join("")}
      </div>`
  });
})();
```
