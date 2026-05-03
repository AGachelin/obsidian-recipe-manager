function inputField(target, default_val){
    const inputSecOptions = [ ...Array(60).keys() ].map( i => `option(${i})`).join(', ');
    const inputSec = `\`INPUT[inlineSelect(defaultValue(`+ default_val[2]+`), `+ inputSecOptions + `):`+'memory^'+target+`["sec"]]\``;
    const inputMin = `\`INPUT[inlineSelect(defaultValue(`+ default_val[1]+`), `+ inputSecOptions + `):`+'memory^'+target+`["min"]]\``;
    const inputHourOptions = [ ...Array(24).keys() ].map( i => `option(${i})`).join(', ');
    const inputHour = `\`INPUT[inlineSelect(defaultValue(`+ default_val[0]+`), `+ inputHourOptions + `):`+'memory^'+target+`["hour"]]\``;
    const view = `\`VIEW[number({memory^`+target+`["hour"]} h, s)+number({memory^`+target+`["min"]} minute, s)+number({memory^`+target+`["sec"]} s, s)][math(hidden):`+target+`]\``;
    let type;
    switch(target){
        case "cook":
        type = "cuisson";
        break;
        case "rest":
        type = "repos";
        break;
        case "prep":
        type = "préparation";
        break;
        default:
        type = '';
        break;
    }
    return 'Durée de '+type+' : '+inputHour + 'h' + inputMin + 'min' + inputSec + 's' + view;
}
export default inputField;