const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const heard=[],nodes=[];class FakeAudio{constructor(src){this.src=src;this.paused=true;this.volume=1;nodes.push(this);}play(){this.paused=false;if(this.volume>0)heard.push(this.src.split('/').pop().replace('.mp3',''));return Promise.resolve();}pause(){this.paused=true;}}
const elements=new Map();class El{constructor(){this.dataset={};this.style={setProperty(){}};const c=new Set;this.classList={toggle(k,on){if(on)c.add(k);else c.delete(k)},remove(...k){k.forEach(x=>c.delete(x))},add(...k){k.forEach(x=>c.add(x))},contains(k){return c.has(k)}};this.value='';this.checked=false;this.disabled=false;this.children=[];}querySelector(k){this.parts??={};return this.parts[k]??=new El;}getAttribute(k){return k==='src'?'assets/combat/audio/test.mp3':null;}focus(){}appendChild(x){this.children.push(x)}remove(){}addEventListener(){}setAttribute(){}replaceChildren(...x){this.children=x;}set innerHTML(s){this.html=s;}get innerHTML(){return this.html;}click(){if(!this.disabled)this.onclick?.();}}
const get=id=>{if(!elements.has(id))elements.set(id,new El);return elements.get(id)};get('pattern').value='normal';get('nodes').value='0';get('enemy').src='assets/enemy-dummy.png';const events={};let now=0,callback;let resolvePreload;const engine={Track:FakeAudio,ready:true,unlock(){this.ready=true;return Promise.resolve()},suspend(){this.ready=false},preload(){return new Promise(r=>resolvePreload=r)},retain(){},status(){return {}}};const context={setTimeout:()=>0,BattleAudio:engine,Audio:FakeAudio,document:{getElementById:get,createElement:()=>new El,activeElement:{tagName:'BODY'},hidden:false},window:{},innerWidth:1440,innerHeight:1150,addEventListener(type,fn){(events[type]??=[]).push(fn)},requestAnimationFrame:f=>(callback=f,1),cancelAnimationFrame(){callback=null;},performance:{now:()=>now},Math,JSON};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../combat-safari.js'),'utf8').replace('window.combatSnapshot=', 'window.testAPI={get:()=>s,mayoiGemIcon,grantShield,counter,hitAllyBP,allyBroken,critChance,directDamage,drawMayoiGem,gemModifiers,tickCharacterEffects,addMagicChain,domainEcho,applyHitEffects,partyBars,tickDamageNumbers,pauseBattle,resumeBattle,openPartySkills,closePartySkills,startUltimateImpact,tickUltimateImpact,playUltimateMovie,clearUltimateMovie,select:()=>{selected=[0];},start,reset,showAudioGate,hideAudioGate,roster,execute,attack,next,beginCharge,releaseCharge,cancelCharge,render,tag,tick,takeHit,actorModifiers,clearDomainVisual,tickDomainVisual,domainImages,activateDomain,domainRemaining,expireDomains,recordDomain,domainRules,enterAction,gradeResult,tickSfx,chooseEnemyMode,initEnemyRoster,resolveHit,hitBreak,stateFor,grantBuff,dealEnemyDamage,collectEffectRows,finish,tickEnemyReplacement,tickEnemyEffects,canRequest,consumeEffect};window.combatSnapshot='),context);const state=()=>context.window.combatSnapshot();const step=(ms)=>{for(let t=0;t<ms;t+=20){now+=20;const cb=callback;callback=null;cb?.(now);}};function start(pattern){get('reset').click();get('pattern').value=pattern;get('start').click();step(2880);}let tests=0;function check(fn){fn();tests++;}





