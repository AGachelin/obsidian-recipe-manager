import { CUSTOM_UNITS } from '../constants/custom_units.js';
import { FRONTMATTER } from '../constants/ingredient.js';

export function intializeMathUnits(mb) {
    return {
        clamp: (val, min, max) => val ? mb.mb.math.min(mb.mb.math.max(min, val), max) : null,
        bind: (val, min, default_val) => val ? (val > min ? val : default_val) : default_val,
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
        convertBack: (unit, value, name, nb_person) => {
            value = nb_person ? value * nb_person : value;
            if (unit == '' || unit == CUSTOM_UNITS.SACHET) {
                const target = mb.parseBindTarget(FRONTMATTER.SPECIFIC_WEIGHT, 'Ingredients/' + name);
                const coeff = mb.getMetadata(target);
                value = mb.mb.math.round(value / coeff, 2);
                if (unit == CUSTOM_UNITS.SACHET) {
                    return value > 1 ? value + ' sachets' : value + ' sachet';
                }
                else {
                    return value;
                }
            }
            else if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))) {
                const converted = mb.mb.math.round(mb.mb.math.unit(value, 'g').toNumber(unit), 2)
                return mb.mb.math.unit(converted, unit).toString();
            }
            else if (mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))) {
                const target = mb.parseBindTarget(FRONTMATTER.RHO, 'Ingredients/' + name);
                const coeff = mb.getMetadata(target);
                const converted = mb.mb.math.round(mb.mb.math.unit(value / coeff, 'ml').toNumber(unit), 2)
                return mb.mb.math.unit(converted, unit).toString();
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
