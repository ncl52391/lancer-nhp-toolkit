# Standalone Macros

These macros are designed for use in a Lancer world without installing the `lancer-nhp-toolkit` module.

## How to use

1. In Foundry, create a new script macro.
2. Open one of the `.js` files in this folder.
3. Copy the full file contents into the macro.
4. Save the macro and add it to your hotbar.
5. Repeat for each macro you want to use.

## Included macros

- `memetic-spark.js`
- `transmuting-spark.js`
- `hurl-into-the-duat.js`
- `transcendence-tracker.js`

## Notes

- These macros use actor flags under the `lancer` scope to track Transcendence and OSIRIS gate state.
- The two spark macros use built-in chat buttons and register their shared damage handler once per session.
- They do not depend on the module or its assets.
- `Memetic Spark` and `Transmuting Spark` can apply damage from the chat card.
- `Hurl Into the Duat` uses a dialog to advance or reset the tracked OSIRIS gate.
- `Transcendence Tracker` uses a dialog to lower the die, reset it, enter Transcendence, or end it.
