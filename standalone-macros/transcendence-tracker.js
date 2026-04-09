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
