---
liquid: 1
single: 1
---
Rho : `INPUT[number(defaultValue(1)):liquid]`
Weight of one unit : `INPUT[number(defaultValue(1)):single]`
```js-engine
let check = await engine.importJs('check.js');
const mb = await engine.getPlugin('obsidian-meta-bind-plugin').api;
const bindTarget = await mb.parseBindTarget('liquid', context.file.path);
const bindTarget2 = await mb.parseBindTarget('single', context.file.path);
let comp = new obsidian.Component(component);
const reactive = await check.default(engine, comp, bindTarget);
const reactive2 = await check.default(engine, comp, bindTarget2);
return reactive, reactive2;
```


