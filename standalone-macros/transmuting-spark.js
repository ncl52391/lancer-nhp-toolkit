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
