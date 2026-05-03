const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
mb.mb.math.createUnit('sachet', { definition: '1 gram', aliases: ['sachets'] });
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
    convertBack: (unit, value, name) => {
        if(unit==''||unit=='sachet'){
            const target = mb.parseBindTarget('single', 'Ingredients/'+name);
            const coeff = mb.getMetadata(target);
            value = value/coeff;
            if(unit=='sachet'){
                return value>1? value + ' sachets':value + ' sachet';
            }
            else{
                return value;
            }
        }
        else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('g'))){
            return mb.mb.math.unit(value, 'g').to(unit).toString();
        }
        else if(mb.mb.math.unit(unit).equalBase(mb.mb.math.unit('ml'))){
            const target = mb.parseBindTarget('liquid', 'Ingredients/'+name);
            const coeff = mb.getMetadata(target);
            return mb.mb.math.unit(value/coeff, 'ml').to(unit).toString();
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