const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const heard=[],nodes=[];class FakeAudio{constructor(src){this.src=src;this.paused=true;this.volume=1;nodes.push(this);}play(){this.paused=false;if(this.volume>0)heard.push(this.src.split('/').pop().replace('.mp3',''));return Promise.resolve();}pause(){this.paused=true;}}
const elements=new Map();class El{constructor(){this.dataset={};this.style={setProperty(){}};const c=new Set;this.classList={toggle(k,on){if(on)c.add(k);else c.delete(k)},remove(...k){k.forEach(x=>c.delete(x))},add(...k){k.forEach(x=>c.add(x))},contains(k){return c.has(k)}};this.value='';this.checked=false;this.disabled=false;this.children=[];}querySelector(k){this.parts??={};return this.parts[k]??=new El;}getAttribute(k){return k==='src'?'assets/combat/audio/test.mp3':null;}appendChild(x){this.children.push(x)}remove(){}addEventListener(){}setAttribute(){}replaceChildren(...x){this.children=x;}set innerHTML(s){this.html=s;}get innerHTML(){return this.html;}click(){if(!this.disabled)this.onclick?.();}}
const get=id=>{if(!elements.has(id))elements.set(id,new El);return elements.get(id)};get('pattern').value='normal';get('nodes').value='0';get('enemy').src='assets/enemy-dummy.png';const events={};let now=0,callback;let resolvePreload;const engine={Track:FakeAudio,ready:true,unlock(){this.ready=true;return Promise.resolve()},suspend(){this.ready=false},preload(){return new Promise(r=>resolvePreload=r)},retain(){},status(){return {}}};const context={setTimeout:()=>0,BattleAudio:engine,Audio:FakeAudio,document:{getElementById:get,createElement:()=>new El,activeElement:{tagName:'BODY'},hidden:false},window:{},innerWidth:1440,innerHeight:1150,addEventListener(type,fn){(events[type]??=[]).push(fn)},requestAnimationFrame:f=>(callback=f,1),cancelAnimationFrame(){callback=null;},performance:{now:()=>now},Math,JSON};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../combat-safari.js'),'utf8').replace('window.combatSnapshot=', 'window.testAPI={get:()=>s,tickChargeSound,battleRules,startUltimateImpact,tickUltimateImpact,playUltimateMovie,clearUltimateMovie,select:()=>{selected=[0];},start,reset,showAudioGate,hideAudioGate,roster,execute,attack,next,beginCharge,releaseCharge,cancelCharge,render,tag,tick,takeHit,actorModifiers,clearDomainVisual,tickDomainVisual,domainImages,activateDomain,domainRemaining,expireDomains,recordDomain,domainRules,enterAction,gradeResult,tickSfx};window.combatSnapshot='),context);const state=()=>context.window.combatSnapshot();const step=(ms)=>{for(let t=0;t<ms;t+=20){now+=20;const cb=callback;callback=null;cb?.(now);}};function start(pattern){get('reset').click();get('pattern').value=pattern;get('start').click();step(2880);}let tests=0;function check(fn){fn();tests++;}





const api=context.window.testAPI;
function setup(id){api.reset();const s=api.get();s.party=[api.roster.findIndex(m=>m.id===id)];s.active=0;s.running=true;s.phase='ENGAGE';s.canAct=true;s.ap=6;api.render();heard.length=0;return s;}
for(const [id,type] of [['canon','Melee'],['sigrid','Melee'],['nono','Ranged']]){
 const s=setup(id);api.beginCharge();assert.equal(s.charging,true,id);assert.equal(heard.filter(k=>k==='charge'+type+'Hold').length,1);
 const hum=nodes.findLast(a=>a.src.endsWith('/charge'+type+'Hold.mp3'));assert.equal(hum.loop,true);
 s.chargeElapsed=899;api.tickChargeSound();assert.equal(heard.includes('charge'+type+'Ready'),false);
 s.chargeElapsed=900;api.tickChargeSound();assert.equal(heard.filter(k=>k==='charge'+type+'Ready').length,1);assert.equal(hum.paused,true);assert.equal(hum.loop,false);
 s.chargeElapsed=1800;api.tickChargeSound();assert.equal(heard.filter(k=>k==='charge'+type+'Ready').length,1);
 api.releaseCharge();assert.equal(s.charging,false);
 setup(id);api.beginCharge();const early=nodes.findLast(a=>a.src.endsWith('/charge'+type+'Hold.mp3'));api.releaseCharge();assert.equal(early.paused,true);assert.equal(heard.includes('charge'+type+'Ready'),false);
 setup(id);api.beginCharge();api.reset();assert.ok(nodes.filter(a=>a.src.includes('Hold.mp3')).every(a=>a.paused));
}
let s=setup('anna');api.beginCharge();assert.equal(s.charging,false);assert.equal(heard.some(k=>k.startsWith('charge')),false);
for(const [id,first] of [['canon',250],['koyomi',600]]){setup(id);let done=0;api.startUltimateImpact(id,()=>done++);api.tickUltimateImpact(first-1);assert.equal(get('ultimate-impact-image-next').hidden,true);api.tickUltimateImpact(1);assert.equal(get('ultimate-impact-image-next').hidden,false);api.tickUltimateImpact(1830-first);assert.equal(done,1);}
console.log('PASS charge start/899ms/900ms/once/release/reset/non-charge; melee+ranged ultimate layers and timings');
