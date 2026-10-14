const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const heard=[],nodes=[];class FakeAudio{constructor(src){this.src=src;this.paused=true;this.volume=1;nodes.push(this);}play(){this.paused=false;if(this.volume>0)heard.push(this.src.split('/').pop().replace('.mp3',''));return Promise.resolve();}pause(){this.paused=true;}}
const elements=new Map();class El{constructor(){this.dataset={};this.style={setProperty(){}};const c=new Set;this.classList={toggle(k,on){if(on)c.add(k);else c.delete(k)},remove(...k){k.forEach(x=>c.delete(x))},add(...k){k.forEach(x=>c.add(x))},contains(k){return c.has(k)}};this.value='';this.checked=false;this.disabled=false;this.children=[];}querySelector(k){this.parts??={};return this.parts[k]??=new El;}getAttribute(k){return k==='src'?'assets/combat/audio/test.mp3':null;}appendChild(x){this.children.push(x)}remove(){}addEventListener(type,fn){(this.listeners??={})[type]=fn;}setAttribute(){}replaceChildren(...x){this.children=x;}set innerHTML(s){this.html=s;}get innerHTML(){return this.html;}click(){if(!this.disabled)this.onclick?.();}}
const get=id=>{if(!elements.has(id))elements.set(id,new El);return elements.get(id)};get('pattern').value='normal';get('nodes').value='0';get('enemy').src='assets/enemy-dummy.png';const events={};let now=0,callback;let resolvePreload;const engine={Track:FakeAudio,ready:true,unlock(){this.ready=true;return Promise.resolve()},suspend(){this.ready=false},preload(){return new Promise(r=>resolvePreload=r)},retain(){},status(){return {}}};const context={setTimeout:()=>0,clearTimeout:()=>{},BattleAudio:engine,Audio:FakeAudio,document:{getElementById:get,createElement:()=>new El,activeElement:{tagName:'BODY'},hidden:false},window:{},innerWidth:1440,innerHeight:1150,addEventListener(type,fn){(events[type]??=[]).push(fn)},requestAnimationFrame:f=>(callback=f,1),cancelAnimationFrame(){callback=null;},performance:{now:()=>now},Math,JSON};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../combat-safari.js'),'utf8').replace('window.combatSnapshot=', 'window.testAPI={get:()=>s,sceneReady:()=>sceneReady,prepareBattleScene,scheduleHitVisual,tickHitVisual,liveHitEffects,tickChargeSound,battleRules,startUltimateImpact,tickUltimateImpact,playUltimateMovie,clearUltimateMovie,select:()=>{selected=[0];},start,reset,showAudioGate,hideAudioGate,roster,execute,attack,next,beginCharge,releaseCharge,cancelCharge,render,tag,tick,takeHit,actorModifiers,clearDomainVisual,tickDomainVisual,domainImages,activateDomain,domainRemaining,expireDomains,recordDomain,domainRules,enterAction,gradeResult,tickSfx};window.combatSnapshot='),context);const state=()=>context.window.combatSnapshot();const step=(ms)=>{for(let t=0;t<ms;t+=20){now+=20;const cb=callback;callback=null;cb?.(now);}};function start(pattern){get('reset').click();get('pattern').value=pattern;get('start').click();step(2880);}let tests=0;function check(fn){fn();tests++;}






const api=context.window.testAPI;
function setup(id){api.reset();const s=api.get();s.party=[api.roster.findIndex(m=>m.id===id)];s.active=0;s.running=true;s.phase='ENGAGE';s.canAct=true;s.ap=6;api.render();heard.length=0;return s;}
(async()=>{
for(const [id,count,times] of [['canon',3,[130,650,150]],['koyomi',5,[200,570,110,110,110]]]){
 setup(id);get('scene').children=[];api.scheduleHitVisual('skill',2);let last=0;
 for(const dt of times){api.tickHitVisual(dt);const n=get('scene').children.filter(n=>n.className?.startsWith('hit ')).length;assert.ok(n>last);last=n;}
 assert.equal(last,count);assert.equal(new Set(get('scene').children).size,count);api.reset();assert.equal(api.liveHitEffects.length,0);
 setup(id);get('scene').children=[];api.scheduleHitVisual('skill',2);api.tickHitVisual(1200);assert.equal(get('scene').children.length,count);assert.equal(api.liveHitEffects.length,count);
}
const images=[];context.Image=class{constructor(){images.push(this)}set src(v){this.url=v;}decode(){return Promise.resolve();}};
setup('canon');api.prepareBattleScene();assert.equal(api.sceneReady(),false);assert.ok(images.some(i=>i.url.endsWith('battle-bg.png')));
images[0].onload();await Promise.resolve();await Promise.resolve();assert.equal(api.sceneReady(),false);
for(const im of images.slice(1))im.onload();for(let i=0;i<8;i++)await Promise.resolve();assert.equal(api.sceneReady(),true);
setup('anna');api.prepareBattleScene();const newImage=images.at(-1);api.reset();newImage.onload();for(let i=0;i<8;i++)await Promise.resolve();assert.equal(api.sceneReady(),false);
console.log('PASS: melee 3/ranged 5 independent hits at original times; multi-hit stalled frame; reset cleanup; background+actors decode gate; stale preparation ignored');

const vp=get('viewport');for(const type of ['touchmove','gesturestart','gesturechange','gestureend','dblclick']){let blocked=false;vp.listeners[type]({cancelable:true,preventDefault(){blocked=true;}});assert.equal(blocked,true);}
assert.ok(get('victory-screen').listeners.pointerup);assert.ok(get('victory-screen').listeners.dblclick);assert.ok(!get('log').listeners?.touchmove);
console.log('PASS: viewport gesture interception; victory pointer/doubleclick handlers retained; log scrolling not intercepted');
})().catch(e=>{console.error(e);process.exitCode=1;});
