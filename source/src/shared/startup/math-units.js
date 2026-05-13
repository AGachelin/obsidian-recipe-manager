import { CUSTOM_UNITS } from '../constants/custom_units.js';
import { FRONTMATTER } from '../constants/ingredient.js';

/**
 * @param {unknown} mb Meta Bind API (`engine.getPlugin('obsidian-meta-bind-plugin').api`)
 */
export function convertBackAmount(mb, unit, value, name) {
    if (unit == '' || unit == CUSTOM_UNITS.SACHET) {
        const target = mb.parseBindTarget(FRONTMATTER.SPECIFIC_WEIGHT, 'Ingredients/' + name);
        const coeff = mb.getMetadata(target);
        return mb.mb.math.round(value / coeff, 2);
    }
    if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))) {
        return mb.mb.math.round(mb.mb.math.unit(value, 'g').toNumber(unit), 2);
    }
    if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))) {
        const target = mb.parseBindTarget(FRONTMATTER.RHO, 'Ingredients/' + name);
        const coeff = mb.getMetadata(target);
        return mb.mb.math.round(mb.mb.math.unit(value / coeff, 'ml').toNumber(unit), 2);
    }
}

export function intializeMathUnits(mb) {
    return {
        clamp: (val, min, max) => val ? mb.mb.math.min(mb.mb.math.max(min, val), max) : null,
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
                return value * coeff;
            }
            else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))){
                return mb.mb.math.unit(value, unit).toNumber('g');
            }
            else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))){
                const target = mb.parseBindTarget(FRONTMATTER.RHO, 'Ingredients/'+name);
                const coeff = mb.getMetadata(target);
                return mb.mb.math.unit(value, unit).toNumber('ml')*coeff;
            }
        },
        convertBackAmount: (unit, value, name) => convertBackAmount(mb, unit, value, name),
        convertBackDisplay: (unit, amount, name, nb_person) => {
            amount = convertBackAmount(mb, unit, amount, name);
            amount = nb_person ? amount * nb_person : amount;
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