const originalRandom=Math.random;Math.random=()=>.99;
const api=context.window.testAPI;
function setup(id='moa',count=3){api.reset();api.chooseEnemyMode(count);api.reset();const s=api.get();s.party=[api.roster.findIndex(m=>m.id===id)];s.active=0;s.running=true;s.phase='ENGAGE';s.canAct=true;s.ap=20;s.energy=[0];return s;}
let s=setup();assert.equal(s.enemies.length,3);assert.equal(s.enemyBP,200);
api.resolveHit('attack');assert.equal(s.enemyHP,98);assert.equal(s.enemyBP,180);assert.equal(s.enemies[1].hp,100);
s=setup('anna');api.resolveHit('attack');assert.equal(s.enemyBP,190);assert.equal(s.enemyHP,98);
api.grantBuff('anna','test',3,{strike:1});api.resolveHit('attack');assert.equal(s.enemyHP,96);assert.equal(s.enemyBP,170);
s=setup('moa');s.enemyEffects.fracture={stacks:1,turns:[5]};api.resolveHit('skill',1,2);assert.equal(s.enemyHP,91);assert.deepEqual(Array.from(s.damageNumbers,q=>q.delay),[200,520]);assert(!s.enemyEffects.fracture);assert.equal(s.enemies[1].hp,100);
assert(api.canRequest('ultimate'));api.stateFor('moa').ultCT=1;assert(!api.canRequest('ultimate'));
s=setup('koyomi');api.resolveHit('skill',1,1);assert(s.enemies.every(e=>Math.abs(e.hp-97.658)<.0001));assert.equal(s.enemyBP,180);assert.equal(s.enemies[1].bp,200);assert(s.enemies.every(e=>e.effects.fracture.stacks===1));
s=setup('sigrid');api.resolveHit('ultimate');assert(s.enemies.every(e=>Math.abs(e.hp-92.732)<.0001));assert.equal(s.enemies[1].bp,200);
s=setup('canon');api.resolveHit('skill',2);assert(s.enemies.every(e=>e.hp===100));s.enemyEffects.cherry={stacks:1};api.resolveHit('skill',2);assert(s.enemies.every(e=>Math.abs(e.hp-95.97)<.0001));assert(!s.enemyEffects.cherry);
s=setup('luna');api.resolveHit('ultimate');assert(s.enemies.every(e=>e.effects.chain.stacks===2));
s=setup('akina');assert.equal(api.stateFor('akina').fire,3);assert(api.collectEffectRows().some(r=>r.name==='그리스의 불'&&r.count===3));
s=setup('moa');s.enemyEffects.notice={stacks:1};api.resolveHit('ultimate');assert.equal(api.stateFor('moa').buffs.plunderCrit.crit,.15);assert.equal(s.enemyEffects.plunder.critReduction,.15);
// Each reserve retains HP, independent effects, and no arrival attack; combat locked throughout.
s=setup('koyomi');s.enemies[1].hp=31;s.enemies[2].hp=0;s.enemyHP=0;api.finish(true);assert(s.enemyTransition);assert(!s.victorySequence);assert(!api.canRequest('attack'));const oldHp=s.hp[0];
s.enemyTransition.audioDone=true;api.tickEnemyReplacement(1100);assert.equal(s.enemyTransition.stage,'gap');api.tickEnemyReplacement(650);assert.equal(s.enemyIndex,1);assert.equal(s.enemyHP,31);assert.equal(s.enemyBP,200);assert.equal(Object.keys(s.enemyEffects).length,0);assert(heard.includes('swapOnly'));api.tickEnemyReplacement(900);assert.equal(s.enemyTransition,null);assert.equal(s.hp[0],oldHp);assert.equal(s.phase,'ENGAGE');
s.enemyHP=0;api.finish(true);assert(s.victorySequence);assert.equal(s.victorySequence.stage,'logo');
api.reset();assert.equal(api.get().enemyTransition,null);assert.equal(api.get().enemyIndex,0);assert.equal(api.get().enemies.length,3);
s=setup('anna',1);assert.equal(s.enemies.length,1);api.resolveHit('attack');assert.equal(s.enemyHP,98);

