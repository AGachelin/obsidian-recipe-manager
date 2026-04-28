```meta-bind-button
id: add-ingredient
style: default
label: add ingredient
hidden: false
actions:
  - type: updateMetadata
    bindTarget: ingredients
    evaluate: true
    value: 'x == null|[] ? [0,{id:0,name:"",amount:"",unit:""}] : [x[0]+1, ...x.slice(1), {id:x[0]+1,name:"",amount:"",unit:""}]'
  - type: sleep
    ms: 200
  - type: "insertIntoNote"
    line: selfStart+4
    value: "Templates/elements/ingredients"
    templater: true   
```