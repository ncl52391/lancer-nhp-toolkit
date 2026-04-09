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