s=setup('moa');for(let i=0;i<5;i++)api.hitBreak('skill');assert.equal(s.enemyBP,0);assert(s.enemyBroken);assert(s.breakRewardPending);assert.equal(s.enemies[1].bp,200);api.enterAction();assert.equal(s.ap,3);s.round=3;api.enterAction();assert.equal(s.enemyBP,200);
s=setup('moa');api.execute('ultimate',1,false,true);assert.equal(s.ap,19);assert.equal(api.stateFor('moa').ultCT,1);assert.equal(s.energy[0],0);
s=setup();s.enemyHP=0;api.finish(true);const transition=s.enemyTransition;api.tickEnemyReplacement(5000);assert.equal(s.enemyTransition.stage,'death');api.reset();transition.audioDone=true;api.tickEnemyReplacement(2000);assert.equal(api.get().enemyIndex,0);
// Round-end DoT: advance once, no double cooldown reduction.
s=setup('anna');s.enemyHP=.1;s.enemyEffects.burn={stacks:1,turns:[3]};api.stateFor('anna').ct=4;api.next();assert(s.enemyTransition.nextAction);assert.equal(api.stateFor('anna').ct,3);s.enemyTransition.audioDone=true;api.tickEnemyReplacement(1100);api.tickEnemyReplacement(650);api.tickEnemyReplacement(900);assert.equal(s.round,2);assert.equal(s.phase,'ACTION');assert.equal(api.stateFor('anna').ct,3);
s=setup('anna');s.enemies[0].baseCrit=.15;s.enemyEffects.plunder={stacks:1,critReduction:.15,turns:[7]};const rand=Math.random;Math.random=()=>.1;api.takeHit();assert.equal(s.hp[0],4350);delete s.enemyEffects.plunder;api.takeHit();assert.equal(s.hp[0],3050);Math.random=rand;
console.log('PASS single/multi, scopes, independent HP/BP/effects, role BP + strike, coefficient HP, fracture timing, CT-only ult, resources, plunder, enemy death/arrival locks and final victory');

const a=context.window.testAPI;a.reset();const st=a.get();st.running=true;st.phase='ACTION';st.party=[0,1];st.active=1;st.elapsed=321;st.ap=2;a.render();assert.equal(get('open-party-skills').hidden,false);a.openPartySkills();assert.equal(st.paused,true);assert.equal(get('pause-overlay').hidden,true);assert.equal(get('party-skills-panel').hidden,false);assert.match(get('party-skills-frame').src,/party=canon,moa&active=moa/);a.tick(now+5000);assert.equal(st.elapsed,321);assert.equal(st.ap,2);a.closePartySkills();assert.equal(st.paused,false);assert.equal(get('party-skills-panel').hidden,true);assert.equal(get('party-skills-shade').hidden,true);a.pauseBattle();assert.equal(get('open-party-skills').hidden,true);a.openPartySkills();assert.equal(get('party-skills-panel').hidden,true);assert.equal(st.paused,true);a.resumeBattle();a.openPartySkills();a.reset();assert.equal(get('party-skills-panel').hidden,true);assert.equal(state().running,false);console.log('PASS direct reader pauses without pause menu, freezes AP/timeline, closes/resumes, normal pause hides entry, reset clears');

