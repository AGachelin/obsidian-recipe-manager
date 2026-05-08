function createDurationInput(target, defaultValues, mb) {
    const inputSecOptions = [...Array(60).keys()].map(i => `option(${i})`).join(', ');
    const inputMinOptions = [...Array(60).keys()].map(i => `option(${i})`).join(', ');
    const inputHourOptions = [...Array(24).keys()].map(i => `option(${i})`).join(', ');

    const inputSec = `\`INPUT[inlineSelect(defaultValue(${defaultValues[2]}), ${inputSecOptions}):memory^${target}["sec"]]\``;
    const inputMin = `\`INPUT[inlineSelect(defaultValue(${defaultValues[1]}), ${inputMinOptions}):memory^${target}["min"]]\``;
    const inputHour = `\`INPUT[inlineSelect(defaultValue(${defaultValues[0]}), ${inputHourOptions}):memory^${target}["hour"]]\``;

    const view = `\`VIEW[number({memory^${target}["hour"]} h, s)+number({memory^${target}["min"]} minute, s)+number({memory^${target}["sec"]} s, s)][math(hidden):${target}]\``;

    const durationLabel = getDurationLabel(target);

    return {
        input: `Durée de ${durationLabel} : ${inputHour}h ${inputMin}min ${inputSec}s ${view}`,
        view: `\`VIEW[splitTime({${target}}, false)]\``
    };
}

function getDurationLabel(target) {
    const labels = {
        'cook': 'cuisson',
        'rest': 'repos',
        'prep': 'préparation'
    };
    return labels[target] || target;
}

const durationUtils = {
    createDurationInput,
    getDurationLabel
};

export default durationUtils;
