---
liquid: 1
single: 4
---
Rho : `INPUT[number(defaultValue(liquid)):memory^liquid]` `VIEW[bind({memory^liquid}, 0, 1)][math(hidden):liquid]`
Weight of one unit : `INPUT[number(defaultValue(1)):memory^single]` `VIEW[bind({memory^single}, 0, 1)][math(hidden):single]`