// V147: exercise real battle functions with deterministic critical rolls.
Math.random=()=>.99;
function near(actual,expected){assert(Math.abs(actual-expected)<.002,`${actual} != ${expected}`);}
function ready(){const st=api.get();st.busy=0;st.poseTime=0;st.enemyTime=0;st.commands=[];st.apClearing=0;st.charging=false;}
function party(...ids){const st=api.get();st.party=ids.map(id=>api.roster.findIndex(m=>m.id===id));st.active=0;st.hp=ids.map(()=>5000);st.energy=ids.map(()=>0);}
s=setup('anna',1);api.grantBuff('anna','def',4,{defense:.12});api.takeHit();assert.equal(s.hp[0],4420);assert.equal(api.stateFor('anna').bp,80);
s=setup('nono',1);api.takeHit();assert.equal(s.hp[0],4457);
s=setup('anna',1);api.grantBuff('anna','def',4,{defense:.12,damageReduction:.15});api.takeHit();assert.equal(s.hp[0],4507);
s=setup('chikage',1);party('chikage','anna');api.execute('ultimate',1,false,true);assert.equal(api.stateFor('anna').shield,2670);assert.equal(api.stateFor('anna').shieldTurns,4);s.active=1;api.takeHit();assert.equal(s.hp[1],5000);assert.equal(api.stateFor('anna').shield,2090);assert.equal(api.stateFor('anna').bp,80);assert.match(api.partyBars(1),/width:41.8%/);
s=setup('doll',1);s.hp[0]=3600;api.takeHit();assert.equal(s.hp[0],2950);assert.equal(api.stateFor('doll').shield,1395);near(api.directDamage('skill',1,1).damage,3.3588);for(let i=0;i<5;i++)api.tickCharacterEffects();assert.equal(api.stateFor('doll').shield,0);assert.equal(api.stateFor('doll').buffs.earthPower.attack,.2);
for(const [pattern,hp,bp] of [['normal',650,20],['counter',850,35],['unavoidable',750,25],['assault',1000,40]]){s=setup('anna',1);s.pattern=pattern;api.takeHit();assert.equal(s.hp[0],5000-hp);assert.equal(api.stateFor('anna').bp,100-bp);}
for(const [grade,hp,bp] of [['PERFECT',85,5],['GOOD',255,10]]){s=setup('anna',1);s.phase='ACTION';s.pattern='counter';s.counterDuration=1000;s.safeStart=.45;s.safeEnd=.55;s.purpleStart=.3;s.purpleEnd=.7;s.elapsed=grade==='PERFECT'?500:350;get('counter-button').disabled=false;api.counter();assert.equal(s.hp[0],5000-hp);assert.equal(api.stateFor('anna').bp,100-bp);assert(s.autoAttackAfterParry);assert.equal(s.phase,'ENGAGE');}
s=setup('anna',1);party('anna','moa');s.round=3;api.stateFor('anna').bp=10;api.takeHit();assert.equal(api.stateFor('anna').bp,100);assert(api.allyBroken());assert.equal(api.stateFor('anna').breakUntil,4);assert(!api.canRequest('attack'));const apBefore=s.ap;api.execute('attack');assert.equal(s.ap,apBefore);ready();s.ap=0;api.tag(1);assert.equal(s.active,0);s.ap=1;api.tag(1);assert.equal(s.active,1);assert.equal(s.ap,0);assert.equal(s.enemyHP,100);assert(api.canRequest('attack')===false);ready();s.ap=4;api.tag(0);assert.equal(s.active,1);api.stateFor('moa').bp=43;api.next();assert.equal(s.round,4);assert(api.allyBroken('anna'));assert.equal(api.stateFor('moa').bp,43);api.next();assert.equal(s.round,5);assert(!api.allyBroken('anna'));assert.equal(api.stateFor('anna').bp,100);
// All broken progresses to recovery, without granting actions during the blocked round.
s=setup('anna',1);s.round=2;api.hitAllyBP(100);ready();s.advance=1500;api.tick(now+80);assert(s.allyBreakWait>0);for(let i=0;i<100;i++){now+=80;api.tick(now);}assert(s.round>=4);assert(!api.allyBroken());
// Low-HP GOOD must not schedule a dead character's automatic attack.
s=setup('anna',1);s.hp[0]=100;s.phase='ACTION';s.pattern='counter';s.counterDuration=1000;s.purpleStart=.3;s.purpleEnd=.7;s.safeStart=.45;s.safeEnd=.55;s.elapsed=350;get('counter-button').disabled=false;api.counter();assert(s.deathTransition);assert(!s.autoAttackAfterParry);
s=setup('anna',1);near(api.critChance('anna'),.25);Math.random=()=>.05;api.resolveHit('attack');assert.equal(s.enemyHP,96);assert(s.damageNumbers[0].critical);api.tickDamageNumbers(200);assert(get('damage-layer').children.some(n=>n.classList.contains('critical')));Math.random=()=>.99;
s=setup('mayoi',1);api.grantBuff('mayoi','nonoCrit',7,{crit:.15});api.stateFor('mayoi').gemBuffs.topaz=1;near(api.critChance('mayoi'),.50);for(let i=0;i<4;i++)api.drawMayoiGem();assert.equal(api.stateFor('mayoi').diamondTurns,1);near(api.directDamage('ultimate',1,1).damage,10.6704);api.tickCharacterEffects();assert.equal(api.stateFor('mayoi').diamondTurns,0);
s=setup('ren',3);for(let i=0;i<6;i++)api.applyHitEffects('skill',1,1);s.enemyIndex=1;api.applyHitEffects('skill',1,1);assert.equal(s.enemyHP,100);s.enemyIndex=0;api.resolveHit('skill',1,1);near(s.enemyHP,91.792);assert.equal(s.damageNumbers.length,2);assert(s.damageNumbers[1].delay-s.damageNumbers[0].delay>=320);
s=setup('canon',1);party('canon','liria','luna');api.addMagicChain(5);s.enemyEffects.cherry={stacks:1};api.grantBuff('luna','domainEcho',3,{echo:true});api.resolveHit('skill',2,1);api.domainEcho('skill');assert.deepEqual(Array.from(s.damageNumbers,q=>q.delay),[930,1250,1570]);
s=setup('souka',1);api.grantBuff('souka','domainEcho',3,{echo:true});api.domainEcho('skill');assert.equal(s.enemyHP,100);
s=setup('luna',1);api.grantBuff('luna','domainEcho',3,{echo:true});api.domainEcho('attack');assert.equal(s.enemyHP,100);api.domainEcho('skill');assert.equal(s.enemyHP,98);
s=setup('liria',1);api.stateFor('liria').chainConsumed=60;near(api.actorModifiers('liria').attack,.225);assert(api.collectEffectRows().some(r=>r.name==='마력 연쇄 누적 소모'&&r.detail.includes('22.5%')));
s=setup('nono',1);api.applyHitEffects('skill',1,1);assert.equal(api.stateFor('nono').light,2);api.applyHitEffects('skill',2,1);near(api.critChance('nono'),.40);api.applyHitEffects('ultimate',1,1);near(api.stateFor('nono').buffs.nonoUltimate.ultimateDamage,.32);
// Offensive charge intercepts blue even when conditional coefficient is zero; buff charge does not.
s=setup('canon',1);s.phase='ACTION';s.pattern='normal';s.elapsed=999;s.duration=1000;s.busy=500;api.beginCharge();s.chargeElapsed=1000;api.releaseCharge();assert.equal(s.phase,'ENGAGE');assert.equal(s.commands.length,1);const elapsed=s.elapsed;now+=80;api.tick(now);assert.equal(s.elapsed,elapsed);assert.equal(s.hp[0],5000);ready();api.execute('skill',2);assert.equal(s.hp[0],5000);
s=setup('nono',1);s.phase='ACTION';s.pattern='normal';api.execute('skill',1);assert.equal(s.phase,'ACTION');
console.log('PASS V147 shields/overlay, defense, patterns, parry grades, BP lock/recovery/swap, criticals, gem expiry, target-specific curse, delayed proc numbers, domains and charged intercept');
Math.random=originalRandom;

