const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/../combat-safari.js','utf8');
const handlers={};let now=1000,clicks=0,charge=false;
const root={addEventListener(k,f,o){(handlers[k]??=[]).push({f,o});},contains(b){return b===button||b===skill;}};
const button={disabled:false,click(){clicks++;}},skill={disabled:false,click(){throw Error('hold must not click');}};
vm.runInNewContext(src.slice(src.indexOf('// Battle touch guard:'),src.indexOf('window.mobileAudioStatus')),{ $:()=>root,skillButton:skill,chargeAvailable:()=>charge,performance:{now:()=>now}});
function fire(type,target=button,extra={}){const t={identifier:1,clientX:100,clientY:100};const e={target:{closest:()=>target},touches:[t],changedTouches:[t],cancelable:true,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};for(const h of handlers[type]||[])h.f(e);return e;}
for(let i=0;i<12;i++){fire('touchstart');assert(fire('touchend').prevented);now+=60;}
assert.equal(clicks,12);
assert(fire('click',button,{isTrusted:true,detail:1,pointerType:'touch'}).stopped);
assert(!fire('click',button,{isTrusted:false,detail:0}).stopped);
assert(!fire('click',button,{isTrusted:true,detail:1,pointerType:'mouse'}).stopped);
charge=true;fire('touchstart',skill);fire('touchend',skill);assert.equal(clicks,12);
fire('touchstart');fire('touchmove',button,{touches:[{identifier:1,clientX:150,clientY:100}]});fire('touchend');assert.equal(clicks,12);
fire('touchstart');fire('touchcancel');fire('touchend');assert.equal(clicks,12);
fire('touchstart',null);assert(!fire('touchend',null).stopped); // victory pointerup remains untouched
assert(src.includes("$('victory-screen').addEventListener?.('pointerup'"));
assert(!handlers.pointerup);assert(handlers.touchend[0].o.capture);assert.equal(handlers.touchend[0].o.passive,false);
console.log('PASS: 12 rapid taps, one click per tap, ghost click suppression, holds, drag/cancel, victory pointerup preserved');
