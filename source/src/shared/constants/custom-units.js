export const CUSTOM_UNITS = Object.freeze({
    SACHET: "sachet",
    PINCH: "pinch",
});

export const UNIT_OPTIONS = Object.freeze([
    "gram",
    "kilogram",
    "milligram",
    "sachet",
    "ounce",
    "poundmass",
    "litre",
    "decilitre",
    "centilitre",
    "millilitre",
    "teaspoon",
    "tablespoon",
    "fluidounce",
    "cup",
    "quart",
    "gallon",
    "drop",
    "pinch",
]);

export const UNIT_LABELS = Object.freeze([
    "g",
    "kg",
    "mg",
    "sachet",
    "oz",
    "lb",
    "L",
    "dL",
    "cL",
    "mL",
    "tsp",
    "tbsp",
    "floz",
    "cp",
    "qt",
    "gal",
    "goutte",
    "pincée",
]);

/** Meta Bind `inlineSelect` option arguments for ingredient unit pickers. */
export function buildUnitSelectDeclarationArguments() {
    return [
        { name: "option", value: [""] },
        ...UNIT_OPTIONS.map((unit, index) => ({
            name: "option",
            value: [unit, UNIT_LABELS[index]],
        })),
    ];
}