// V149: corrected guard/fracture ordering, display-only defenses, and yellow continuity.
Math.random=()=>.99;
s=setup('moa',1);s.enemyEffects.fracture={stacks:1,turns:[5]};api.resolveHit('tagSpecial');
assert(!s.enemyEffects.fracture);assert.equal(s.damageNumbers.length,1);
s=setup('moa',1);s.enemyEffects.fracture={stacks:1,turns:[5]};api.resolveHit('skill',1,2);
near(s.enemyHP,91);assert.equal(s.damageNumbers.length,2);
s=setup('doll',1);const noGuard=api.directDamage('ultimate',1,1).damage;
s.enemyEffects.guard={stacks:1};api.resolveHit('ultimate');near(100-s.enemyHP,noGuard);assert(!s.enemyEffects.guard);
s=setup('doll',1);s.enemyEffects.guard={stacks:2};api.resolveHit('ultimate');near(100-s.enemyHP,noGuard*.5);assert.equal(s.enemyEffects.guard.stacks,1);
s=setup('anna',1);s.enemyEffects.fracture={stacks:2,turns:[5,5]};
assert(api.collectEffectRows().some(r=>r.name==='파쇄'&&r.detail==='방어력 감소 2% · 피해 계산 미반영'));
api.stateFor('anna').breakUntil=2;assert(api.partyBars(0).includes('style="width:0%"'));
s=setup('mayoi',1);api.drawMayoiGem();api.tickCharacterEffects();assert.equal(api.stateFor('mayoi').gemCycle.length,1);
assert(api.mayoiGemIcon().includes('보석 수집')||api.mayoiGemIcon().includes('수집 진행 표시'));
s=setup('liria',1);api.addMagicChain(5);api.resolveHit('attack');
assert(api.collectEffectRows().some(r=>r.name==='마력 연쇄'&&r.count===4&&r.detail.includes('누적 소모 1회')));
// V150: yellow ACTION and failed ENGAGE reject domain without spending its offer.
for(const grade of ['PERFECT','GOOD','FAIL']){
 s=setup('canon',1);s.phase='ACTION';s.pattern='counter';s.counterDuration=1000;
 s.safeStart=.6;s.safeEnd=.7;s.purpleStart=.5;s.purpleEnd=.8;
 s.elapsed=grade==='PERFECT'?650:grade==='GOOD'?550:100;
 api.stateFor('canon').domainExpiresAt=4;api.render();
 const apBefore=s.ap;
 assert.equal(api.activateDomain('canon'),false);assert.equal(s.ap,apBefore);
 assert.equal(api.stateFor('canon').domainExpiresAt,4);assert(!s.domainVisual);
 api.counter();assert.equal(s.phase,'ENGAGE');ready();
 if(grade==='FAIL'){assert.equal(api.activateDomain('canon'),false);assert(!s.domainVisual);}
 else{assert.equal(api.activateDomain('canon'),true);assert(s.domainVisual);api.clearDomainVisual();
  api.stateFor('canon').domainExpiresAt=5;s.round++;api.enterAction();s.pattern='counter';s.apClearing=0;
  assert.equal(api.activateDomain('canon'),false);}
}
Math.random=originalRandom;
console.log('PASS V149: Moa skill-only bonus, guard before damage, BREAK black bar, fracture display, magic-chain balance, domain counter continuity');

