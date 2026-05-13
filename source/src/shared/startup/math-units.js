import { CUSTOM_UNITS } from '../constants/custom_units.js';
import { FRONTMATTER } from '../constants/ingredient.js';

/**
 * @param {unknown} mb Meta Bind API (`engine.getPlugin('obsidian-meta-bind-plugin').api`)
 */
export function convertBackAmount(mb, unit, value, name) {
    if (!name) {
        const n = typeof value === "number" ? value : Number(value);
        return Number.isFinite(n) ? n : 0;
    }
    if (unit == '' || unit == CUSTOM_UNITS.SACHET) {
        const target = mb.parseBindTarget(FRONTMATTER.SPECIFIC_WEIGHT, "Ingredients/" + name);
        const coeff = mb.getMetadata(target);
        const c = Number(coeff);
        if (!Number.isFinite(c) || c === 0) {
            return typeof value === "number" ? value : Number(value);
        }
        return mb.mb.math.round(value / c, 2);
    }
    if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))) {
        return mb.mb.math.round(mb.mb.math.unit(value, 'g').toNumber(unit), 2);
    }
    if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit("ml"))) {
        const target = mb.parseBindTarget(FRONTMATTER.RHO, "Ingredients/" + name);
        const coeff = mb.getMetadata(target);
        const c = Number(coeff);
        if (!Number.isFinite(c) || c === 0) {
            return mb.mb.math.round(mb.mb.math.unit(value, "ml").toNumber(unit), 2);
        }
        return mb.mb.math.round(mb.mb.math.unit(value / c, "ml").toNumber(unit), 2);
    }
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
}

export function intializeMathUnits(mb) {
    return {
        clamp: (val, min, max) =>
            val === undefined || val === null || val === ""
                ? null
                : mb.mb.math.min(mb.mb.math.max(min, val), max),
        /**
         * Coerce a numeric bind target: reject non-finite and values `<= min`, otherwise return `val`.
         * Treats `null`, `undefined`, `''`, and non-numeric as `default_val`.
         */
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
            if(!name){
                return;
            }
            if(unit==''||unit==CUSTOM_UNITS.SACHET){
                const target = mb.parseBindTarget(FRONTMATTER.SPECIFIC_WEIGHT, 'Ingredients/'+name);
                const coeff = mb.getMetadata(target);
                const c = Number(coeff);
                if (!Number.isFinite(c)) {
                    return value;
                }
                return value * c;
            }
            else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))){
                return mb.mb.math.unit(value, unit).toNumber('g');
            }
            else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))){
                const target = mb.parseBindTarget(FRONTMATTER.RHO, 'Ingredients/'+name);
                const coeff = mb.getMetadata(target);
                const c = Number(coeff);
                if (!Number.isFinite(c)) {
                    return mb.mb.math.unit(value, unit).toNumber('ml');
                }
                return mb.mb.math.unit(value, unit).toNumber('ml')*c;
            }
        },
        convertBackAmount: (unit, value, name) => convertBackAmount(mb, unit, value, name),
        convertBackDisplay: (unit, amount, name, nb_person) => {
            amount = convertBackAmount(mb, unit, amount, name);
            const scale = Number(nb_person);
            amount = Number.isFinite(scale) && scale > 0 ? amount * scale : amount;
            if (unit == '' || unit == CUSTOM_UNITS.SACHET) {
                if (unit == CUSTOM_UNITS.SACHET) {
                    return amount > 1 ? amount + ' sachets' : amount + ' sachet';
                }
                else {
                    return amount;
                }
            }
            else if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))) {
                return mb.mb.math.unit(amount, unit).toString();
            }
            else if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))) {
                return mb.mb.math.unit(amount, unit).toString();
            }
            return amount !== undefined && amount !== null && `${amount}` !== "" ? String(amount) : "";
        },
        splitTime: (value, raw) => {
            const u = mb.mb.math.unit(value, 's');
            if (raw) {
                return u.splitUnit(['h', 'min', 's']).map((val) => val.value)
            }
            else {
                return u.splitUnit(['h', 'min', 's']).map((val) => val.value == 0 ? '' : val.toString()).join(' ');
            }
        }
    }
}
