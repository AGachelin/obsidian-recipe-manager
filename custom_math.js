const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
mb.mb.math.createUnit('sachet', { definition: '1 gram', aliases: ['sachets'] });
mb.mb.math.createUnit('pinch', { definition: '0.0625 teaspoon', aliases: ['pinches'] });
mb.mathJSImport({
    clamp: (val, min, max) => val?mb.mb.math.min(mb.mb.math.max(min, val), max):null,
    bind: (val, min, default_val) => val?(val>min?val:default_val):default_val,
    convert: (unit, value, name) => {
        if(unit==''||unit=='sachet'){
            const target = mb.parseBindTarget('single', 'Ingredients/'+name);
            const coeff = mb.getMetadata(target);
            return value*coeff;
        }
        else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))){
            return mb.mb.math.unit(value, unit).toNumber('g');
        }
        else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))){
            const target = mb.parseBindTarget('liquid', 'Ingredients/'+name);
            const coeff = mb.getMetadata(target);
            return mb.mb.math.unit(value, unit).toNumber('ml')*coeff;
        }
    },
    convertBack: (unit, value, name, nb_person) => {
        value=nb_person?value*nb_person:value;
        if(unit==''||unit=='sachet'){
            const target = mb.parseBindTarget('single', 'Ingredients/'+name);
            const coeff = mb.getMetadata(target);
            value = mb.mb.math.round(value/coeff, 2);
            if(unit=='sachet'){
                return value>1? value + ' sachets':value + ' sachet';
            }
            else{
                return value;
            }
        }
        else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))){
            const converted = mb.mb.math.round(mb.mb.math.unit(value, 'g').toNumber(unit), 2)
            return mb.mb.math.unit(converted, unit).toString();
        }
        else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))){
            const target = mb.parseBindTarget('liquid', 'Ingredients/'+name);
            const coeff = mb.getMetadata(target);
            const converted = mb.mb.math.round(mb.mb.math.unit(value/coeff, 'ml').toNumber(unit), 2)
            return mb.mb.math.unit(converted, unit).toString();
        }
    },
    splitTime: (value, raw) => {
        const u = mb.mb.math.unit(value, 's');
        if(raw){
            return u.splitUnit(['h', 'min', 's']).map((val) => val.value)
        }
        else{
            return u.splitUnit(['h', 'min', 's']).map((val) => val.value==0?'':val.toString()).join(' ');
        }
    }
});