// V152: counter input costs once; successful follow-up is free even at zero AP.
Math.random=()=>.99;
for(const [grade,elapsed] of [['PERFECT',500],['GOOD',350],['FAIL',100]]){
 s=setup('anna',1);s.ap=1;s.phase='ACTION';s.pattern='counter';s.counterDuration=1000;s.safeStart=.45;s.safeEnd=.55;s.purpleStart=.3;s.purpleEnd=.7;s.elapsed=elapsed;api.render();api.counter();assert.equal(s.ap,0);api.counter();assert.equal(s.ap,0);
 if(grade!=='FAIL'){assert(s.autoAttackAfterParry);ready();now+=20;api.tick(now);assert.equal(s.enemyHP,98);assert.equal(s.ap,0);assert(!s.autoAttackAfterParry);now+=20;api.tick(now);assert.equal(s.enemyHP,98);}else assert(!s.autoAttackAfterParry);
}
s=setup('anna',1);s.ap=0;s.phase='ACTION';s.pattern='counter';api.render();assert(get('counter-button').disabled);api.counter();assert.equal(s.phase,'ACTION');assert.equal(s.hp[0],5000);
s=setup('anna',1);assert.equal(s.enemies[0].baseCrit,.25);Math.random=()=>.249;api.takeHit();assert.equal(s.hp[0],3700);assert.equal(api.stateFor('anna').bp,80);
s=setup('anna',1);Math.random=()=>.25;api.takeHit();assert.equal(s.hp[0],4350);
s=setup('anna',1);s.enemyEffects.plunder={critReduction:.15};Math.random=()=>.11;api.takeHit();assert.equal(s.hp[0],4350);Math.random=()=>.09;api.takeHit();assert.equal(s.hp[0],3050);
Math.random=originalRandom;console.log('PASS V152 crit25%, enemy crit200%, plunder10%, counter AP1 once, free counterattack at AP0, AP0 rejection');

