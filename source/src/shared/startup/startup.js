const { initializeMathUnits } = await engine.importJs("source/src/shared/startup/math-units.js");
const { CUSTOM_UNITS } = await engine.importJs("source/src/shared/constants/custom-units.js");

const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;

mb.mb.math.createUnit(CUSTOM_UNITS.SACHET, { definition: "1 gram", aliases: ["sachets"] });
mb.mb.math.createUnit(CUSTOM_UNITS.PINCH, { definition: "0.0625 teaspoon", aliases: ["pinches"] });

const mathUnits = initializeMathUnits(mb);
await mb.mathJSImport(mathUnits);
