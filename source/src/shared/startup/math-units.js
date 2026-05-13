import { CUSTOM_UNITS } from "../constants/custom_units.js";
import { INGREDIENT_NOTEBOOK } from "../constants/recipe.js";

function numericValue(value) {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
}

function ingredientCoeff(mb, key, name) {
    const t = mb.parseBindTarget(key, `Ingredients/${name}`);
    return Number(mb.getMetadata(t));
}

export function convertBackAmount(mb, unit, value, name) {
    if (!name) {
        return numericValue(value);
    }
    if (unit === "" || unit === CUSTOM_UNITS.SACHET) {
        const c = ingredientCoeff(mb, INGREDIENT_NOTEBOOK.SPECIFIC_WEIGHT, name);
        if (!Number.isFinite(c) || c === 0) {
            return numericValue(value);
        }
        return mb.mb.math.round(value / c, 2);
    }
    if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit("g"))) {
        return mb.mb.math.round(mb.mb.math.unit(value, "g").toNumber(unit), 2);
    }
    if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit("ml"))) {
        const c = ingredientCoeff(mb, INGREDIENT_NOTEBOOK.RHO, name);
        if (!Number.isFinite(c) || c === 0) {
            return mb.mb.math.round(mb.mb.math.unit(value, "ml").toNumber(unit), 2);
        }
        return mb.mb.math.round(mb.mb.math.unit(value / c, "ml").toNumber(unit), 2);
    }
    return numericValue(value);
}

export function initializeMathUnits(mb) {
    return {
        clamp: (val, min, max) =>
            val === undefined || val === null || val === ""
                ? null
                : mb.mb.math.min(mb.mb.math.max(min, val), max),
        bind: (val, min, default_val) => {
            if (val === undefined || val === null || val === "") {
                return default_val;
            }
            const n = typeof val === "number" ? val : Number(val);
            if (!Number.isFinite(n) || n <= min) {
                return default_val;
            }
            return n;
        },
        convert: (unit, value, name) => {
            if (!name) {
                return;
            }
            if (unit === "" || unit === CUSTOM_UNITS.SACHET) {
                const c = ingredientCoeff(mb, INGREDIENT_NOTEBOOK.SPECIFIC_WEIGHT, name);
                if (!Number.isFinite(c)) {
                    return value;
                }
                return value * c;
            }
            if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit("g"))) {
                return mb.mb.math.unit(value, unit).toNumber("g");
            }
            if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit("ml"))) {
                const c = ingredientCoeff(mb, INGREDIENT_NOTEBOOK.RHO, name);
                if (!Number.isFinite(c)) {
                    return mb.mb.math.unit(value, unit).toNumber("ml");
                }
                return mb.mb.math.unit(value, unit).toNumber("ml") * c;
            }
        },
        convertBackAmount: (unit, value, name) => convertBackAmount(mb, unit, value, name),
        convertBackDisplay: (unit, amount, name, nb_person) => {
            amount = convertBackAmount(mb, unit, amount, name);
            const scale = Number(nb_person);
            amount = Number.isFinite(scale) && scale > 0 ? amount * scale : amount;
            if (unit === "" || unit === CUSTOM_UNITS.SACHET) {
                if (unit === CUSTOM_UNITS.SACHET) {
                    return amount > 1 ? `${amount} sachets` : `${amount} sachet`;
                }
                return amount;
            }
            if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit("g"))) {
                return mb.mb.math.unit(amount, unit).toString();
            }
            if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit("ml"))) {
                return mb.mb.math.unit(amount, unit).toString();
            }
            return amount !== undefined && amount !== null && `${amount}` !== "" ? String(amount) : "";
        },
        splitTime: (value, raw) => {
            const u = mb.mb.math.unit(value, "s");
            if (raw) {
                return u.splitUnit(["h", "min", "s"]).map((x) => x.value);
            }
            return u
                .splitUnit(["h", "min", "s"])
                .map((x) => (x.value === 0 ? "" : x.toString()))
                .join(" ");
        },
    };
}