Math.random=()=>.99;
s=setup('anna',1);party('anna','moa','luna','liria');s.hp=[5000,0,5000,0];api.enterAction();assert.equal(s.ap,2);s.breakRewardPending=true;api.enterAction();assert.equal(s.ap,4);api.stateFor('luna').breakUntil=s.round+1;api.enterAction();assert.equal(s.ap,2);
s=setup('luna',1);api.stateFor('luna').breakUntil=2;api.applyHitEffects('skill',1,3);assert.equal(s.enemyHP,100);api.grantBuff('luna','domainEcho',3,{echo:true});api.domainEcho('skill');assert.equal(s.enemyHP,100);api.stateFor('luna').breakUntil=0;api.applyHitEffects('skill',1,3);assert.equal(s.enemyHP,99.5);api.domainEcho('skill');assert.equal(s.enemyHP,97.5);
s=setup('anna',1);api.grantShield('anna',.2,1);api.grantShield('anna',.1,4);assert.equal(api.stateFor('anna').shield,1000);assert.equal(api.stateFor('anna').shieldTurns,4);
Math.random=originalRandom;console.log('PASS V155 survivor AP, break reward, broken survivors counted, Luna BP lock on both procs, independent shield maxima');

// V157: one critical outcome per area action, including Canon's reserve override.
for(const [id,kind,level,stage] of [['koyomi','skill',1,1],['koyomi','tag',1,1],['sigrid','skill',2,1],['luna','ultimate',1,1],['souka','ultimate',1,1],['canon','skill',2,1],['canon','ultimate',1,1]]){
 for(const critical of [true,false]){
  s=setup(id,3);if(id==='canon')s.enemyEffects.cherry={stacks:1};
  let rolls=0;Math.random=()=>++rolls===1?(critical?.01:.99):(critical?.99:.01);
  api.resolveHit(kind,level,stage);
  for(let i=0;i<3;i++){const hit=s.damageNumbers.find(h=>h.enemyIndex===i);assert(hit,`${id} enemy ${i}`);assert.equal(hit.critical,critical,`${id} enemy ${i}`);}
  near(s.damageNumbers.find(h=>h.enemyIndex===0).amount,s.damageNumbers.find(h=>h.enemyIndex===1).amount);near(s.damageNumbers.find(h=>h.enemyIndex===1).amount,s.damageNumbers.find(h=>h.enemyIndex===2).amount);
 }
}
s=setup('koyomi',3);s.enemies[1].effects.guard={stacks:1};Math.random=()=>.01;api.resolveHit('skill',1,1);near(100-s.enemies[1].hp,(100-s.enemies[0].hp)/2);assert(s.damageNumbers.every(h=>h.critical));assert.equal(s.enemies[1].bp,200);
Math.random=originalRandom;console.log('PASS V157 all area targets share crit/noncrit; Canon override; per-target guard and reserve BP preserved');
