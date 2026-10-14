const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const heard=[],nodes=[];class FakeAudio{constructor(src){this.src=src;this.paused=true;this.volume=1;nodes.push(this);}play(){this.paused=false;if(this.volume>0)heard.push(this.src.split('/').pop().replace('.mp3',''));return Promise.resolve();}pause(){this.paused=true;}}
const elements=new Map();class El{constructor(){this.dataset={};this.style={setProperty(){}};const c=new Set;this.classList={toggle(k,on){if(on)c.add(k);else c.delete(k)},remove(...k){k.forEach(x=>c.delete(x))},add(...k){k.forEach(x=>c.add(x))},contains(k){return c.has(k)}};this.value='';this.checked=false;this.disabled=false;this.children=[];}querySelector(k){this.parts??={};return this.parts[k]??=new El;}getAttribute(k){return k==='src'?'assets/combat/audio/test.mp3':null;}appendChild(x){this.children.push(x)}remove(){}addEventListener(){}setAttribute(){}replaceChildren(...x){this.children=x;}set innerHTML(s){this.html=s;}get innerHTML(){return this.html;}click(){if(!this.disabled)this.onclick?.();}}
const get=id=>{if(!elements.has(id))elements.set(id,new El);return elements.get(id)};get('pattern').value='normal';get('nodes').value='0';get('enemy').src='assets/enemy-dummy.png';const events={};let now=0,callback;let resolvePreload;const engine={Track:FakeAudio,ready:true,unlock(){this.ready=true;return Promise.resolve()},suspend(){this.ready=false},preload(){return new Promise(r=>resolvePreload=r)},retain(){},status(){return {}}};const context={setTimeout:()=>0,BattleAudio:engine,Audio:FakeAudio,document:{getElementById:get,createElement:()=>new El,activeElement:{tagName:'BODY'},hidden:false},window:{},innerWidth:1440,innerHeight:1150,addEventListener(type,fn){(events[type]??=[]).push(fn)},requestAnimationFrame:f=>(callback=f,1),cancelAnimationFrame(){callback=null;},performance:{now:()=>now},Math,JSON};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../combat-safari.js'),'utf8').replace('window.combatSnapshot=', 'window.testAPI={get:()=>s,startUltimateImpact,tickUltimateImpact,playUltimateMovie,clearUltimateMovie,select:()=>{selected=[0];},start,reset,showAudioGate,hideAudioGate,roster,execute,attack,next,beginCharge,releaseCharge,cancelCharge,render,tag,tick,takeHit,actorModifiers,clearDomainVisual,tickDomainVisual,domainImages,activateDomain,domainRemaining,expireDomains,recordDomain,domainRules,enterAction,gradeResult,tickSfx};window.combatSnapshot='),context);const state=()=>context.window.combatSnapshot();const step=(ms)=>{for(let t=0;t<ms;t+=20){now+=20;const cb=callback;callback=null;cb?.(now);}};function start(pattern){get('reset').click();get('pattern').value=pattern;get('start').click();step(2880);}let tests=0;function check(fn){fn();tests++;}




const api=context.window.testAPI;
(async()=>{
 api.select();api.start();const s=api.get();assert.equal(s.phase,'LOADING');step(2000);assert.equal(s.phase,'LOADING');assert.equal(heard.length,0);
 resolvePreload();await Promise.resolve();await Promise.resolve();step(700);assert.equal(s.phase,'BGM_WAIT');assert.ok(heard.includes('test'));
 api.showAudioGate('test');const before=s.elapsed,phase=s.phase,ap=s.ap;step(1000);api.attack('attack');api.next();assert.equal(s.elapsed,before);assert.equal(s.phase,phase);assert.equal(s.ap,ap);
 api.reset();assert.equal(get('safari-audio-gate').hidden,true);assert.equal(api.get().running,false);
 // Pointer capture termination must release exactly once and suppress the synthetic click.
 const st=api.get();st.party=[api.roster.findIndex(m=>m.id==='canon')];st.active=0;st.running=true;st.phase='ENGAGE';st.canAct=true;st.ap=4;api.render();
 const button=get('skill');button.disabled=false;let prevented=0;const event={pointerId:7,button:0,isPrimary:true,preventDefault(){prevented++}};
 button.onpointerdown(event);assert.equal(st.charging,true);st.chargeElapsed=1000;
 button.onpointerup(event);assert.equal(st.charging,false);const after=st.ap;
 button.onlostpointercapture(event);button.onclick(event);assert.equal(st.ap,after);assert.ok(prevented>=2);
 const video=get('ultimate-video');let loads=0;video.load=()=>loads++;video.pause=()=>{};video.play=()=>Promise.resolve();api.render();const prepared=video.src;api.playUltimateMovie('canon',()=>{});assert.equal(video.src,prepared);assert.equal(loads,0);api.clearUltimateMovie();
 // Exact original phase thresholds, one completion, no image-src swap at burst.
 for(const [id,first] of [['canon',250],['haru',250],['koyomi',600]]){
  let complete=0;api.startUltimateImpact(id,()=>complete++);const firstSrc=get('ultimate-impact-image').src,secondSrc=get('ultimate-impact-image-next').src;
  assert.equal(get('ultimate-impact-image').hidden,false);assert.equal(get('ultimate-impact-image-next').hidden,true);
  api.tickUltimateImpact(first-1);assert.equal(get('ultimate-impact-image-next').hidden,true);
  api.tickUltimateImpact(1);assert.equal(get('ultimate-impact-image').hidden,true);assert.equal(get('ultimate-impact-image-next').hidden,false);
  assert.equal(get('ultimate-impact-image').src,firstSrc);assert.equal(get('ultimate-impact-image-next').src,secondSrc);
  api.tickUltimateImpact(1830-first);assert.equal(complete,1);assert.equal(api.get().ultimateImpact,null);
 }
 // A reset during deferred video completion must not launch stale effects.
 api.playUltimateMovie('canon',()=>{throw new Error('stale movie callback')});video.onended();api.reset();
 await Promise.resolve();await Promise.resolve();step(40);assert.ok(!api.get().ultimateImpact);
 console.log('PASS: ultimate layers/timing/reset cancellation; prepared ultimate reuse; hold release once / ghost-click suppression; actual combat boot; loading waits for audio; BGM starts after battle screen; recovery gate freezes timer/actions; reset clears gate');
})().catch(e=>{console.error(e);process.exitCode=1;});

