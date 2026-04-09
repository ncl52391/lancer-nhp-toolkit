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
