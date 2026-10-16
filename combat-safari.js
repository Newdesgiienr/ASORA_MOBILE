(() => {
'use strict';
const $=id=>document.getElementById(id);
function setText(id,value){const n=$(id),t=String(value);if(n.textContent!==t)n.textContent=t;}
function setHTML(id,value){const n=$(id);if(n._renderedHTML!==value){n._renderedHTML=value;n.innerHTML=value;}}
const sfxNames=['chargeMeleeHold','chargeMeleeReady','chargeRangedHold','chargeRangedReady','trialConcluded',...['nono','ren','luna','liria','mayoi','mai','moa','souka','shion','akina','anna','erin','sigrid','doll','chikage','canon','koyomi','haru'].map(id=>'domainVoice-'+id),'nonoBuff1','nonoBuff2','engageDamage','meleeUltimate','rangedUltimate','swapOnly','chikageDefense','enemyHit','break','death','meleeCharge','rangedCharge','yellow','perfect','good','bad','purple','assaultBlock','red','blue','domainReady','domainStart','domainEnd','meleeTag','rangedAttack','rangedTag','meleeAttack'];
const sfxPool={};let pendingSfx=[];
function soundNode(key){const list=sfxPool[key]||(sfxPool[key]=[]);let a=list.find(a=>a.paused||a.ended);if(!a){a=new BattleAudio.Track('assets/combat/audio/'+key+'.mp3');a.preload='auto';list.push(a);}return a;}
function playSfx(key,next){const a=soundNode(key);if(!a)return;const token=audioSession;a.onended=next?()=>{a.onended=null;if(token===audioSession)playSfx(next);}:null;a.volume=1;a.currentTime=0;a.play()?.catch(()=>{});}
function queueSfx(key,delay){pendingSfx.push({key,delay});}
function tickSfx(dt){for(const q of pendingSfx)q.delay-=dt;const ready=pendingSfx.filter(q=>q.delay<=0);pendingSfx=pendingSfx.filter(q=>q.delay>0);for(const q of ready)playSfx(q.key);}
const mobileMedia={};
function audioTrack(id){return mobileMedia[id]||(mobileMedia[id]=new BattleAudio.Track($(id).getAttribute('src')));}
let audioPrepared=false,audioPreparing=false,mobileBlocked=false,mobileVideo=null;
function showAudioGate(message){mobileBlocked=true;BattleAudio.suspend();$('safari-audio-gate').hidden=false;setText('safari-audio-message',message);$('battle').classList.add('safari-audio-hold');}
function hideAudioGate(){mobileBlocked=false;$('safari-audio-gate').hidden=true;$('battle').classList.remove('safari-audio-hold');last=performance.now();}
function primeBattleAudio(){
 const token=audioSession;audioPreparing=true;audioPrepared=false;
 setTimeout(()=>{if(token===audioSession&&!BattleAudio.ready)showAudioGate('오디오 준비가 지연되었습니다. 눌러서 다시 시도해주세요.');},8000);
 BattleAudio.unlock().catch(()=>{if(token===audioSession)showAudioGate('소리를 재생하려면 아래 버튼을 눌러주세요.');});
 const voices=s.party.map(n=>'domainVoice-'+roster[n].id),keys=sfxNames.filter(k=>!k.startsWith('domainVoice-')).concat(voices);
 const urls=[audioTrack('battle-bgm').src,audioTrack('trial-sound').src,...keys.map(k=>'assets/combat/audio/'+k+'.mp3')];
 BattleAudio.retain(urls);
 BattleAudio.preload(urls).then(()=>{if(token!==audioSession)return;audioPreparing=false;audioPrepared=true;if(!BattleAudio.ready)showAudioGate('소리를 켜고 전투를 시작해주세요.');}).catch(()=>{if(token!==audioSession)return;audioPreparing=false;showAudioGate('오디오를 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해주세요.');});
}
$('safari-audio-retry').onclick=()=>{
 const token=audioSession;
 const unlock=BattleAudio.unlock();
 if(mobileVideo){const pending=mobileVideo;mobileVideo=null;tryVideo(pending.video,pending.onFailure,pending.valid);}
 for(const v of pausedAudio.filter(a=>a?.tagName==='VIDEO'))v.play()?.catch(()=>showAudioGate('영상 재생을 다시 눌러주세요.'));
 unlock.then(()=>{if(token!==audioSession)return;if(!BattleAudio.ready)return;hideAudioGate();if(!audioPrepared&&!audioPreparing)primeBattleAudio();if(s.phase==='BGM_WAIT'&&audioTrack('battle-bgm').paused)startBattleAudio();if(s.paused)resumeBattle();}).catch(()=>showAudioGate('소리를 시작하지 못했습니다. 다시 눌러주세요.'));
};
function tryVideo(video,onFailure,valid){
 video.playsInline=true;video.setAttribute('playsinline','');
 video.play()?.catch(error=>{if(!valid())return;if(error?.name==='NotAllowedError'){mobileVideo={video,onFailure,valid};showAudioGate('영상을 소리와 함께 재생하려면 아래 버튼을 눌러주세요.');}else onFailure();});
}
addEventListener('battle-audio-interrupted',()=>{if((s?.running||s?.victorySequence&&s.victorySequence.stage!=='complete')&&!document.hidden)showAudioGate('오디오가 중단되었습니다. 눌러서 계속해주세요.');});
addEventListener('visibilitychange',()=>{if(!s?.running&&(!s?.victorySequence||s.victorySequence.stage==='complete'))return;
 if(document.hidden){if(s.running)pauseBattle();for(const id of ['ultimate-video','victory-video']){const v=$(id);if(!v.paused&&!v.ended){mobileVideo={video:v,onFailure:()=>{},valid:()=>true};v.pause();}}showAudioGate('돌아오셨습니다. 소리를 켜고 계속해주세요.');}
});

function attackSound(id,tag=false){const melee=tag?['moa','anna','sigrid','doll','erin','canon','nono']:['moa','anna','sigrid','doll','canon'];return (melee.includes(id)?'melee':'ranged')+(tag?'Tag':'Attack');}

const TRIAL_DELAY_MS=450;
let audioSession=0,bgmFailed=false,trialPriming=false;
function stopBattleAudio(){audioSession++;trialPriming=false;pendingSfx=[];for(const a of Object.values(sfxPool).flat()){a.onended=null;a.pause();a.currentTime=0;}for(const id of ['battle-bgm','trial-sound']){const a=audioTrack(id);if(a?.pause){a.pause();a.currentTime=0;}}}
function startBattleAudio(){const token=audioSession,bgm=audioTrack('battle-bgm');bgmFailed=false;bgm.loop=true;bgm.volume=.7;bgm.currentTime=0;bgm.play().catch(()=>{if(token===audioSession)showAudioGate('BGM 재생을 다시 시도해주세요.');});}

function playTrialSound(){const cue=audioTrack('trial-sound');trialPriming=false;if(cue?.play){cue.pause();cue.currentTime=0;cue.volume=1;cue.play()?.catch(()=>{});}}

const patterns={normal:{name:'일반 공격',color:'#58acff'},counter:{name:'카운터',color:'#ffe574'},unavoidable:{name:'대응 불가',color:'#ff515f'},assault:{name:'강습',color:'#b079ff'}};
const skills={attack:{cost:1,damage:2,energy:20,name:'일반 공격'},skill:{cost:1,damage:4,energy:35,name:'전투 스킬'},ultimate:{cost:1,damage:8,energy:0,name:'궁극기'}};
const metadata={"moa": {"element": "caelum", "role": "breaker", "rarity": "SSR", "name": "하나모리 모아"}, "anna": {"element": "caelum", "role": "attacker", "rarity": "SSR", "name": "안나 M. 바텐베르크"}, "koyomi": {"element": "caelum", "role": "sweeper", "rarity": "SSR", "name": "엔류 코요미"}, "sigrid": {"element": "caelum", "role": "sweeper", "rarity": "SR", "name": "시그리드 울브헤른"}, "akina": {"element": "caelum", "role": "attacker", "rarity": "SR", "name": "아키츠 아키나"}, "doll": {"element": "chaos", "role": "attacker", "rarity": "SSR", "name": "인형"}, "mayoi": {"element": "homines", "role": "breaker", "rarity": "SSR", "name": "케이코 마요이"}, "luna": {"element": "homines", "role": "anchor", "rarity": "SSR", "name": "미츠코에 루나"}, "erin": {"element": "homines", "role": "breaker", "rarity": "SR", "name": "타나카 에린"}, "mai": {"element": "homines", "role": "attacker", "rarity": "SR", "name": "아사쿠라 마이"}, "chikage": {"element": "homines", "role": "defender", "rarity": "SR", "name": "타카라베 치카게"}, "canon": {"element": "nox", "role": "sweeper", "rarity": "SSR", "name": "나가타니 카논"}, "souka": {"element": "nox", "role": "breaker", "rarity": "SSR", "name": "나츠메 소우카"}, "haru": {"element": "nox", "role": "attacker", "rarity": "SSR", "name": "카가미하라 하루"}, "ren": {"element": "nox", "role": "attacker", "rarity": "SR", "name": "시라누이 렌"}, "shion": {"element": "nox", "role": "breaker", "rarity": "SR", "name": "노와타리 시온"}, "liria": {"element": "lux", "role": "supporter", "rarity": "SR", "name": "후지와라 리리아"}, "nono": {"element": "terra", "role": "supporter", "rarity": "SR", "name": "하이바라 노노"}};
const characterAssets={"moa":{"standing":"assets/combat/character-visuals/moa/standing-normalized.png","attack":"assets/combat/character-visuals/moa/attack-normalized.png","ultimate":"assets/combat/character-visuals/moa/ultimate.png","inheritV57":false},"anna":{"standing":"assets/combat/character-visuals/anna/standing-normalized.png","attack":"assets/combat/character-visuals/anna/attack-normalized.png","ultimate":"assets/combat/character-visuals/anna/ultimate.png","inheritV57":false},"koyomi":{"standing":"assets/combat/character-visuals/koyomi/standing-normalized.png","attack":"assets/combat/character-visuals/koyomi/attack-normalized.png","ultimate":"assets/combat/character-visuals/koyomi/ultimate.png","inheritV57":false},"sigrid":{"standing":"assets/combat/character-visuals/sigrid/standing-normalized.png","attack":"assets/combat/character-visuals/sigrid/attack-normalized.png","ultimate":"assets/combat/character-visuals/sigrid/ultimate.png","inheritV57":false},"akina":{"standing":"assets/combat/character-visuals/akina/standing-normalized.png","attack":"assets/combat/character-visuals/akina/attack-normalized.png","ultimate":"assets/combat/character-visuals/akina/ultimate.png","inheritV57":false},"doll":{"standing":"assets/combat/character-visuals/doll/standing-normalized.png","attack":"assets/combat/character-visuals/doll/attack-normalized.png","ultimate":"assets/combat/character-visuals/doll/ultimate.png","inheritV57":false},"mayoi":{"standing":"assets/combat/character-visuals/mayoi/standing-normalized.png","attack":"assets/combat/character-visuals/mayoi/attack-normalized.png","ultimate":"assets/combat/character-visuals/mayoi/ultimate.png","inheritV57":false},"luna":{"standing":"assets/combat/character-visuals/luna/standing-normalized.png","attack":"assets/combat/character-visuals/luna/attack-normalized.png","ultimate":"assets/combat/character-visuals/luna/ultimate.png","inheritV57":false},"erin":{"standing":"assets/combat/character-visuals/erin/standing-normalized.png","attack":"assets/combat/character-visuals/erin/attack-normalized.png","ultimate":"assets/combat/character-visuals/erin/ultimate.png","inheritV57":false},"mai":{"standing":"assets/combat/character-visuals/mai/standing-normalized.png","attack":"assets/combat/character-visuals/mai/attack-normalized.png","ultimate":"assets/combat/character-visuals/mai/ultimate.png","inheritV57":false},"chikage":{"standing":"assets/combat/character-visuals/chikage/standing-normalized.png","attack":"assets/combat/character-visuals/chikage/attack-normalized.png","defense":"assets/combat/character-visuals/chikage/defense-normalized.png","ultimate":"assets/combat/character-visuals/chikage/ultimate.png","inheritV57":false},"canon":{"standing":"assets/combat/character-visuals/canon/standing-normalized.png","attack":"assets/combat/character-visuals/canon/attack-normalized.png","ultimate":"assets/combat/character-visuals/canon/ultimate.png","inheritV57":false},"souka":{"standing":"assets/combat/character-visuals/souka/standing-normalized.png","attack":"assets/combat/character-visuals/souka/attack-normalized.png","ultimate":"assets/combat/character-visuals/souka/ultimate.png","inheritV57":false},"haru":{"standing":"assets/combat/character-visuals/haru/standing-normalized.png","attack":"assets/combat/character-visuals/haru/attack-normalized.png","ultimate":"assets/combat/character-visuals/haru/ultimate.png","inheritV57":false},"ren":{"standing":"assets/combat/character-visuals/ren/standing-normalized.png","attack":"assets/combat/character-visuals/ren/attack-normalized.png","ultimate":"assets/combat/character-visuals/ren/ultimate.png","inheritV57":false},"shion":{"standing":"assets/combat/character-visuals/shion/standing-normalized.png","attack":"assets/combat/character-visuals/shion/attack-normalized.png","ultimate":"assets/combat/character-visuals/shion/ultimate.png","inheritV57":false},"liria":{"standing":"assets/combat/character-visuals/liria/standing-normalized.png","attack":"assets/combat/character-visuals/liria/attack-normalized.png","ultimate":"assets/combat/character-visuals/liria/ultimate.png","inheritV57":false},"nono":{"standing":"assets/combat/character-visuals/nono/standing-normalized.png","attack":"assets/combat/character-visuals/nono/attack-normalized.png","ultimate":"assets/combat/character-visuals/nono/ultimate.png","inheritV57":false}};
const roster=[['canon','카논'],['moa','하나모리 모아'],['erin','타나카 에린'],['mayoi','케이코 마요이'],['anna','안나 M. 바텐베르크'],['haru','하루'],['akina','아키나'],['chikage','치카게'],['doll','돌'],['koyomi','코요미'],['liria','리리아'],['luna','루나'],['mai','마이'],['nono','노노'],['ren','렌'],['shion','시온'],['sigrid','시그리드'],['souka','소우카']].map(([id,name])=>({id,...metadata[id],portrait:`cards/${id}.webp`,blocksAssault:['moa','erin'].includes(id),tagDefense:id==='chikage'}));
const filters={rarity:new Set(),element:new Set(),role:new Set()};
let selected=[],s,raf=0,last=0;const history=[];

// v74: mechanics-only trial; damage remains the existing placeholder.
const skillReference={"moa": {"skills": ["괴도의 지팡이술, 첫 번째", "괴도의 지팡이술, 두 번째"], "coefficients": [366.6, 400], "ct": [5, 5], "ultimate": "레핀 드 쥐스티스", "ultimateCoefficient": 734.3, "us": 1000, "tagCoefficient": 226.5, "tagSpecialCoefficient": 476.8, "tagSpecialCT": 5, "tagAttackCT": 0}, "koyomi": {"skills": ["염룡의 화염구", "염룡의 파도", "염룡의 소낙비"], "coefficients": [234.2, 225.1, 282.9], "ct": [9, 9, 9], "ultimate": "불사르는 염룡, 스바로지츠의 숨결이여!", "ultimateCoefficient": 589.9, "us": 3000, "tagCoefficient": 183, "tagAttackCT": 0}, "sigrid": {"skills": ["내리치는 번개", "몰아치는 폭풍우"], "coefficients": [[283.3, 360.9], 203.7], "ct": [5, 5], "chargeAP": [1, 1], "ultimate": "쇄도하는 라그나로크", "ultimateCoefficient": 415.5, "us": 2000, "tagCoefficient": 165, "chargeAPSource": "2026-10-07 사용자 정정 우선 (ZIP AP2 표기 대체)", "tagAttackCT": 0}, "akina": {"skills": ["아키나 특제 <그리스의 불>", "아키나 특제 드롭스", "즉석 충전"], "coefficients": [114.8, 125.2, 0], "ct": [1, 1, 5], "ultimate": "화학, 연금술, 그리고 폭발", "ultimateCoefficient": 639.1, "us": 2000, "tagCoefficient": 128.2, "tagAttackCT": 0}, "doll": {"skills": ["무명 찌르기 - 개", "연격"], "coefficients": [279.9, 279.9], "ct": [5, 5], "ultimate": "테룸 아르보리스", "ultimateCoefficient": 538, "us": 1000, "tagCoefficient": 208.5, "tagAttackCT": 0}, "anna": {"skills": ["번개 같은 찌르기", "번뜩이는 삼단베기", "정수리 낙하 베기"], "coefficients": [252.5, 255.2, 291.6], "ct": [5, 5, 5], "ultimate": "드라이파허 블리츠슈니트", "ultimateCoefficient": 391.2, "us": 2000, "tagCoefficient": 150, "tagAttackCT": 0}, "canon": {"skills": ["춤추는 무녀의 전투술"], "coefficients": [[177.4, 403]], "ct": [1], "chargeCT": [1, 5], "ultimate": "우구이스카구라의 춤사위", "ultimateCoefficient": 1024, "us": 2000, "tagCoefficient": 148.2, "tagAttackCT": 0}, "mayoi": {"skills": ["손에 잡히는 대로 빔", "한꺼번에 빔"], "coefficients": [142, 409.2], "ct": [1, 1], "ultimate": "카두케우스 루시스", "ultimateCoefficient": 444.6, "diamondUltimateCoefficient": 889.2, "us": 2000, "tagCoefficient": 171.7, "tagAttackCT": 0}, "erin": {"skills": ["빛의 울림", "연쇄 투척", "반짝반짝 볼"], "coefficients": [278.8, 278.8, 278.8], "ct": [5, 5, 5], "ultimate": "클리우 솔러시", "ultimateCoefficient": 657.6, "us": 1000, "tagCoefficient": 150.6, "tagSpecialCoefficient": 266.5, "tagSpecialCT": 6, "tagAttackCT": 0}, "chikage": {"skills": ["공간 제어 스크롤"], "coefficients": [[301.1, 0]], "ct": [5], "chargeAP": [1, 1], "ultimate": "아틀레트리아의 일격", "ultimateCoefficient": 0, "us": 2000, "tagCoefficient": 162.6, "tagDefenseCT": 10, "tagAttackCT": 0}, "luna": {"skills": ["겨울의 결정 : 빙결파동", "겨울의 결정 : 얼어붙은 발자국", "겨울의 결정 : 빙결폭발"], "coefficients": [372.8, 410, 475], "ct": [9, 9, 9], "ultimate": "레지아노이 피스탈레트", "ultimateCoefficient": 842.5, "us": 2000, "tagCoefficient": 163.5, "tagAttackCT": 0}, "mai": {"skills": ["아틀레트리아의 체술 : 전력 투창", "아틀레트리아의 체술 : 삼단 투창"], "coefficients": [[106.6, 224.4], [116.2, 224.4]], "ct": [5, 5], "chargeAP": [1, 1], "ultimate": "아틀레트리아의 일격", "ultimateCoefficient": 339.5, "us": 1000, "tagCoefficient": 134.7, "tagAttackCT": 0}, "souka": {"skills": ["열한번째 밤 : 임시보호 중인 이상한 고양이", "열한번째 밤 : 토끼굴 속으로", "열한번째 밤 : 빙결폭발"], "coefficients": [278.1, 0, 475], "ct": [5, 5, 9], "ultimate": "떠맡겨진 이상한 세계", "ultimateCoefficient": 303.9, "us": 3000, "tagCoefficient": 186.1, "tagAttackCT": 0}, "haru": {"skills": ["신이교주의적 연극 제의 : 스즈키 쨩, 돌격!", "신이교주의적 연극 제의 : 스즈키 쨩, 난타!"], "coefficients": [252.7, 252.7], "ct": [9, 9], "ultimate": "디오니시아의 광극, 개막!", "ultimateCoefficient": 537.7, "us": 2000, "tagCoefficient": 153, "tagAttackCT": 0}, "ren": {"skills": ["제압", "무력화"], "coefficients": [225.6, 252], "ct": [5, 5], "ultimate": "켄 아록의 검", "ultimateCoefficient": 872.5, "us": 2000, "tagCoefficient": 140.7, "tagAttackCT": 0}, "shion": {"skills": ["잠깐 빌리는 거야~", "한번에 팡!"], "coefficients": [0, 529.7], "ct": [5, 5], "ultimate": "가방 속의 폭풍", "ultimateCoefficient": 1014, "us": 3000, "tagCoefficient": 150, "tagAttackCT": 0}, "liria": {"skills": ["반짝임의 불꽃", "반짝임의 은총", "반짝임의 오선보"], "coefficients": [315, 0, 0], "ct": [9, 9, 9], "ultimate": "히미코의 무구 적", "ultimateCoefficient": 591.7, "us": 2000, "tagCoefficient": 153.4, "tagAttackCT": 0}, "nono": {"skills": ["조용하고 편안한 빛"], "coefficients": [[0, 0]], "ct": [5], "ultimate": "예구디엘의 응급조치", "ultimateCoefficient": 0, "us": 3000, "tagCoefficient": 195, "tagAttackCT": 0}};
const ENGAGE_WAIT_MS=1500;
const battleRules={ren:{stages:2,ct:5},shion:{stages:2,ct:5},liria:{stages:3,ct:9},nono:{stages:1,ct:5,chargeMs:900},luna:{stages:3,ct:9},mai:{stages:2,ct:5,chargeMs:900},souka:{stages:3,ct:5},haru:{stages:2,ct:9},anna:{stages:3,ct:5},canon:{stages:1,ct:1,chargeCT:{1:1,2:5},chargeMs:900},moa:{stages:2,ct:5},koyomi:{stages:3,ct:9},sigrid:{stages:2,ct:5,chargeMs:900,chargeStages:[1]},akina:{stages:3,ct:1},doll:{stages:2,ct:5},mayoi:{stages:2,ct:1},erin:{stages:3,ct:5},chikage:{stages:1,ct:5,chargeMs:900}};
function stateFor(id){return s.battleStates[id]||(s.battleStates[id]={stage:1,ct:0,fire:id==='akina'?3:0,tagCT:0,tagAttackCT:0,ultCT:0,gemCycle:[],gemBuffs:{},diamondTurns:0,buffs:id==='sigrid'?{berserk:{turns:6,attack:.166}}:{},shield:0,shieldTurns:0,dollTriggered:false,domainCount:0,timeTrace:0,curseApplied:0,plush:id==='shion'?1:0,basicCount:0,light:0,chainConsumed:0});}
function battleState(){return stateFor(activeMember().id);}
function projectedSkill(){const id=activeMember().id,r=battleRules[id],b={...battleState()};
 for(const k of s.commands){if(k!=='skill'||!r)continue;
  if(id==='akina'){if(b.stage===3){b.fire=3;b.stage=1;b.ct=5;}else{b.fire--;if(b.fire===0)b.stage=3;else if(b.stage===1)b.stage=2;else{b.stage=1;b.ct=1;}}}
  else{if(b.stage>=r.stages){b.ct=skillReference[id]?.ct[b.stage-1]??r.ct;b.stage=1;}else b.stage++;}
 }return b;}
function chargeAvailable(){const r=battleRules[activeMember().id];return !!r?.chargeMs&&(!r.chargeStages||r.chargeStages.includes(projectedSkill().stage))&&projectedSkill().ct===0;}
function actionCost(kind,level=1,stage=projectedSkill().stage){return kind==='skill'&&activeMember().id==='sigrid'&&level>=2?2:skills[kind].cost;}

function closeChain(id){const b=s.battleStates[id],r=battleRules[id];if(b&&r&&b.stage>1){b.ct=Math.max(b.ct,skillReference[id]?.ct[b.stage-2]??r.ct);b.stage=id==='akina'&&b.fire===0?3:1;}}
function renderBattleSkill(){
 const r=battleRules[activeMember().id],b=battleState();
 setHTML('skill-stages',r?Array.from({length:r.stages},(_,i)=>`<i class="${b.ct===0&&b.stage===i+1?'lit':''}">${['Ⅰ','Ⅱ','Ⅲ'][i]}</i>`).join(''):'');
 $('skill-ct').hidden=!r||b.ct===0;setText('skill-ct-value',b.ct);
 $('skill').classList.toggle('cooling',!!r&&b.ct>0);
 const showCharge=!!r?.chargeMs&&(!r.chargeStages||r.chargeStages.includes(b.stage));$('charge-arc').hidden=!showCharge;$('charge-arc').style.display=showCharge?'':'none';$('skill').classList.toggle('has-charge',showCharge);
 const doubleCost=activeMember().id==='sigrid'&&s.charging&&s.chargeElapsed>=900;$('skill-extra-cost').style.display=doubleCost?'block':'none';
 const progress=s.charging?Math.min(1,s.chargeElapsed/1800):0;
 const fill=$('charge-fill');fill.style.display=progress>0?'':'none';
 if(progress>0){const angle=(160+110*progress)*Math.PI/180,point=(radius,a)=>[60+radius*Math.cos(a),60+radius*Math.sin(a)].join(' '),start=160*Math.PI/180;
 fill.setAttribute('d',`M ${point(58.5,start)} A 58.5 58.5 0 0 1 ${point(58.5,angle)} L ${point(45.5,angle)} A 45.5 45.5 0 0 0 ${point(45.5,start)} Z`);}
 // Retained for diagnostics only; the fill is a closed shape, never a dashed stroke.
 fill.style.strokeDashoffset=String(100*(1-progress));
 $('skill').dataset.chargeLevel=s.charging?(s.chargeElapsed>=900?'2':'1'):'0';
 $('skill').classList.toggle('charge-ready',s.charging&&s.chargeElapsed>=900);
 $('scene').classList.toggle('charge-shake',!!s.charging);
 $('scene').classList.toggle('charge-shake-strong',s.charging&&s.chargeElapsed>=900);
 $('skill').setAttribute('aria-label',r?`전투 스킬 ${b.stage}단${b.ct?' · CT '+b.ct:''}${r.chargeMs?' · 길게 눌러 차지':''}`:'전투 스킬');
}
let chargeHum=null;
function stopChargeHum(){if(chargeHum){chargeHum.pause();chargeHum.currentTime=0;chargeHum.loop=false;chargeHum=null;}}
function beginChargeSound(){stopChargeHum();s.chargeSoundReady=false;const type=attackSound(activeMember().id)==='meleeAttack'?'Melee':'Ranged';s.chargeSoundType=type;
 chargeHum=soundNode('charge'+type+'Hold');if(chargeHum){chargeHum.loop=true;chargeHum.volume=1;chargeHum.currentTime=0;chargeHum.play()?.catch(()=>{});}}
function tickChargeSound(){if(!s.charging||s.chargeSoundReady||s.chargeElapsed<900)return;s.chargeSoundReady=true;stopChargeHum();playSfx('charge'+s.chargeSoundType+'Ready');}
function beginCharge(){if(mobileBlocked)return;if(s.charging||!chargeAvailable()||!canRequest('skill'))return;s.charging=true;s.chargeElapsed=0;beginChargeSound();render();}
function cancelCharge(){stopChargeHum();s.charging=false;s.chargeElapsed=0;}
function releaseCharge(){if(s.paused){if(s.charging)s.releaseAfterPause=true;return;}if(!s.charging)return;const level=s.chargeElapsed>=900&&!(activeMember().id==='sigrid'&&s.ap-reserved()<2)?2:1;cancelCharge();if(canRequest('skill',level)){const sounded=level===2&&activeMember().id!=='nono';if(sounded)playSfx(attackSound(activeMember().id).replace('Attack','Charge'));attack('skill',level,sounded);}render();}


const gemNames={ruby:'루비',topaz:'토파즈',emerald:'에메랄드'};
function drawMayoiGem(){const b=stateFor('mayoi');
 if(b.gemCycle.length===3){b.gemCycle=[];b.diamondTurns=1;b.gemBuffs={};log('마요이 · 다이아몬드 (1R)');}
 else{const choices=Object.keys(gemNames).filter(k=>!b.gemCycle.includes(k)),gem=choices[Math.floor(Math.random()*choices.length)];b.gemCycle.push(gem);b.gemBuffs[gem]=1;log('마요이 · '+gemNames[gem]+' 획득');}
}
function gemModifiers(){const b=stateFor('mayoi'),all=b.diamondTurns>0;return {attack:all||b.gemBuffs.ruby>0?.2:0,crit:all||b.gemBuffs.topaz>0?.1:0,strike:all||b.gemBuffs.emerald>0?.2:0};}
function mayoiGemIcon(){const b=stateFor('mayoi'),diamond=b.diamondTurns>0,has=k=>diamond||b.gemCycle.includes(k),label=diamond?'다이아몬드':b.gemCycle.map(k=>gemNames[k]).join(', ')||'보석 없음';
 return `<span class="mayoi-gems ${diamond?'diamond':''}" role="img" aria-label="${label}" title="${label}"><svg viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="gem-r" x2=".6" y2="1"><stop stop-color="#fff2db"/><stop offset=".48" stop-color="#ff81a8"/><stop offset="1" stop-color="#a72969"/></linearGradient><linearGradient id="gem-t" x2=".7" y2="1"><stop stop-color="#ffffdd"/><stop offset=".5" stop-color="#f9e96f"/><stop offset="1" stop-color="#b9972a"/></linearGradient><linearGradient id="gem-e" x2=".5" y2="1"><stop stop-color="#ecfff1"/><stop offset=".5" stop-color="#71e7aa"/><stop offset="1" stop-color="#238b66"/></linearGradient><linearGradient id="gem-d" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".3" stop-color="#a5f1ff"/><stop offset=".65" stop-color="#eec5ff"/><stop offset="1" stop-color="#fffdd0"/></linearGradient></defs><circle cx="40" cy="40" r="38" fill="#111316" stroke="#272a2c" stroke-width="3"/><path d="M19 54A26 26 0 0 1 31 15M49 15A26 26 0 0 1 61 54M23 64L19 56M57 64L61 56" fill="none" stroke="#686966" stroke-width="3"/><path class="gem-leaf" d="M10 34L32 39L36 54L23 52Z" fill="${has('ruby')?'url(#'+(diamond?'gem-d':'gem-r')+')':'#3c4143'}"/><path class="gem-leaf" d="M40 10L48 36L40 49L32 36Z" fill="${has('topaz')?'url(#'+(diamond?'gem-d':'gem-t')+')':'#3c4143'}"/><path class="gem-leaf" d="M70 34L48 39L44 54L57 52Z" fill="${has('emerald')?'url(#'+(diamond?'gem-d':'gem-e')+')':'#3c4143'}"/><path d="M40 55L46 60L40 68L34 60Z" fill="${diamond?'#f5ffff':'#536062'}"/></svg></span>`;
}

const domainRules={ren:['skill',6,250],shion:['skill',4,250],liria:['skill',6,250],nono:['skill',3,250],luna:['skill',6,250],mai:['skill',12,250],souka:['skill',4,250],haru:['skill',4,250],moa:['skill',6,250],anna:['skill',9,250],canon:['skill',6,275],koyomi:['ultimate',2,250],sigrid:['skill',4,250],akina:['skill',10,250],doll:['ultimate',2,250],mayoi:['skill',8,250],erin:['skill',9,250],chikage:['skill',3,250]};
function grantBuff(id,key,turns,mods){stateFor(id).buffs[key]={turns,...mods};}
function actorModifiers(id){const b=stateFor(id),total={attack:0,strike:0,crit:0,skillDamage:0,ultimateDamage:0,defense:0};for(const buff of Object.values(b.buffs||{}))for(const k of Object.keys(total))total[k]+=buff[k]||0;if(id==='mayoi'){const g=gemModifiers();for(const k of Object.keys(g))total[k]+=g[k];}if(id==='nono')total.defense+=.198;if(id==='liria')total.attack+=.075*Math.min(3,Math.floor(b.chainConsumed/20));if(id==='haru')total.attack+=.05*Math.min(5,1+Math.floor((s.round-1)/10));return total;}
function grantUS(id,points){const index=s.party.findIndex(i=>roster[i].id===id),max=skillReference[id]?.us||2000;if(index>=0)s.energy[index]=Math.min(100,s.energy[index]+points/max*100);}
const DOMAIN_WINDOW_ROUNDS=3;
const domainImages={"nono": "assets/combat/domains/18_nono_domain.png", "liria": "assets/combat/domains/17_liria_domain.png", "canon": "assets/combat/domains/12_canon_domain.png", "anna": "assets/combat/domains/02_anna_domain.png", "koyomi": "assets/combat/domains/03_koyomi_domain.png", "ren": "assets/combat/domains/15_ren_domain.png", "doll": "assets/combat/domains/06_doll_domain.png", "moa": "assets/combat/domains/01_moa_domain.png", "chikage": "assets/combat/domains/11_chikage_domain.png", "akina": "assets/combat/domains/05_akina_domain.png", "haru": "assets/combat/domains/14_haru_domain.png", "souka": "assets/combat/domains/13_souka_domain.png", "luna": "assets/combat/domains/08_luna_domain.png", "shion": "assets/combat/domains/16_shion_domain.png", "mai": "assets/combat/domains/10_mai_domain.png", "erin": "assets/combat/domains/09_erin_domain.png", "mayoi": "assets/combat/domains/07_mayoi_domain.png", "sigrid": "assets/combat/domains/04_sigrid_domain.png"};
const domainImageOffsets={"moa": -4.880295, "anna": -5.128205, "koyomi": -5.165692, "sigrid": -4.586331, "akina": -5.060034, "doll": -3.256303, "mayoi": -4.666667, "luna": -4.856115, "erin": -5.089286, "mai": -3.752535, "chikage": -4.503676, "canon": -5.225225, "souka": -4.771372, "haru": -3.340292, "ren": -3.726708, "shion": -4.33925, "liria": -5.188679, "nono": -7.428571};
const DOMAIN_FADE_IN=300,DOMAIN_HOLD=450,DOMAIN_FADE_OUT=300;
function startDomainVisual(id){if(s.domainVisual){s.domainVisualQueue.push(id);return;}s.domainVisual={id,elapsed:0,impacted:false};const image=$('domain-cut-in-image');image.src=domainImages[id];image.style.transform='translateY('+(domainImageOffsets[id]||0)+'%)';image.alt=metadata[id].name+' 영지 선언';$('domain-cut-in').classList.remove('domain-exit');$('domain-cut-in').hidden=false;$('domain-cut-in').style.opacity='0';$('scene').classList.remove('domain-impact');}
function playDomainAudio(id){
 const v=s.domainVisual,token=audioSession;
 const valid=()=>token===audioSession&&s.domainVisual===v;
 function start(key,done){const a=soundNode(key);if(!a){done();return;}a.onended=()=>{a.onended=null;if(valid())done();};a.onerror=()=>{if(valid())done();};a.volume=1;a.currentTime=0;try{a.play()?.catch(()=>{if(valid())done();});}catch{if(valid())done();}}
 start('domainStart',()=>{v.startDone=true;});
 start('domainVoice-'+id,()=>{v.voiceDone=true;});
}
function tickDomainVisual(dt){const v=s.domainVisual;if(!v)return;v.elapsed+=dt;
 if(v.startDone&&!v.impacted){v.impacted=true;v.exitElapsed=0;pulse('scene','domain-impact');$('domain-cut-in').classList.add('domain-exit');}
 else if(v.impacted)v.exitElapsed+=dt;
 if(v.impacted&&v.exitElapsed>=280)$('domain-cut-in').hidden=true;
 if(!v.startDone)$('domain-cut-in').style.opacity=String(Math.min(1,v.elapsed/DOMAIN_FADE_IN));
 if(v.startDone&&v.voiceDone&&v.exitElapsed>=280){s.domainVisual=null;$('domain-cut-in').hidden=true;$('battle').classList.remove('domain-locked');}
}
function clearDomainVisual(){$('domain-cut-in').classList.remove('domain-exit');if(s){s.domainVisual=null;s.domainVisualQueue=[];}$('domain-cut-in').hidden=true;$('battle').classList.remove('domain-locked');$('scene').classList.remove('domain-impact');}

function domainRemaining(id){const b=stateFor(id);return b.domainExpiresAt?Math.max(0,b.domainExpiresAt-s.round):0;}
function recordDomain(kind){const id=activeMember().id,rule=domainRules[id],b=battleState();if(!rule||kind!==rule[0]||domainRemaining(id))return;if(++b.domainCount>=rule[1]){b.domainCount=0;b.domainExpiresAt=s.round+DOMAIN_WINDOW_ROUNDS;b.domainOffer=(b.domainOffer||0)+1;playSfx('domainReady');log(activeMember().name+' 영지 선언 가능 · 3R');}}
function expireDomains(){for(const [id,b] of Object.entries(s.battleStates)){if(b.domainExpiresAt&&s.round>=b.domainExpiresAt){b.domainExpiresAt=0;b.domainCount=0;log(metadata[id].name+' 영지 선언 기한 만료');}}}
function activateDomain(id){if(s.enemyTransition)return;if(mobileBlocked)return;if(s.domainVisual||s.busy||s.poseTime||s.enemyTime||s.paused||s.ultimateMovie||s.ultimateImpact)return false;const index=s.party.findIndex(n=>roster[n].id===id);if(s.deathTransition||!s.running||!['ACTION','ENGAGE'].includes(s.phase)||s.apClearing||s.charging||index<0||s.hp[index]<=0||!domainRemaining(id))return false;
 const b=stateFor(id),rule=domainRules[id];b.domainExpiresAt=0;b.domainCount=0;b.ct=0;b.ultCT=0;b.stage=id==='akina'&&b.fire===0?3:1;s.ap+=2;grantUS(id,rule[2]);if(id==='luna'||id==='souka')grantBuff(id,'domainEcho',3,{echo:true});s.advance=ENGAGE_WAIT_MS;s.lastDomain={character:id,round:s.round};startDomainVisual(id);$('battle').classList.add('domain-locked');playDomainAudio(id);log(metadata[id].name+' 영지 선언 · CT 초기화 / AP +2 / US +'+rule[2]);render();return true;
}
function renderDomains(){const host=$('domain-bars'),ready=s.party.map(n=>roster[n].id).filter(id=>domainRemaining(id)>0),signature=ready.map(id=>id+':'+stateFor(id).domainOffer).join('|');host.hidden=s.paused||!s.running||!['ACTION','ENGAGE'].includes(s.phase)||!ready.length;
 if(host.dataset.signature!==signature){host.dataset.signature=signature;host.replaceChildren(...ready.map(id=>{const row=document.createElement('div');row.className='domain-bar';row.characterId=id;row.innerHTML='<span class="domain-ribbon">영지 선언</span><button class="domain-orb" type="button"><img src="assets/combat/domain-emblem.svg" alt=""><span class="domain-clock"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 1h6v3H9zM17 4l2 2 2-2-2-2z"/><circle cx="12" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M11 7h2v8l-5-3 1-2 2 1z"/></svg><b></b></span></button>';const button=row.querySelector('button');button.onclick=()=>activateDomain(id);button.title=metadata[id].name+' 영지 선언';return row;}));}
 for(const row of host.children){const id=row.characterId,button=row.querySelector('button');button.disabled=!!s.enemyTransition||!!s.apClearing||s.charging;button.setAttribute('aria-label',metadata[id].name+' 영지 선언 · 남은 '+domainRemaining(id)+'라운드');row.querySelector('b').textContent=domainRemaining(id);}
}


// V139: enemy roster, action scopes and role-based break power.
let selectedEnemyCount=1;
const ENEMY_BP_MAX=200;
function initEnemyRoster(){
 s.enemyIndex=0;s.targetIndex=null;s.enemyTransition=null;
 s.enemies=Array.from({length:selectedEnemyCount},(_,index)=>({index,hp:100,bp:ENEMY_BP_MAX,effects:{},broken:false,breakUntil:0,baseCrit:0}));
 const fields={enemyHP:'hp',enemyBP:'bp',enemyEffects:'effects',enemyBroken:'broken',breakUntilRound:'breakUntil'};
 for(const [key,field] of Object.entries(fields))Object.defineProperty(s,key,{enumerable:true,configurable:true,get(){return this.enemies[this.targetIndex??this.enemyIndex][field];},set(v){this.enemies[this.targetIndex??this.enemyIndex][field]=v;}});
}
function enemyName(index=s.targetIndex??s.enemyIndex){return s.enemies?.length>1?'마네킹 '+(index+1):'마네킹';}
function withEnemy(index,fn){const old=s.targetIndex;s.targetIndex=index;try{return fn();}finally{s.targetIndex=old;}}
function allEnemiesDefeated(){return s.enemies.every(e=>e.hp<=0);}
function isAreaAttack(id,kind,level){
 if(id==='koyomi')return ['skill','ultimate','tag'].includes(kind);
 if(id==='sigrid')return ['skill','ultimate'].includes(kind);
 if(id==='luna')return ['ultimate','tag'].includes(kind);
 if(id==='souka')return kind==='ultimate';
 if(id==='canon')return !!s.enemyEffects.cherry&&(kind==='ultimate'||kind==='skill'&&level>=2);
 return false;
}
function directDamage(kind,level,stage){
 const coefficient=hitCoefficient(kind,level,stage),fallback=kind==='tag'||kind==='tagSpecial'?2:skills[kind]?.damage||0;
 let damage=coefficient===null?fallback:coefficient/100;
 const mods=actorModifiers(activeMember().id);
 damage*=(1+mods.attack)*(kind==='skill'?1+mods.skillDamage:kind==='ultimate'?1+mods.ultimateDamage:1);
 if(mods.crit>0&&Math.random()<Math.min(1,mods.crit))damage*=1.5;
 if(s.enemyEffects.guard)damage*=.5;
 return {coefficient,damage};
}
function applyAreaTargets(kind,level,stage){
 const id=activeMember().id;
 for(const enemy of s.enemies){if(enemy.index===s.enemyIndex||enemy.hp<=0)continue;
  withEnemy(enemy.index,()=>{
   const hit=directDamage(kind,level,stage);
   // Canon's area condition belongs to the primary target's mark, already checked before consumption.
   if(id==='canon'&&kind==='skill'&&level>=2){hit.coefficient=403;const mods=actorModifiers(id);hit.damage=4.03*(1+mods.attack)*(1+mods.skillDamage);if(mods.crit>0&&Math.random()<Math.min(1,mods.crit))hit.damage*=1.5;if(s.enemyEffects.guard)hit.damage*=.5;}
   dealEnemyDamage(hit.damage,(kind==='ultimate'?'궁극기':kind==='tag'?'태그 어택':'전투 스킬 '+stage+'단')+' · 전체 공격');
   if(id==='koyomi'&&kind==='skill'&&stage===1)addEffect('fracture',1,5,5);
   if(id==='sigrid'&&kind==='skill'&&stage===1&&level>=2)consumeEffect('fracture');
   if(id==='luna'&&kind==='ultimate'){for(let n=0;n<2;n++){addEffect('chain',1,4,3);if(s.enemyEffects.chain.stacks>=4){dealEnemyDamage(7.5,'연쇄 4중첩 추가 피해');delete s.enemyEffects.chain;}}}
  });
 }
}
function renderEnemyRoster(){
 const host=$('enemy-reserves');host.hidden=s.enemies.length<2;
 const signature=JSON.stringify([s.enemyIndex,s.enemies.map(e=>[e.hp,e.bp])]);if(host.dataset.signature===signature)return;host.dataset.signature=signature;
 host.replaceChildren(...s.enemies.filter(e=>e.index!==s.enemyIndex&&e.hp>0).map(e=>{
  const row=document.createElement('div');row.className='reserve-enemy';row.dataset.enemyIndex=e.index;row.setAttribute('aria-label',enemyName(e.index)+' · HP '+damageText(e.hp)+' / 100 · 브레이크 '+damageText(e.bp)+' / 200');
  row.innerHTML='<img src="assets/combat/mannequin-face.png" alt="'+enemyName(e.index)+'"><span class="reserve-hp"><i style="width:'+e.hp+'%"></i><b>'+damageText(e.hp)+'/100</b></span><span class="reserve-bp"><i style="width:'+(e.bp/2)+'%"></i></span>';
  return row;
 }));
}
function startEnemyReplacement(){
 if(s.enemyTransition)return true;
 const next=s.enemies.findIndex((e,i)=>i!==s.enemyIndex&&e.hp>0);if(next<0)return false;
 tickDamageNumbers(10000);clearLiveHitEffects();cancelCharge();clearPose();clearEnemy();s.poseTime=0;s.enemyTime=0;s.busy=0;s.hitFxQueue=[];s.victoryPending=false;s.autoAttackAfterParry=false;pendingSfx=[];
 $('scene').classList.remove('clash','assault-clash');$('projectile-fx').classList.remove('flying');
 $('enemy').hidden=false;pulse('enemy','enemy-death');pulse('enemy-death-fx','burst');$('scene').classList.add('enemy-fallen');
 const t=s.enemyTransition={stage:'death',next,elapsed:0,audioDone:false,failed:false};
 const a=soundNode('death'),token=audioSession,valid=()=>s.enemyTransition===t&&audioSession===token;
 if(a){a.currentTime=0;a.volume=1;a.onended=()=>{if(valid())t.audioDone=true;};a.onerror=()=>{if(valid())t.failed=true;};try{a.play()?.catch(()=>{if(valid())t.failed=true;});}catch{t.failed=true;}}else t.failed=true;
 log(enemyName()+' 전투 불능 · 다음 생존 적 대기','system');render();return true;
}
function tickEnemyReplacement(dt){
 const t=s.enemyTransition;if(!t)return;t.elapsed+=dt;
 if(t.stage==='death'){
  if(t.elapsed<1100||(!t.audioDone&&!t.failed))return;
  t.stage='gap';t.elapsed=0;$('enemy').hidden=true;return;
 }
 if(t.stage==='gap'){
  if(t.elapsed<650)return;
  s.enemyIndex=t.next;s.targetIndex=null;s.effectSignature=null;s.breakRest=false;s.breakFxTime=0;s.victoryOwner=null;
  $('enemy').classList.remove('enemy-death');$('enemy-death-fx').classList.remove('burst');$('scene').classList.remove('enemy-fallen','break-impact');$('enemy').hidden=false;
  playSfx('swapOnly');pulse('enemy','enemy-arrival');t.stage='arrival';t.elapsed=0;
  // A defeated ACTION opponent ends its action. No free enemy attack on entrance.
  s.phase='ENGAGE';s.canAct=true;s.elapsed=0;s.gradeTime=0;$('grade').hidden=true;
  log(enemyName()+' 출전 · 남은 HP '+damageText(s.enemyHP),'system');return;
 }
 if(t.elapsed>=900){$('enemy').classList.remove('enemy-arrival');s.enemyTransition=null;s.advance=ENGAGE_WAIT_MS;if(t.nextAction){s.round++;if((s.round-1)%3===0&&partyAlive('shion')){const b=stateFor('shion');b.plush=Math.min(4,b.plush+1);}enterAction();}log('적 교체 완료 · 전투 재개','system');}
}
function chooseEnemyMode(count){if(s.running)return;selectedEnemyCount=count;for(const n of [1,3])$('enemy-mode-'+n).setAttribute('aria-pressed',String(count===n));}
$('enemy-mode-1').onclick=()=>chooseEnemyMode(1);
$('enemy-mode-3').onclick=()=>chooseEnemyMode(3);

function damageFromCoefficient(coefficient,fallback){return coefficient/100;}
function damageText(n){return Number(n.toFixed(2)).toLocaleString('en-US',{maximumFractionDigits:2});}
function floatDamage(side,amount,enemyIndex=s.enemyIndex){
 if(amount<=0)return;const el=document.createElement('span');el.className='damage-float damage-target-'+side;el.textContent=damageText(amount);
 const reserve=side==='enemy'&&enemyIndex!==s.enemyIndex;
 if(reserve){const slot=s.enemies.filter(e=>e.index!==s.enemyIndex&&e.hp>0).findIndex(e=>e.index===enemyIndex);el.classList.add('reserve-damage');el.style.left='1760px';el.style.top=(90+Math.max(0,slot)*142)+'px';}
 $(reserve?'reserve-damage-layer':'damage-layer').appendChild(el);el.addEventListener?.('animationend',()=>el.remove(),{once:true});
}
function updateEngageDamage(){
 if(!s.engageDamage||s.phase!=='ENGAGE')return;
 $('engage-damage').hidden=false;setText('engage-damage-value',damageText(s.engageDamage));
 pulse('engage-damage','damage-pop');playSfx('engageDamage');
}
function tickDamageNumbers(dt){
 const due=[];s.damageNumbers=(s.damageNumbers||[]).filter(q=>{q.delay-=dt;if(q.delay<=0){due.push(q);return false;}return true;});
 let changed=false;for(const q of due){floatDamage(q.side,q.amount,q.enemyIndex);if(q.side==='enemy'&&q.round===s.round&&s.phase==='ENGAGE'){s.engageDamage=(s.engageDamage||0)+q.amount;changed=true;}}
 if(changed)updateEngageDamage();
}
function dealEnemyDamage(amount,reason="추가 피해",actor=activeMember().name,delay=200){
 const before=s.enemyHP;s.enemyHP=Math.max(0,Math.round((s.enemyHP-amount)*1000)/1000);
 if(before>0&&s.enemyHP===0&&allEnemiesDefeated()&&!s.victoryOwner)s.victoryOwner=activeMember().id;const actual=before-s.enemyHP;if(amount>0)log(reason+' → '+enemyName()+' · 피해 '+damageText(actual)+(amount>actual+.001?' (계산 피해 '+damageText(amount)+')':''),'ally',actor);if(actual>0)(s.damageNumbers||=[]).push({side:'enemy',enemyIndex:s.targetIndex??s.enemyIndex,amount:actual,round:s.round,delay});
}
function hitCoefficient(kind,level=1,stage=1){const id=activeMember().id,r=skillReference[id];if(!r)return null;
 if(id==='haru'&&(kind==='skill'||kind==='ultimate'))return (kind==='ultimate'?r.ultimateCoefficient:r.coefficients[stage-1])*((s.enemyEffects.curse?.stacks||0)>=10?2:1);
 if(id==='mai'&&kind==='skill'&&level===2)return 224.4+200*(s.enemyEffects.spear?.stacks||0);
 if(kind==='ultimate'&&id==='sigrid'&&stateFor('sigrid').buffs.berserk)return r.ultimateCoefficient+207.8;
 if(kind==='ultimate')return id==='mayoi'&&stateFor('mayoi').diamondTurns>0?r.diamondUltimateCoefficient:r.ultimateCoefficient;
 if(kind==='tag')return r.tagCoefficient;
 if(kind==='tagSpecial')return r.tagSpecialCoefficient??null;
 if(kind==='skill'){if(id==='canon'&&level===2&&!s.enemyEffects.cherry)return 0;const n=r.coefficients[stage-1];return Array.isArray(n)?n[level-1]:n;}
 return null;
}
const BLUE_PROJECTILE_IDS=new Set(['koyomi','chikage','luna','liria','souka']);
function scheduleHitVisual(kind,level=1){
 if(kind==='tagSpecial'||(kind==='ultimate'&&activeMember().id!=='chikage'))return; // The parry has its own clash VFX, not an attack projectile/slash.
 const id=activeMember().id,ranged=attackSound(id,kind==='tag').startsWith('ranged'),blue=BLUE_PROJECTILE_IDS.has(id);
 const combo=kind==='skill'&&level>=2&&!ranged,rangedCombo=kind==='skill'&&level>=2&&ranged;
 const delays=combo?[130,780,930]:rangedCombo?[200,770,880,990,1100]:[kind==='tag'?308:s.parryFollowHit?224:200];
 delays.forEach((delay,index)=>{s.hitFxQueue.push({delay,ranged,blue,comboIndex:combo?index:0});if(rangedCombo&&index>0)s.hitFxQueue.push({delay:delay-90,ranged,blue,launch:true});});
 if(ranged){$('projectile-fx').classList.toggle('blue-projectile',blue);$('projectile-fx').style.setProperty('--flight-ms',delays[0]+'ms');pulse('projectile-fx','flying');}
}
const liveHitEffects=[];
function clearLiveHitEffects(){for(const item of liveHitEffects)item.node.remove();liveHitEffects.length=0;}
function showHitEffect(f){const node=document.createElement('div');node.className='hit '+(f.ranged?'ranged-impact':'melee-impact')+(f.blue?' blue-impact':'')+' flash';node.setAttribute('aria-hidden','true');$('scene').appendChild(node);liveHitEffects.push({node,remaining:f.ranged?320:300});}
function tickHitVisual(dt){
 for(let i=liveHitEffects.length-1;i>=0;i--){const item=liveHitEffects[i];item.remaining-=dt;if(item.remaining<=0){item.node.remove();liveHitEffects.splice(i,1);}}
 for(const f of s.hitFxQueue)f.delay-=dt;const due=s.hitFxQueue.filter(f=>f.delay<=0).sort((a,b)=>a.delay-b.delay);s.hitFxQueue=s.hitFxQueue.filter(f=>f.delay>0);
 for(const f of due){if(f.launch){$('projectile-fx').classList.toggle('blue-projectile',f.blue);$('projectile-fx').style.setProperty('--flight-ms','90ms');pulse('projectile-fx','flying');continue;}
 if(f.ranged)$('projectile-fx').classList.remove('flying');showHitEffect(f);pulseBatch([...(f.comboIndex>0?[['ally','strike']]:[]),['enemy','hurt']]);}
}

function resolveHit(kind,level=1,stage=1){const damageQueueStart=(s.damageNumbers||[]).length;
 const area=isAreaAttack(activeMember().id,kind,level),{coefficient,damage}=directDamage(kind,level,stage);
 s.lastResolvedHit={character:activeMember().id,kind,stage,chargeLevel:level,coefficient,damage};
 if(damage>0){const label=kind==='skill'?'전투 스킬 '+stage+'단'+(battleRules[activeMember().id]?.chargeMs?' · 차지 '+level+'단계':''):(kind==='tag'||kind==='tagAttack')?'교체 자동 공격 · 태그 어택':kind==='tagSpecial'?'태그 스페셜':kind==='attack'&&s.parryFollowHit?'패링 후 일반 공격 자동 연계':skills[kind]?.name||kind;dealEnemyDamage(damage,label);hitBreak(kind==='tagSpecial'?'tag':kind);scheduleHitVisual(kind,level);consumeMagicChain();}
 if(area)applyAreaTargets(kind,level,stage);
 applyHitEffects(kind,level,stage);
 if(kind==='tagSpecial'){const hits=(s.damageNumbers||[]).splice(damageQueueStart);if(hits.length)s.damageNumbers.push({...hits[0],amount:hits.reduce((n,q)=>n+q.amount,0),delay:Math.round(1880*.05)});}
 if(kind==='skill'&&level>=2){const delay=attackSound(activeMember().id)==='meleeAttack'?930:1100;for(const q of (s.damageNumbers||[]).slice(damageQueueStart))q.delay=delay;}
}
function tickCharacterEffects(){if(s.magicChain){s.magicChain.turns=s.magicChain.turns.map(t=>t-1).filter(t=>t>0);if(!s.magicChain.turns.length)s.magicChain=null;}for(const b of Object.values(s.battleStates)){
 b.diamondTurns=Math.max(0,(b.diamondTurns||0)-1);
 for(const k of Object.keys(b.gemBuffs||{})){b.gemBuffs[k]--;if(b.gemBuffs[k]<=0)delete b.gemBuffs[k];}
 for(const [key,buff] of Object.entries(b.buffs||{})){if(buff.turns!==null&&--buff.turns<=0)delete b.buffs[key];}
 if(b.shieldTurns>0&&--b.shieldTurns===0)b.shield=0;
}}

function resize(){const headerHeight=document.querySelector?.('.site-header')?.getBoundingClientRect?.().height||76;const availableHeight=Math.max(1,(window.visualViewport?.height||innerHeight)-headerHeight-18-64-8-12);const scale=Math.max(.001,Math.min(Math.max(1,innerWidth-24)/1920,availableHeight/1080,1));const width=1920*scale+'px';$('viewport').style.width=width;$('battle-controls').style.width=width;$('battle-effect-strip').style.width=width;$('viewport').style.height=1080*scale+'px';$('battle').style.transform=`scale(${scale})`;}

addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);resize();
function log(msg,side='ally',actor){const labels={ally:'아군 행동',enemy:'적 행동',effect:'효과 변화',system:'진행'};const who=actor||(side==='ally'?activeMember().name:side==='enemy'?'마네킹':'');const t=`${s.round}R ${s.phase} · ${msg}`;history.unshift({round:s.round,phase:s.phase,msg,side,who});history.length=Math.min(history.length,120);if(side!=='effect')setText('status',t);$('log').replaceChildren(...history.flatMap((item,index)=>{const group=[];if(index===0||history[index-1].round!==item.round){const divider=document.createElement('li');divider.className='round-divider';divider.setAttribute('aria-label',item.round+'라운드');const badge=document.createElement('span');badge.textContent=item.round+'R';divider.replaceChildren(badge);group.push(divider);}const el=document.createElement('li');el.className='log-entry side-'+item.side;const meta=document.createElement('div');meta.className='log-meta';const badge=document.createElement('span');badge.className='log-badge side-'+item.side;badge.textContent=labels[item.side];const stamp=document.createElement('span');stamp.textContent=item.round+'R '+item.phase+(item.who?' · '+item.who:'');meta.replaceChildren(badge,stamp);const body=document.createElement('div');body.className='log-message';body.textContent=item.msg;el.replaceChildren(meta,body);return [...group,el];}));}
const allyEffectNames={berserk:'광전사의 혈통',domainEcho:'영지 추가 공격',liriaSkill:'전투 스킬 피해 증가',nonoCrit:'치명타 확률 증가',nonoUltimate:'궁극기 피해 증가',champion:'챔피언',timeStrike:'타격 강화',noticePower:'예고장 타격 강화',plunderCrit:'강탈 · 치명타 확률 +15%p',insight:'통찰',coolReason:'냉철한 이성',knighthood:'기사도',cherryCrit:'벚꽃 치명타 강화',tagGuard:'태그 디펜스',earthPower:'대지의 힘'};
function effectDuration(turns){if(Array.isArray(turns)){const n=[...turns].sort((a,b)=>a-b);return n.length?'중첩별 '+n.map(t=>t+'R').join(' · '):'종료';}return turns==null?'라운드 제한 없음':turns+'R 남음';}
function collectEffectRows(){const rows=[];for(const enemy of s.enemies){if(enemy.hp<=0)continue;for(const [id,e] of Object.entries(enemy.effects)){if(!e.stacks)continue;rows.push({key:'enemy:'+enemy.index+':'+id,side:'enemy',target:enemyName(enemy.index),name:enemyEffectNames[id]||id,type:id==='guard'?'버프':['cherry','notice','chain','spear'].includes(id)?'표식':'디버프',count:e.stacks,detail:id==='plunder'?'치명타 확률 -15%p':id==='fracture'?'방어력 감소 수치 보관 · 방어 공식 미적용':'',duration:effectDuration(e.turns)});}}
 const modNames={attack:'공격력',strike:'타격',crit:'치명타 확률',skillDamage:'전투 스킬 피해',ultimateDamage:'궁극기 피해',defense:'방어력',damageReduction:'받는 피해 감소'};
 for(const n of s.party){const m=roster[n],b=stateFor(m.id);for(const [key,v] of Object.entries(b.buffs||{})){const mods=Object.entries(modNames).filter(([k])=>v[k]).map(([k,label])=>label+' '+(v[k]>0?'+':'')+Number((v[k]*100).toFixed(1))+'%');if(v.echo)mods.push('조건 충족 시 추가 공격');rows.push({key:m.id+':'+key,side:'ally',target:m.name,name:allyEffectNames[key]||key,type:Object.keys(modNames).some(k=>v[k]<0)?'디버프':'버프',count:1,detail:mods.join(' · '),duration:effectDuration(v.turns)});}
 const resource=(key,name,count,max,detail='')=>rows.push({key:m.id+':resource:'+key,side:'ally',target:m.name,name,type:'고유 자원',count,detail:(max?'보유 '+count+' / '+max:'')+(detail?' · '+detail:''),duration:'라운드 제한 없음'});
 if(m.id==='akina')resource('fire','그리스의 불',b.fire,3,'1·2단 소모 / 3단 충전');
 if(m.id==='souka')resource('timeTrace','시간의 궤적',b.timeTrace||0,10,'궁극기 사용 시 소모');
 if(m.id==='shion')resource('plush','봉제인형',b.plush,4);
 if(m.id==='ren')resource('curseApplied','저주 부여 누적',b.curseApplied,7);
 if(m.id==='mayoi')resource('gemCycle','보석 수집',b.gemCycle.length,3,b.gemCycle.map(g=>gemNames[g]).join(' / '));
 if(m.id==='nono')rows.push({key:'nono:light',side:'ally',target:m.name,name:'테우르기스트의 빛',type:'고유 자원',count:b.light,detail:'궁극기 사용 시 전부 소모',duration:'라운드 제한 없음'});
 if(b.shield>0)rows.push({key:m.id+':shield',side:'ally',target:m.name,name:'보호막',type:'버프',count:1,detail:'잔량 '+Number(b.shield.toFixed(1)),duration:effectDuration(b.shieldTurns)});
 for(const [gem,turns] of Object.entries(b.gemBuffs||{}))if(turns>0)rows.push({key:m.id+':gem:'+gem,side:'ally',target:m.name,name:gemNames[gem]||gem,type:'버프',count:1,detail:'보석 효과',duration:effectDuration(turns)});
 if(b.diamondTurns>0)rows.push({key:m.id+':diamond',side:'ally',target:m.name,name:'다이아몬드',type:'버프',count:1,detail:'',duration:effectDuration(b.diamondTurns)});
 }
 if(s.magicChain?.turns.length)rows.push({key:'party:magicChain',side:'ally',target:'아군 공통',name:'마력 연쇄',type:'버프',count:s.magicChain.turns.length,detail:'',duration:effectDuration(s.magicChain.turns)});
 return rows;}
function renderEffectLedger(){const rows=collectEffectRows(),signature=JSON.stringify(rows);if(s.effectLedgerSignature===signature)return;s.effectLedgerSignature=signature;
 const next={};for(const row of rows){const value=JSON.stringify([row.count,row.detail]);next[row.key]={value,row};const prev=s.effectLedgerPrevious?.[row.key];if(s.running&&(!prev||prev.value!==value))log(row.name+' · '+(prev?'변경':'부여')+' · '+row.count+'중첩 · '+row.duration+(row.detail?' · '+row.detail:''),'effect',(row.side==='enemy'?'적 · ':'아군 · ')+row.target);}
 if(s.running)for(const [key,old] of Object.entries(s.effectLedgerPrevious||{}))if(!next[key])log(old.row.name+' · 종료 또는 소모','effect',(old.row.side==='enemy'?'적 · ':'아군 · ')+old.row.target);
 s.effectLedgerPrevious=next;
 for(const side of ['enemy','ally']){const items=rows.filter(row=>row.side===side);$(side+'-effect-list').replaceChildren(...(items.length?items.map(row=>{const el=document.createElement('div');el.className='effect-row';const title=document.createElement('strong');title.textContent=row.target+' · '+row.name;const badge=document.createElement('span');badge.className='effect-kind '+(row.type==='디버프'?'negative':'positive');badge.textContent=row.type+' · '+row.count+'중첩';const detail=document.createElement('small');detail.textContent=row.duration+(row.detail?' / '+row.detail:'');el.replaceChildren(title,badge,detail);return el;}):[(()=>{const el=document.createElement('p');el.className='effect-empty';el.textContent='적용 중인 효과 없음';return el;})()]));}
}
function pulseBatch(items){for(const [id,cls] of items)$(id).classList.remove(cls);void $('scene').offsetWidth;for(const [id,cls] of items)$(id).classList.add(cls);}
function pulse(id,cls){$(id).classList.remove(cls);void $(id).offsetWidth;$(id).classList.add(cls);}
function activeMember(){const rosterIndex=s?.party?.length?s.party[s.active]:(selected[0]??0);return roster[rosterIndex]||roster[0];}
function visualFor(m){return characterAssets[m?.id]||characterAssets.canon;}
function setAllyCharacter(){const m=activeMember();$('ally').dataset.character=m?.id||'canon';}
function setVisualSource(el,src){if(el.dataset.visualSrc!==src){el.dataset.visualSrc=src;el.src=src;}}
const warmVisuals=new Map();
let sceneReady=true,sceneLoadToken=0;
const sceneImages=new Map();
function decodeSceneImage(src){
 if(sceneImages.has(src))return sceneImages.get(src).ready;
 if(typeof Image==='undefined')return Promise.resolve();
 const image=new Image();image.decoding='async';
 const ready=new Promise((resolve,reject)=>{let settled=false;const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);if(error){sceneImages.delete(src);reject(error);}else resolve();};const timer=setTimeout(()=>finish(new Error('scene image timeout')),20000);
 image.onload=()=>{if(image.decode)image.decode().then(()=>finish(),e=>finish(e));else finish();};image.onerror=()=>finish(new Error('scene image failed'));image.src=src;
 });sceneImages.set(src,{image,ready});return ready;
}
function prepareBattleScene(){const token=++sceneLoadToken;sceneReady=false;$('scene-load-retry').hidden=true;setText('scene-load-status','배경과 캐릭터를 준비하고 있습니다.');
 const urls=['assets/combat/battle-bg.png','assets/combat/enemy-dummy.png',...s.party.map(i=>visualFor(roster[i]).standing)];
 Promise.all(urls.map(decodeSceneImage)).then(()=>{if(token!==sceneLoadToken)return;sceneReady=true;setText('scene-load-status','전투 화면 준비 완료');}).catch(()=>{if(token!==sceneLoadToken)return;setText('scene-load-status','배경 또는 캐릭터를 불러오지 못했습니다. 다시 시도해주세요.');$('scene-load-retry').hidden=false;});
}
$('scene-load-retry').onclick=prepareBattleScene;
function warmPartyVisuals(){if(typeof Image==='undefined')return;for(const i of s.party){for(const src of Object.values(visualFor(roster[i])).filter(v=>typeof v==='string')){if(warmVisuals.has(src))continue;const img=new Image();warmVisuals.set(src,img);img.src=src;img.decode?.().catch(()=>{});}}}
function syncActiveVisual(){if(s?.running&&!s.ultimateMovie)warmUltimateMovie(activeMember().id);const m=activeMember(),v=visualFor(m),icon=$('ultimate-character-icon'),ally=$('ally');setAllyCharacter();if(s?.nonoBuffTime>0&&m.id==='nono'){$('scene').classList.add('nono-buff-active');$('nono-buff-one').hidden=s.nonoBuffLevel!==1;$('nono-buff-two').hidden=s.nonoBuffLevel!==2;}else if(!s?.poseTime){const defending=s?.specialVisual==='chikage-defense'&&m.id==='chikage'&&v.defense;setVisualSource(ally,defending?v.defense:v.standing);ally.alt=defending?m.name+' 태그 디펜스':m.name;ally.classList.toggle('pose-defense',!!defending);}setVisualSource(icon,v.ultimate);icon.alt=m.name+' 궁극기';icon.hidden=false;$('ultimate').classList.add('has-custom-ultimate');}
function clearPose(){$('scene').classList.remove('nono-buff-active');$('nono-buff-one').hidden=true;$('nono-buff-two').hidden=true;$('ally').classList.remove('nono-buff','nono-buff-1','nono-buff-2');const m=activeMember(),v=visualFor(m),ally=$('ally');setAllyCharacter();ally.classList.remove('pose-attack','pose-parry','strike','hurt','tag-enter','shield-cast','parry-follow','survivor-arrival');$('scene').classList.remove('assault-clash','parry-recoil');if(s?.specialVisual==='chikage-defense'&&m.id==='chikage'&&v.defense){setVisualSource(ally,v.defense);ally.alt=m.name+' 태그 디펜스';ally.classList.add('pose-defense');}else{setVisualSource(ally,v.standing);ally.alt=m.name;ally.classList.remove('pose-defense');}syncActiveVisual();}
function clearEnemy(){$('enemy').hidden=false;$('enemy-attack').hidden=true;$('enemy').classList.remove('hurt','attack-still');}
function enemyMotion(){$('enemy').classList.remove('hurt');$('hit').classList.remove('flash');$('scene').classList.remove('clash');s.enemyTime=700;$('enemy').hidden=true;$('enemy-attack').hidden=false;pulse('enemy-attack','thrust');}
function pose(kind,time){s.poseTime=time;const m=activeMember(),v=visualFor(m);setAllyCharacter();setVisualSource($('ally'),v.attack);$('ally').alt=m.name+' 공격';$('ally').classList.remove('pose-attack','pose-parry');$('ally').classList.add('pose-'+kind);}
function showScreen(name){for(const key of ['selection','loading','battle'])$(key+'-screen').hidden=key!==name;resize();}
function filterRoster(){const q=$('character-search').value.trim().toLowerCase();let count=0;Array.from($('roster-grid').children).forEach((el,i)=>{const m=roster.find(m=>m.id===el.characterId);el.hidden=(!m.name.toLowerCase().includes(q)&&!m.id.includes(q))||Object.keys(filters).some(k=>filters[k].size&&!filters[k].has(m[k]));if(!el.hidden)count++;});setText('roster-count',count+' 명');$('empty-search').hidden=count!==0;}
function badges(m){return `<div class="portrait-meta"><span class="rarity ${m.rarity.toLowerCase()}"><b>${m.rarity}</b></span><span><img src="assets/combat/${m.element}.png" alt="${m.element}"></span><span><img src="assets/combat/${m.role}.png" alt="${m.role}"></span></div>`;}
function formation(){
 setText('formation-count',selected.length+' / 4');
 $('roster-grid').replaceChildren(...roster.map((m,i)=>{const b=document.createElement('button');b.characterId=m.id;b.elementOrder=['caelum','chaos','homines','nox','lux','terra'].indexOf(m.element);b.className='roster-choice'+(selected.includes(i)?' selected':'');b.disabled=s?.running||(!selected.includes(i)&&selected.length===4);b.setAttribute('aria-pressed',String(selected.includes(i)));b.innerHTML=`<img src="assets/combat/${m.portrait}" alt=""><span>${m.name}</span>${badges(m)}`;b.onclick=()=>{selected=selected.includes(i)?selected.filter(x=>x!==i):[...selected,i];s.party=[...selected];s.active=0;formation();render();};return b;}).sort((a,b)=>a.elementOrder-b.elementOrder));
 $('formation-slots').replaceChildren(...Array.from({length:4},(_,i)=>{const b=document.createElement('button');const m=roster[selected[i]];b.className='formation-slot';b.disabled=s?.running;b.innerHTML=m?`<span class="slot-number">${i+1}</span><img src="assets/combat/${m.portrait}" alt=""><span class="slot-name">${m.name}</span><span class="slot-remove">편성 해제</span>${badges(m)}`:`<span class="slot-number">${i+1}</span><span class="slot-placeholder"><b>+</b><span>파티원 선택</span></span>`;b.onclick=()=>{if(!m){$('character-search').focus?.();return;}selected.splice(i,1);s.party=[...selected];s.active=0;formation();render();};return b;}));
 $('start').disabled=s.running||selected.length===0;setText('start',selected.length?'게임 시작':'파티원을 선택해주세요');filterRoster();
}
function reserved(){return s.commands.reduce((sum,k,i)=>sum+(s.commandCosts[i]??skills[k].cost),0);}
function canRequest(kind,level=1){if(s.enemyTransition||s.enemyHP<=0)return false;if(mobileBlocked)return false;if(s.paused||s.ultimateMovie||s.ultimateImpact)return false;if(s.deathTransition)return false;const b=projectedSkill(),autoReserve=s.autoAttackAfterParry?skills.attack.cost:0;
 return !s.domainVisual&&(!s.charging||kind==='skill')&&(kind!=='skill'||!battleRules[activeMember().id]||(b.ct===0&&(activeMember().id!=='akina'||(b.stage===3?b.fire===0:b.fire>0))))&&s.running&&!s.apClearing&&!['INTRO','READY','LOADING','BGM_WAIT','BGM_PAINT'].includes(s.phase)&&(s.phase==='ACTION'?s.pattern==='normal':s.canAct)&&s.ap-reserved()-autoReserve>=actionCost(kind,level,b.stage)&&(kind!=='ultimate'||(battleState().ultCT===0&&!s.commands.includes('ultimate')));}


const enemyEffectNames={fracture:'파쇄',cherry:'벚꽃 표식',notice:'괴도의 예고장',burn:'화상',curse:'저주',guard:'가드',plunder:'강탈',chain:'연쇄',spear:'적중된 창'};
function addEffect(id,count=1,cap=1,duration=null){const e=s.enemyEffects[id]||(s.enemyEffects[id]={stacks:0,...(duration?{turns:[]}: {})});for(let i=0;i<count;i++){if(e.stacks<cap){e.stacks++;if(duration)e.turns.push(duration);}else if(duration){e.turns.sort((a,b)=>a-b);e.turns[0]=duration;}}}
function consumeEffect(id,count=1){const e=s.enemyEffects[id];if(!e)return 0;const used=Math.min(count,e.stacks);e.stacks-=used;if(e.turns)e.turns.splice(0,used);if(!e.stacks)delete s.enemyEffects[id];return used;}


function grantShield(id,ratio,turns){const b=stateFor(id);b.shield=Math.max(b.shield,5000*ratio);b.shieldTurns=Math.max(b.shieldTurns,turns);}
function partyAlive(id){return s.party.some((n,i)=>roster[n].id===id&&s.hp[i]>0);}
function lunaDamage(coefficient,reason){const mods=actorModifiers('luna');let damage=damageFromCoefficient(coefficient,coefficient/100);if(true){damage*=(1+mods.attack);if(mods.crit>0&&Math.random()<mods.crit)damage*=1.5;if(s.enemyEffects.guard)damage*=.5;}dealEnemyDamage(damage,reason,metadata.luna.name);s.lastBonusHit={character:'luna',coefficient,damage,reason};}
function domainEcho(){for(const id of ['luna','souka'])if(partyAlive(id)&&stateFor(id).buffs.domainEcho)lunaDamage(200,id+' 영지');}
function addChain(count=1){for(let i=0;i<count;i++){addEffect('chain',1,4,3);if(s.enemyEffects.chain.stacks>=4){dealEnemyDamage(damageFromCoefficient(750,7.5),'연쇄 4중첩 추가 피해');delete s.enemyEffects.chain;log('연쇄 4중첩 소모 · 750% 추가 피해');}}if(partyAlive('luna'))lunaDamage(50,'얼음의 축복');}


function procDamage(id,coefficient,reason){let damage=damageFromCoefficient(coefficient,coefficient/100);if(true){const m=actorModifiers(id);damage*=(1+m.attack);if(m.crit>0&&Math.random()<m.crit)damage*=1.5;if(s.enemyEffects.guard)damage*=.5;}dealEnemyDamage(damage,reason,metadata[id]?.name||id);s.lastBonusHit={character:id,coefficient,damage,reason};}
function addMagicChain(count){if(!s.magicChain)s.magicChain={turns:[]};for(let i=0;i<count;i++){if(s.magicChain.turns.length>=50)s.magicChain.turns.shift();s.magicChain.turns.push(4);}}
function consumeMagicChain(){if(!s.magicChain?.turns.length)return;procDamage('liria',100,'마력 연쇄');s.magicChain.turns.shift();stateFor('liria').chainConsumed++;if(!s.magicChain.turns.length)s.magicChain=null;}
function applyHitEffects(kind,level,stage){
 const id=activeMember().id,e=s.enemyEffects;
 if(id==='ren'&&kind==='skill'){addEffect('curse',1,99);const b=battleState();b.curseApplied++;if(b.curseApplied>=7){b.curseApplied-=7;procDamage(id,595.2,'마검의 계약');}}
 if(id==='shion'){const b=battleState();if(kind==='ultimate')b.plush=Math.min(4,b.plush+1);if(kind==='skill'&&stage===1){for(const n of s.party)grantUS(roster[n].id,b.plush*100);b.plush=0;}if(kind==='skill'&&stage===2)addEffect('curse',1,99);}
 if(id==='liria'){if(kind==='ultimate')addMagicChain(10);if(kind==='skill'&&stage===2)addMagicChain(5);if(kind==='skill'&&stage===3)for(const n of s.party)grantBuff(roster[n].id,'liriaSkill',6,{skillDamage:.35});}
 if(id==='nono'){const b=battleState();if(kind==='skill'&&level===1)b.light=Math.min(10,b.light+2);if(kind==='skill'&&level===2)for(const n of s.party)grantBuff(roster[n].id,'nonoCrit',7,{crit:.15});if(kind==='ultimate'){for(const n of s.party)grantBuff(roster[n].id,'nonoUltimate',5,{ultimateDamage:.30+b.light*.01});b.light=0;}}

 if(id==='luna'){if(kind==='ultimate')addChain(2);else if(kind==='skill'&&stage===3)addChain();}
 if(id==='mai'){
  if(kind==='ultimate'||(kind==='skill'&&level===1))addEffect('spear',1,20,5);
  if(kind==='skill'&&level===2&&stage===1)consumeEffect('spear',20);
  if(kind==='ultimate')grantBuff(id,'champion',4,{crit:.125});
 }
 if(id==='souka'){
  const b=battleState();
  if(kind==='skill'&&stage===1)addEffect('curse',1,99);
  if(kind==='skill'&&stage===2){b.timeTrace=Math.min(10,(b.timeTrace||0)+1+(Math.random()<.5?1:0));grantUS(id,50);}
  if(kind==='skill'&&stage===3)addChain();
  if(kind==='ultimate'){const gained=2+Math.floor((b.timeTrace||0)/2);s.ap+=gained;log('궁극기 AP 회복 +'+gained+' · 사용 AP 1 · 순증가 +'+(gained-1));b.timeTrace=0;for(const n of s.party)grantBuff(roster[n].id,'timeStrike',1,{strike:.249});}
 }

 if(id==='mayoi'&&kind==='skill'){if(stage===1)drawMayoiGem();else if(stage===2&&stateFor('mayoi').diamondTurns>0){addChain();}}
 if(id==='moa'){
  if(kind==='tag'){addEffect('notice',1,1,6);grantBuff('moa','noticePower',1,{strike:.201});}
  if((kind==='skill'&&stage===2)||kind==='tagSpecial'){const used=consumeEffect('fracture');if(used){dealEnemyDamage(5,'파쇄 1중첩 소모 · 추가 피해 500%',activeMember().name,480);}}
  if(kind==='ultimate'){if(e.notice){addEffect('plunder',1,1,7);e.plunder.critReduction=.15;grantBuff('moa','plunderCrit',7,{crit:.15});}delete e.notice;}
 }
 if(id==='koyomi'&&kind==='skill'&&stage===1)addEffect('fracture',1,5,5);
 if(id==='sigrid'&&kind==='skill'&&stage===1&&level===2)consumeEffect('fracture');
 if(id==='akina'){
  if(kind==='skill'&&stage<3)addEffect('burn',1,30,10);
  if(kind==='ultimate')addEffect('burn',4,30,10);
  if(kind==='tag')addEffect('fracture',1,5,5);
 }
 if(id==='erin'){
  if(kind==='tagSpecial'||(kind==='skill'&&stage===3))addChain();
  if(kind==='ultimate')grantBuff('erin','insight',2,{strike:.286});
 }
 if(id==='chikage'){
  if(kind==='skill'&&level===2)grantShield(id,.301,4);
  if(kind==='ultimate')for(const i of s.party){const target=roster[i].id;grantShield(target,.534,4);grantBuff(target,'coolReason',4,{defense:.12});}
 }

 if(id==='doll'&&kind==='ultimate'){addEffect('curse',2,99);consumeEffect('guard');}

 if(id==='anna'&&kind==='ultimate')grantBuff('anna','knighthood',2,{skillDamage:.356});
 if(id==='anna'&&(kind==='ultimate'||(kind==='skill'&&stage===3))){
  const f=e.fracture||(e.fracture={stacks:0,turns:[]});
  if(f.turns.length<5)f.turns.push(5);else{f.turns.sort((a,b)=>a-b);f.turns[0]=5;}
  f.stacks=f.turns.length;
 }
 if(id==='canon'){
  if(kind==='skill'&&level===1){e.cherry={stacks:1};consumeEffect('curse');grantBuff('canon','cherryCrit',1,{crit:.16});}
  else if(kind==='ultimate'||(kind==='skill'&&level===2))delete e.cherry;
 }
}
function tickEnemyEffects(){for(const enemy of s.enemies)if(enemy.hp>0)withEnemy(enemy.index,tickOneEnemyEffects);}
function tickOneEnemyEffects(){if(s.enemyEffects.burn){const damage=damageFromCoefficient(25,.25)*s.enemyEffects.burn.stacks;dealEnemyDamage(damage,'화상 지속 피해','아군 부여 효과');}for(const [id,e] of Object.entries(s.enemyEffects)){if(e.turns){e.turns=e.turns.map(n=>n-1).filter(n=>n>0);e.stacks=e.turns.length;if(!e.stacks)delete s.enemyEffects[id];}}}
function renderEnemyEffects(){const signature=JSON.stringify(s.enemyEffects);if(s.effectSignature===signature)return;s.effectSignature=signature;
 $('enemy-effects').replaceChildren(...Object.entries(s.enemyEffects).filter(([,e])=>e.stacks>0).map(([id,e])=>{const row=document.createElement('div');row.textContent=`[${enemyEffectNames[id]||id}] [${e.stacks}]`;return row;}));
}

function render(){$('open-party-skills').hidden=s.paused||!s.running||!['ACTION','ENGAGE'].includes(s.phase);
 renderEnemyRoster();
 if(s.enemies.length>1)setText('enemy-name',enemyName());else setText('enemy-name','마네킹');
 renderEffectLedger();
 renderDomains();
 s.allyStatModifiers=s.party.map(i=>{const id=roster[i].id,b=stateFor(id);return {id,...actorModifiers(id),defense:Object.values(b.buffs||{}).reduce((n,v)=>n+(v.defense||0),0),damageReduction:Object.values(b.buffs||{}).reduce((n,v)=>n+(v.damageReduction||0),0),shield:b.shield};});
 s.enemyStatModifiers={defense:-.01*(s.enemyEffects.fracture?.stacks||0),attack:-.001*(s.enemyEffects.curse?.stacks||0),strike:-.001*(s.enemyEffects.curse?.stacks||0),crit:s.enemyEffects.plunder?-.15:0};
 renderEnemyEffects();
 syncActiveVisual();renderBattleSkill();
 $('break-banner').hidden=!(s.breakFxTime>0);
 if(s.breakRest){$('runner').hidden=true;}
 setText('round',s.round+'R');setText('phase',s.phase);
 $('phase-wrap').hidden=['READY','INTRO','LOADING','BGM_WAIT','BGM_PAINT'].includes(s.phase);$('timeline').hidden=s.breakRest||['READY','INTRO','LOADING','BGM_WAIT','BGM_PAINT'].includes(s.phase);
 $('enemy-bp').style.transform=`scaleX(${s.enemyBP/ENEMY_BP_MAX})`;$('break-label').hidden=!s.enemyBroken;
 $('enemy-hp').style.transform=`scaleX(${s.enemyHP/100})`;setText('enemy-hp-text',`${Number(s.enemyHP.toFixed(2))} / 100`);
 setText('ap-value',s.ap);const displayAP=s.apClearing>0?s.clearCount:s.ap;
 const signature=[displayAP,s.apClearing>0,s.apFill>0].join(':');if(signature!==s.apSignature){s.apSignature=signature;
 $('stars').replaceChildren(...Array.from({length:5},(_,i)=>{const x=document.createElement('i'),overflow=Math.max(0,displayAP-5);x.className='star'+(i>=5-Math.min(5,displayAP)?' on':'')+(i>=5-Math.min(5,overflow)?' bonus':'');x.setAttribute('aria-label',i>=5-Math.min(5,overflow)?'추가 AP (기본 AP 위에 표시)':'기본 AP');
 if(s.apClearing>0)x.classList.add('clearing');else if(s.apFill>0){x.classList.add('charging');x.style.animationDelay=Math.max(0,(4-i)*110-s.apFillElapsed)+'ms';}return x;}));}

 for(const kind of Object.keys(skills)){$(kind).disabled=!canRequest(kind);$(kind).classList.toggle('queued',s.commands.includes(kind));}
 $('counter-button').disabled=!(s.running&&!s.enemyTransition&&!s.deathTransition&&!s.busy&&!s.apClearing&&s.phase==='ACTION'&&s.pattern==='counter');$('counter-button').classList.toggle('ready',!$('counter-button').disabled);
 $('end').disabled=!(s.running&&!s.enemyTransition&&!s.deathTransition&&s.phase==='ENGAGE'&&s.canAct&&!s.busy&&!s.poseTime&&!s.enemyTime&&!s.commands.length);$('start').disabled=s.running||!selected.length;
 $('counter').hidden=!(s.running&&((s.phase==='ACTION'&&s.pattern==='counter')||s.gradeTime>0));
 $('aura').classList.toggle('soft',s.pattern!=='normal');$('aura').classList.toggle('active',s.running&&!s.enemyTransition&&s.phase==='ACTION'&&!s.breakRest);$('aura').style.setProperty('--intent',patterns[s.pattern].color);
 setText('reservation',s.commands.length?'예약: '+s.commands.map(k=>skills[k].name).join(' → '):'');
 const member=activeMember(),bs=battleState(),reference=skillReference[member.id];$('skill').title=reference?(reference.skills[bs.stage-1]+' · CT '+bs.ct):'전투 스킬 [W]';$('ultimate').title=reference?reference.ultimate+' · CT '+bs.ultCT+' · AP 1':'궁극기 [E]';setText('character-resource',(reference?reference.skills[bs.stage-1]+' · ':'')+(member.id==='mayoi'?'보석 '+bs.gemCycle.map(k=>gemNames[k]).join('/')+(bs.diamondTurns?' · 다이아몬드':'')+' · ':'')+(member.id==='ren'?'저주 누적 '+bs.curseApplied+' / 7 · ':'')+(member.id==='shion'?'봉제인형 '+bs.plush+' / 4 · ':'')+(member.id==='nono'?'테우르기스트의 빛 '+bs.light+' / 10 · ':'')+(s.magicChain?'마력 연쇄 '+s.magicChain.turns.length+' / 50 · ':'')+(member.id==='souka'?'시간의 궤적 '+(bs.timeTrace||0)+' / 10 · ':'')+(member.id==='mai'?'적중된 창 '+(s.enemyEffects.spear?.stacks||0)+' / 20 · ':'')+(member.id==='haru'?'공격력 +'+(5*Math.min(5,1+Math.floor((s.round-1)/10)))+'% · ':'')+(member.id==='akina'?'그리스의 불 '+bs.fire+' / 3 · ':'')+(reference?.tagSpecialCT?'태그 스페셜 CT '+bs.tagCT+' · ':reference?.tagDefenseCT?'태그 디펜스 CT '+bs.tagCT+' · ':'')+(battleRules[member.id]?'전투 스킬 '+bs.stage+'단 · CT '+bs.ct:'')+' · 궁극기 CT '+bs.ultCT+(bs.shield?' · 보호막 '+bs.shield:'')+(domainRules[member.id]?' · 영지 '+bs.domainCount+' / '+domainRules[member.id][1]:''));
 const partySignature=JSON.stringify([s.party,s.active,s.hp,s.energy,s.running,s.phase,s.pattern,s.ap,s.apClearing>0,!!s.busy,!!s.poseTime,!!s.enemyTime,s.commands.length,s.canAct,s.tagDefenseActive,s.autoAttackAfterParry,s.specialVisual,s.battleStates,!!s.domainVisual,s.charging,!!s.deathTransition,!!s.enemyTransition]);
 if(s.partySignature!==partySignature){
  s.partySignature=partySignature;
  $('party').replaceChildren(...s.party.map((id,index)=>{
   const m=roster[id],btn=document.createElement('button'),remaining=tagCooldown(m.id,tagKind(m)),specialCT=stateFor(m.id).tagCT||0,normalCT=stateFor(m.id).tagAttackCT||0;const ctLabel=[specialCT?(m.tagDefense?'디펜스':'스페셜')+' CT '+specialCT:'',normalCT?'태그 CT '+normalCT:''].filter(Boolean).join(' / ');
   const signalReady=s.running&&s.phase==='ACTION'&&!s.apClearing&&!s.busy&&!s.poseTime&&!s.enemyTime&&!s.commands.length&&s.ap>=1&&s.hp[index]>0;
   const assaultReady=signalReady&&s.pattern==='assault'&&m.blocksAssault&&stateFor(m.id).tagCT===0;
   const defenseReady=signalReady&&s.pattern==='unavoidable'&&m.tagDefense&&stateFor(m.id).tagCT===0;
   const contextualReady=assaultReady||defenseReady;
   btn.className='party-slot'+(s.active===index?' active':'')+(assaultReady?' assault-ready':'')+(defenseReady?' defense-ready':'');
   btn.setAttribute('aria-label',m.name+(ctLabel?' · '+ctLabel:'')+(assaultReady?' · 강습 차단 가능':defenseReady?' · 태그 디펜스 가능':''));
   btn.title=m.name+(ctLabel?' · '+ctLabel:'')+(assaultReady?' · 강습 차단 가능':defenseReady?' · 태그 디펜스 가능':'');
   btn.innerHTML=`<span class="portrait"><img src="assets/combat/${m.portrait}" alt=""></span><span class="ult-dot ${stateFor(m.id).ultCT===0?'':'off'}"><img src="${visualFor(m).ultimate}" alt="${m.name} 궁극기"></span>${m.id==='mayoi'?mayoiGemIcon():''}${ctLabel?`<span class="tag-ct-label">${ctLabel}</span>`:''}<span class="ally-hp"><i style="width:${s.hp[index]/5000*100}%"></i></span>`;
   btn.disabled=!!s.enemyTransition||!!s.deathTransition||remaining>0||!!s.domainVisual||s.charging||(s.phase==='ACTION'&&s.pattern==='unavoidable'&&m.tagDefense&&stateFor(m.id).tagCT>0)||(s.phase==='ACTION'&&s.pattern==='assault'&&m.blocksAssault&&stateFor(m.id).tagCT>0)||!s.running||['INTRO','READY','LOADING','BGM_WAIT','BGM_PAINT'].includes(s.phase)||s.apClearing||s.busy||s.poseTime||s.enemyTime||s.commands.length||s.ap<1||s.hp[index]<=0||(s.active===index&&!contextualReady)||(s.phase==='ACTION'&&s.pattern==='counter')||(s.phase==='ENGAGE'&&!s.canAct);
   btn.onpointerdown=e=>{if(contextualReady&&!btn.disabled){e.preventDefault();btn.dataset.contextFired='1';tag(index);}};
   btn.onclick=()=>{if(btn.dataset?.contextFired==='1'){btn.dataset.contextFired='';return;}tag(index);};
   return btn;
  }));
 }
}
// BP values are prototype constants, separate from final character skill coefficients.
const breakDamage={attack:10,skill:20,ultimate:30,tag:10};
function hitBreak(kind){if(s.enemyBroken)return;s.enemyBP=Math.max(0,s.enemyBP-(breakDamage[kind]||0)*(metadata[activeMember().id].role==='breaker'?2:1)*(1+actorModifiers(activeMember().id).strike));if(s.enemyBP===0){playSfx('break');s.enemyBroken=true;s.breakRewardPending=true;s.breakUntilRound=s.round+1;s.breakFxTime=1000;pulse('scene','break-impact');pulse('break-banner','break-pop');log('BREAK · 다음 ACTION AP +2','system');}}
function enterAction(){s.engageDamage=0;$('engage-damage').hidden=true;
 expireDomains();
 const oldAP=s.ap;
 s.specialVisual=null;$('ally').classList.remove('pose-defense');
 s.phase='ACTION';s.canAct=false;s.busy=0;s.commands=[];s.commandCosts=[];s.skillLevels=[];s.skillSounds=[];s.autoAttackAfterParry=false;s.tagDefenseActive=false;
 syncActiveVisual();
 const bonus=s.breakRewardPending?2:0;
 s.ap=s.party.length+bonus+Math.floor(Number($('nodes').value)/2);
 s.lastBreakBonus=bonus;s.breakRewardPending=false;
 s.breakRest=s.enemyBroken&&s.round<=s.breakUntilRound;
 if(s.enemyBroken&&!s.breakRest){s.enemyBP=ENEMY_BP_MAX;s.enemyBroken=false;}
 s.elapsed=0;s.advance=s.breakRest?ENGAGE_WAIT_MS:0;
 const keys=Object.keys(patterns),mode=$('pattern').value;
 if(s.queueMode!==mode){s.queueMode=mode;s.upcoming=[];s.generatedTail=[];}
 while(s.upcoming.length<4){
  const tail=s.generatedTail,last=tail[tail.length-1];
  let pick;
  if(mode==='random'){
   let pool=[...keys];
   if(last==='assault')pool=pool.filter(k=>k!=='assault');
   if(tail.length===2&&tail[0]===tail[1])pool=pool.filter(k=>k!==tail[1]);
   pick=pool[Math.floor(Math.random()*pool.length)];
  }else if(mode==='cycle'){
   pick=keys[(s.round-1+s.upcoming.length)%4];
   if(last==='assault'&&pick==='assault')pick='normal';
  }else if(mode==='assault'){
   pick=last==='assault'?'normal':'assault';
  }else pick=mode;
  if(last==='assault'&&pick==='assault')pick='normal';
  s.upcoming.push(pick);s.generatedTail=[...tail,pick].slice(-2);
 }
 s.pattern=s.breakRest?'normal':s.upcoming.shift();
 s.laneDuration=1250+Math.random()*950;s.counterDuration=1050+Math.random()*850;s.duration=s.pattern==='counter'?s.counterDuration:s.laneDuration;
 if(s.pattern==='counter')s.counterIndex++;
 s.rangeKind=s.counterIndex%2===1?'wide':'narrow';
 const widths=s.rangeKind==='narrow'?[.10,.035]:(Math.random()<.5?[.22,.07]:[.36,.12]);
 const purpleWidth=widths[0]+Math.random()*.04;s.purpleStart=.20+Math.random()*(.72-purpleWidth);s.purpleEnd=s.purpleStart+purpleWidth;
 const yellowWidth=widths[1]+Math.random()*.015;s.safeStart=s.purpleStart+.012+Math.random()*(purpleWidth-yellowWidth-.024);s.safeEnd=s.safeStart+yellowWidth;
 s.gradeTime=0;$('grade').hidden=true;$('counter').classList.remove('perfect','good','fail');
 $('purple-range').style.left=s.purpleStart*100+'%';$('purple-range').style.width=purpleWidth*100+'%';$('safe-range').style.left=s.safeStart*100+'%';$('safe-range').style.width=yellowWidth*100+'%';$('pointer').style.left='0%';
 $('runner').src=`assets/combat/intent-${s.pattern}.svg`;$('runner').alt=patterns[s.pattern].name;$('runner').style.left='94px';$('runner').hidden=false;
 s.apTarget=s.ap;s.clearCount=oldAP;s.apClearing=s.round>1?260:0;if(s.apClearing)s.ap=0;s.apFill=s.apClearing?0:1000;s.apFillElapsed=0;
 $('queue').replaceChildren(...s.upcoming.slice().reverse().map(key=>{const im=document.createElement('img');im.src=`assets/combat/intent-${key}.svg`;im.alt='다음 행동: '+patterns[key].name;return im;}));
 if(!s.breakRest)playSfx({normal:'blue',counter:'yellow',unavoidable:'red',assault:'purple'}[s.pattern]);render();log(s.breakRest?'BREAK · 아군 행동 대기':patterns[s.pattern].name+' 예고',s.breakRest?'system':'enemy');
}

// V129: explicit victory sequence; all combat time remains frozen during it.
function finish(won,deathAlreadyPlayed=false){if(won){if(startEnemyReplacement())return;beginVictory();return;}finishBattleResult(false,deathAlreadyPlayed);}
function clearVictory(){
 const v=$('victory-video');v.onended=null;v.onerror=null;v.onplaying=null;v.onseeked=null;v.onloadedmetadata=null;v.pause?.();
 if(s)s.victorySequence=null;
 $('victory-screen').hidden=true;$('victory-logo').hidden=true;$('victory-fade').hidden=true;
 $('victory-fade').classList.remove('fade-in','fade-out');$('victory-skip-hint').hidden=false;
 $('enemy').classList.remove('enemy-death');$('enemy-death-fx').classList.remove('burst');$('scene').classList.remove('enemy-fallen');
}
function victoryCue(key,t){
 t.audioDone=false;t.audioElapsed=0;
 const a=soundNode(key),token=audioSession;
 const valid=()=>s.victorySequence===t&&audioSession===token;
 if(!a){t.audioDone=true;return;}
 a.currentTime=0;a.volume=1;a.onended=()=>{a.onended=null;a.onerror=null;if(valid())t.audioDone=true;};
 a.onerror=()=>{if(valid())t.audioDone=true;};
 try{a.play()?.catch(()=>{if(valid())t.audioDone=true;});}catch{t.audioDone=true;}
}
function beginVictory(){clearLiveHitEffects();
 if(!s.running||s.victorySequence)return;
 const winner=s.victoryOwner||activeMember().id;
 tickDamageNumbers(10000);stopBattleAudio();cancelAnimationFrame(raf);
 clearUltimateImpact();clearUltimateMovie();clearDomainVisual();cancelCharge();clearDeathVisual();
 s.nonoBuffTime=0;clearPose();clearEnemy();$('scene').classList.remove('clash','assault-clash');
 s.running=false;s.paused=false;s.phase='VICTORY';s.busy=0;s.poseTime=0;s.enemyTime=0;s.commands=[];s.hitFxQueue=[];s.damageNumbers=[];s.deathTransition=null;
 $('pause-overlay').hidden=true;$('battle').classList.remove('is-paused');$('projectile-fx').classList.remove('flying');$('result').hidden=true;
 const t=s.victorySequence={stage:'logo',elapsed:0,winner,lastTap:null,playing:false};
 const v=$('victory-video');v.src='assets/combat/victories/'+winner+'.mp4';v.load?.();
 $('victory-logo').hidden=false;pulse('victory-logo','play');victoryCue('trialConcluded',t);
 render();formation();last=performance.now();raf=requestAnimationFrame(tick);
}
function revealVictoryResult(){
 const t=s.victorySequence;if(!t||t.stage==='complete')return;
 t.stage='complete';$('victory-video').pause?.();$('victory-skip-hint').hidden=true;
 $('victory-fade').hidden=true;setText('result-text','전투 승리');$('result').hidden=false;
 log('적 처치 · '+metadata[t.winner].name+' 승리','system');formation();
}
function playVictoryVideo(t){
 const v=$('victory-video');t.stage='video';t.elapsed=0;t.playing=false;
 const valid=()=>s.victorySequence===t&&t.stage==='video';
 $('victory-screen').hidden=false;
 v.onplaying=()=>{if(!valid())return;t.playing=true;t.elapsed=0;pulse('victory-fade','fade-out');};
 v.onended=()=>{if(valid())revealVictoryResult();};
 v.onerror=()=>{if(valid())revealVictoryResult();};
 try{v.currentTime=0;v.volume=1;tryVideo(v,revealVictoryResult,valid);}catch{revealVictoryResult();}
}
function skipVictoryVideo(){
 const t=s.victorySequence;if(!t||t.stage!=='video')return;
 const v=$('victory-video');v.pause?.();
 // Seek to the final decoded frame; never clear the source behind the result.
 v.onseeked=()=>{if(s.victorySequence===t)revealVictoryResult();};
 if(Number.isFinite(v.duration)&&v.duration>0){t.skipping=true;t.skipElapsed=0;try{v.currentTime=Math.max(0,v.duration-.05);}catch{revealVictoryResult();}}
 else revealVictoryResult();
}
function tickVictory(dt){
 const t=s.victorySequence;if(!t||t.stage==='complete')return;t.elapsed+=dt;t.audioElapsed+=dt;
 if(t.stage==='logo'&&t.elapsed>=1800&&(t.audioDone||t.audioElapsed>=2600)){
  $('victory-logo').hidden=true;clearEnemy();pulse('enemy','enemy-death');$('scene').classList.add('enemy-fallen');pulse('enemy-death-fx','burst');
  t.stage='death';t.elapsed=0;victoryCue('death',t);
 }else if(t.stage==='death'&&t.elapsed>=1100&&(t.audioDone||t.audioElapsed>=2300)){
  $('enemy').hidden=true;t.stage='fade';t.elapsed=0;$('victory-fade').hidden=false;pulse('victory-fade','fade-in');
 }else if(t.stage==='fade'&&t.elapsed>=400){playVictoryVideo(t);
 }else if(t.stage==='video'){
  if(t.skipping){t.skipElapsed+=dt;if(t.skipElapsed>=800)revealVictoryResult();return;}
  if(t.playing&&t.elapsed>=500)$('victory-fade').hidden=true;
  if(!t.playing&&t.elapsed>=10000)revealVictoryResult();
 }
}
$('victory-screen').addEventListener?.('pointerup',e=>{
 if(e.isPrimary===false||e.button>0)return;const t=s.victorySequence;if(!t||t.stage!=='video')return;
 const now=performance.now();if(t.lastTap!==null&&now-t.lastTap<=350){t.lastTap=null;skipVictoryVideo();}else t.lastTap=now;
});
$('victory-screen').addEventListener?.('dblclick',skipVictoryVideo);

function finishBattleResult(won,deathAlreadyPlayed=false){clearLiveHitEffects();if(!s.running)return;tickDamageNumbers(10000);clearUltimateImpact();clearUltimateMovie();if(won)clearDeathVisual();s.hitFxQueue=[];$('projectile-fx').classList.remove('flying');stopBattleAudio();if(!deathAlreadyPlayed)playSfx('death');s.deathTransition=null;clearDomainVisual();cancelCharge();s.running=false;s.busy=0;s.commands=[];cancelAnimationFrame(raf);clearPose();clearEnemy();$('scene').classList.remove('clash');$('result').hidden=false;setText('result-text',won?'전투 승리':'게임 오버');render();formation();log(won?'적 처치':'아군 전투 불능','system');}
function engage(canAct,msg,side='ally'){s.phase='ENGAGE';s.canAct=canAct;s.advance=canAct?ENGAGE_WAIT_MS:1400;s.busy=s.enemyTime||0;$('runner').hidden=true;log(msg,side);if(s.hp[s.active]<=0&&!replaceFallenAlly())return;if(s.enemyHP<=0){if(s.hitFxQueue.length)s.victoryPending=true;else{finish(true);return;}}render();}
function clearDeathVisual(){$('ally').classList.remove('death-dissolve');$('scene').classList.remove('ally-fallen');$('death-fx').classList.remove('burst');}
function replaceFallenAlly(){clearLiveHitEffects();if(s.deathTransition)return false;const old=s.active;let next=-1;for(let offset=1;offset<s.party.length;offset++){const i=(old+offset)%s.party.length;if(s.hp[i]>0){next=i;break;}}
 closeChain(activeMember().id);cancelCharge();s.commands=[];s.commandCosts=[];s.skillLevels=[];s.skillSounds=[];s.autoAttackAfterParry=false;s.poseTime=0;s.specialVisual=null;s.tagDefenseActive=false;s.hitFxQueue=[];pendingSfx=[];clearPose();clearEnemy();s.enemyTime=0;s.busy=0;$('scene').classList.remove('clash');$('projectile-fx').classList.remove('flying');
 pulse('ally','death-dissolve');$('scene').classList.add('ally-fallen');pulse('death-fx','burst');
 const t=s.deathTransition={stage:'death',next,ready:false,failed:false,remaining:1100};const token=audioSession,a=soundNode('death');const valid=()=>s.deathTransition===t&&audioSession===token;log(activeMember().name+' 전투 불능 · 다음 생존자 대기','system');
 if(a){a.currentTime=0;a.volume=1;a.onended=()=>{a.onended=null;a.onerror=null;if(valid())t.ready=true;};a.onerror=()=>{if(valid())t.failed=true;};try{a.play()?.catch(()=>{if(valid())t.failed=true;});}catch{t.failed=true;}}else t.failed=true;
 render();return false;}
function tickDeathTransition(dt){const t=s.deathTransition;if(!t)return;
 if(t.stage==='death'){if(t.failed){t.remaining-=dt;if(t.remaining<=0)t.ready=true;}if(!t.ready)return;t.stage='gap';t.remaining=650;return;}
 if(t.stage==='gap'){t.remaining-=dt;if(t.remaining>0)return;if(t.next<0){finish(false,true);return;}s.active=t.next;clearPose();clearDeathVisual();playSfx('swapOnly');pulse('ally','survivor-arrival');t.stage='arrival';t.remaining=900;log(activeMember().name+' 자동 출전','system');return;}
 t.remaining-=dt;if(t.remaining<=0){$('ally').classList.remove('survivor-arrival');s.deathTransition=null;s.advance=s.canAct?ENGAGE_WAIT_MS:1400;s.partySignature=null;log('교체 완료 · 전투 재개','system');}
}
function takeHit(){if(s.breakRest)return;if(s.pattern!=='counter')playSfx('enemyHit');enemyMotion();const id=activeMember().id,b=battleState(),reduction=Math.min(.95,Object.values(b.buffs||{}).reduce((n,v)=>n+(v.damageReduction||0),0)),defended=reduction>0;let damage=Math.round(650*(1-reduction)*(1-.001*(s.enemyEffects.curse?.stacks||0)));
 const enemy=s.enemies[s.enemyIndex],critChance=Math.max(0,(enemy.baseCrit||0)-(s.enemyEffects.plunder?.critReduction||0));if(critChance>0&&Math.random()<critChance)damage=Math.round(damage*1.5);
 const absorbed=Math.min(b.shield||0,damage);b.shield-=absorbed;damage-=absorbed;const beforeHP=s.hp[s.active];s.hp[s.active]=Math.max(0,s.hp[s.active]-damage);floatDamage('ally',beforeHP-s.hp[s.active]);log(patterns[s.pattern].name+' → '+activeMember().name+' · 피해 '+damageText(beforeHP-s.hp[s.active])+(absorbed>0?' · 보호막 흡수 '+damageText(absorbed):'')+(damage>beforeHP?' (계산 피해 '+damageText(damage)+')':''),'enemy','마네킹');
 if(id==='doll'&&!b.dollTriggered&&s.hp[s.active]>0&&s.hp[s.active]<=3500){b.dollTriggered=true;b.shield=1395;b.shieldTurns=5;grantBuff('doll','earthPower',null,{attack:.2});log('대지의 힘 · 보호막 1395 / 공격력 +20%');}
 if(defended)log('치카게 태그 디펜스 · 받는 피해 15% 감소');s.tagDefenseActive=false;pulse('ally','hurt');}

const CLASH_MS={PERFECT:1120,GOOD:1480,assaultBlock:1880};
function prepareClash(key){const ms=CLASH_MS[key];$('scene').style.setProperty('--clash-duration',ms+'ms');queueSfx(key==='PERFECT'?'perfect':key==='GOOD'?'good':key,Math.round(ms*.05));return ms;}
function gradeResult(grade){const clashMs=grade==='FAIL'?0:prepareClash(grade);if(grade==='FAIL')playSfx('bad');s.grade=grade;s.gradeTime=grade==='FAIL'?1100:clashMs;setText('grade',grade==='GOOD'?'GOOD!':grade);$('grade').hidden=false;$('counter').classList.remove('perfect','good','fail');$('counter').classList.add(grade.toLowerCase());if(grade!=='FAIL'){pose('parry',clashMs);pulse('scene','clash');s.busy=clashMs+260;s.autoAttackAfterParry=true;log(grade+' 패링 성공 · 일반 공격 자동 연계');}else{s.autoAttackAfterParry=false;$('scene').classList.remove('clash');}render();}
function resolveFailure(){cancelCharge();const wasCounter=s.pattern==='counter';takeHit();engage(s.pattern==='normal',patterns[s.pattern].name+' 피격','enemy');if(wasCounter&&s.running)gradeResult('FAIL');}



let effectsReady=true;
const effectImages=new Map();
function prepareEffectImage(src){
 if(effectImages.has(src))return effectImages.get(src).ready;
 if(typeof Image==='undefined')return Promise.resolve();
 const image=new Image();image.decoding='async';
 const ready=new Promise(resolve=>{let settled=false;const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);resolve();};const timer=setTimeout(finish,10000);
 image.onload=()=>{if(image.decode)image.decode().then(finish,finish);else finish();};image.onerror=()=>{effectImages.delete(src);finish();};image.src=src;
 });effectImages.set(src,{image,ready});return ready;
}
function prepareBattleEffects(){const state=s;effectsReady=false;const urls=['blade-slash.svg','arc-projectile.svg','arc-projectile-blue.svg'].map(n=>'assets/combat/fx/'+n);
 for(const type of ['melee','ranged'])for(const stage of [1,2])urls.push('assets/combat/ultimate-fx/'+type+'-'+stage+'.png');
 Promise.all(urls.map(prepareEffectImage)).then(()=>{if(s===state)effectsReady=true;});
}
function prepareUltimateLayers(id){const type=id==='haru'||attackSound(id)==='meleeAttack'?'melee':'ranged';
 const jobs=[];for(const stage of [1,2]){const image=$(stage===1?'ultimate-impact-image':'ultimate-impact-image-next'),src='assets/combat/ultimate-fx/'+type+'-'+stage+'.png';setVisualSource(image,src);jobs.push(prepareEffectImage(src));}
 return Promise.all(jobs);
}

function clearUltimateImpact(){
 if(s)s.ultimateImpact=null;
 $('ultimate-impact').hidden=true;
 $('scene').classList.remove('ult-medium','ult-heavy');
}
function startUltimateImpact(id,done){
 const melee=id==='haru'||attackSound(id)==='meleeAttack',type=melee?'melee':'ranged',blue=BLUE_PROJECTILE_IDS.has(id)||['sigrid','doll','ren'].includes(id);
 s.ultimateImpact={id,type,blue,elapsed:0,first:melee?250:600,burst:false,done};
 const el=$('ultimate-impact');el.style.setProperty('--ult-hue',melee?'145deg':'225deg');el.classList.toggle('ult-recolor',melee?!blue:blue);el.classList.remove('ult-burst');el.hidden=false;
 prepareUltimateLayers(id);$('ultimate-impact-image').hidden=false;$('ultimate-impact-image-next').hidden=true;
 playSfx(type+'Ultimate');pulse('scene','ult-medium');
}
function tickUltimateImpact(dt){
 const t=s.ultimateImpact;if(!t)return;t.elapsed+=dt;
 if(!t.burst&&t.elapsed>=t.first){t.burst=true;$('ultimate-impact-image').hidden=true;$('ultimate-impact-image-next').hidden=false;pulse('ultimate-impact','ult-burst');$('scene').classList.remove('ult-medium');pulse('scene','ult-heavy');}
 if(t.elapsed>=1830){const done=t.done;clearUltimateImpact();done();}
}

const ultimateMovies=new Set(['nono','ren','luna','liria','mayoi','mai','moa','souka','shion','akina','anna','erin','sigrid','doll','chikage','canon','koyomi','haru']);
function warmUltimateMovie(id){
 if(!ultimateMovies.has(id))return;
 const v=$('ultimate-video'),src='assets/combat/ultimates/'+id+'.mp4';if(v.dataset.preparedSrc===src)return;
 v.onended=null;v.onerror=null;v.preload='auto';v.dataset.preparedSrc=src;v.src=src;v.load?.();
}
function clearUltimateMovie(){
 const v=$('ultimate-video');v.onended=null;v.onerror=null;v.pause?.();
 $('ultimate-movie').hidden=true;$('battle').classList.remove('playing-ultimate');
 if(s)s.ultimateMovie=null;
}
function playUltimateMovie(id,done){
 const v=$('ultimate-video'),token={id};s.ultimateMovie=token;const effects=prepareUltimateLayers(id);
 $('ultimate-movie').hidden=false;$('battle').classList.add('playing-ultimate');
 warmUltimateMovie(id);if(v.error)v.load?.();v.currentTime=0;v.volume=1;
 const complete=()=>{if(s.ultimateMovie!==token||token.completing)return;token.completing=true;effects.then(()=>{if(s.ultimateMovie!==token)return;requestAnimationFrame(()=>{if(s.ultimateMovie!==token)return;clearUltimateMovie();if(id==='chikage'||id==='nono')done();else startUltimateImpact(id,done);});});};
 v.onended=complete;v.onerror=complete;
 try{if(v.play)tryVideo(v,complete,()=>!!s.ultimateMovie);else complete();}catch{complete();}
}

function execute(kind,chargeLevel=1,chargeSoundPlayed=false,movieFinished=false){if(s.enemyTransition)return;
 const id=activeMember().id,b=battleState(),r=battleRules[id],stage=b.stage;
 if(kind==='skill'&&r&&(b.ct>0||(id==='akina'&&(stage===3?b.fire!==0:b.fire<=0))))return;
 const cost=actionCost(kind,chargeLevel,stage),d=skills[kind];if(s.ap<cost||(kind==='ultimate'&&(b.ultCT>0)))return;
 if(kind==='ultimate'&&!movieFinished&&ultimateMovies.has(id)){playUltimateMovie(id,()=>execute(kind,chargeLevel,chargeSoundPlayed,true));return;}
 const meleeCharged=kind==='skill'&&chargeLevel>=2&&attackSound(id)==='meleeAttack',rangedCharged=kind==='skill'&&chargeLevel>=2&&!meleeCharged;
 const attackMotionMs=meleeCharged?1260:rangedCharged?1440:560;
 const recharge=kind==='skill'&&id==='akina'&&stage===3;const resourceOnly=(kind==='skill'&&((id==='souka'&&stage===2)||(id==='shion'&&stage===1)||(id==='liria'&&stage>1)||id==='nono'))||(id==='nono'&&kind==='ultimate');const shielding=id==='chikage'&&(kind==='ultimate'||(kind==='skill'&&chargeLevel===2));
 if(!recharge)resolveHit(kind,chargeLevel,stage);pulse(kind,'used');s.ap-=cost;
 if(kind==='ultimate')b.ultCT=1;
 if(kind==='attack'){b.ultCT=Math.max(0,b.ultCT-1);b.ct=Math.max(0,b.ct-1);b.tagCT=Math.max(0,(b.tagCT||0)-1);b.tagAttackCT=Math.max(0,(b.tagAttackCT||0)-1);}
 if(kind==='skill'&&r){
  s.lastBattleSkill={character:id,stage,chargeLevel,cost};
  log(activeMember().name+' '+stage+'단'+(r.chargeMs?' · 차지 '+chargeLevel+'단계':'')+' · AP '+cost);
  if(id==='akina'){
   if(recharge){b.fire=3;b.stage=1;b.ct=5;log('즉석 충전 · 그리스의 불 3개');}
   else{b.fire--;if(b.fire===0){b.stage=3;b.ct=0;}else if(stage===1&&s.ap>0){b.stage=2;}else{b.stage=1;b.ct=1;}
    if(stage===2&&Math.random()<.5){b.fire=Math.min(3,b.fire+1);b.stage=1;b.ct=0;s.ap++;s.energy[s.active]=Math.min(100,s.energy[s.active]+2.5);log('아키나류 연금술 · CT 초기화 / 그리스의 불 +1 / AP +1 / US +50');}
   }
  }else if(stage>=r.stages||s.ap===0){b.stage=1;b.ct=r.chargeCT?.[chargeLevel]??skillReference[id]?.ct[stage-1]??r.ct;}else b.stage++;
 }
 if(s.ap===0)for(const key of Object.keys(s.battleStates))closeChain(key);
 s.energy[s.active]=kind==='ultimate'?0:Math.min(100,s.energy[s.active]+d.energy);
 if(id==='shion'&&kind==='attack'){grantUS(id,50);b.basicCount++;if(b.basicCount>=3){b.basicCount-=3;b.plush=Math.min(4,b.plush+1);}}
 if(id==='souka'&&kind==='skill')grantUS(id,50);
 domainEcho();recordDomain(kind);
 if(id==='nono'&&(kind==='skill'||kind==='ultimate')){s.nonoBuffLevel=kind==='ultimate'?2:chargeLevel;s.nonoBuffTime=1200;s.poseTime=1200;syncActiveVisual();playSfx(s.nonoBuffLevel===2?'nonoBuff2':'nonoBuff1');}
 if(id!=='nono'&&!chargeSoundPlayed&&(shielding||resourceOnly)&&kind==='skill'&&chargeLevel===2)playSfx(attackSound(id).replace('Attack','Charge'));
 if(shielding){s.specialVisual='chikage-defense';syncActiveVisual();pulse('ally','shield-cast');}else if(!recharge&&!resourceOnly&&!(kind==='ultimate'&&id!=='chikage')){if(!chargeSoundPlayed)playSfx(kind==='skill'&&chargeLevel===2?attackSound(id).replace('Attack','Charge'):attackSound(id));pose('attack',attackMotionMs);pulse('ally','strike');}
 if(s.phase==='ACTION'&&!recharge&&!shielding&&s.lastResolvedHit?.damage>0)engage(true,s.breakRest?'BREAK · 아군 행동 시작':'일반 공격 저지');
 else if(s.phase==='ACTION'&&s.breakRest)engage(true,'BREAK · 아군 충전 행동');else log(recharge?'즉석 충전':shielding?'보호막 부여':d.name);
 if(!s.enemyHP)s.victoryPending=true;s.busy=Math.max(600,attackMotionMs);s.advance=ENGAGE_WAIT_MS;render();
}
function attack(kind,chargeLevel=1,chargeSoundPlayed=false){if(!canRequest(kind,chargeLevel))return;const cost=actionCost(kind,chargeLevel);
 if(s.busy||s.poseTime||s.enemyTime){s.commands.push(kind);s.commandCosts.push(cost);if(kind==='skill'){s.skillLevels.push(chargeLevel);s.skillSounds.push(chargeSoundPlayed);}s.advance=ENGAGE_WAIT_MS;log(skills[kind].name+' 예약');render();}else execute(kind,chargeLevel,chargeSoundPlayed);}

function counter(){if(s.enemyTransition)return;if(mobileBlocked)return;if(s.paused||s.ultimateMovie||s.ultimateImpact)return;if(s.deathTransition||s.domainVisual)return;if($('counter-button').disabled)return;pulse('counter-button','used');const p=s.elapsed/s.counterDuration;const grade=p>=s.safeStart&&p<=s.safeEnd?'PERFECT':p>=s.purpleStart&&p<=s.purpleEnd?'GOOD':'FAIL';if(grade!=='FAIL'){engage(true,grade+' · 패링 성공');gradeResult(grade);}else{takeHit();engage(false,'FAIL · 패링 실패','enemy');if(s.running)gradeResult('FAIL');}}
function tagKind(m){return s.phase==='ACTION'&&s.pattern==='assault'&&m.blocksAssault?'tagSpecial':s.phase==='ACTION'&&s.pattern==='unavoidable'&&m.tagDefense?'tagDefense':'tag';}
function tagCooldown(id,kind){return stateFor(id)[kind==='tag'?'tagAttackCT':'tagCT']||0;}
function setTagCooldown(id,kind){const ref=skillReference[id],key=kind==='tag'?'tagAttackCT':'tagCT';stateFor(id)[key]=ref?.[kind==='tag'?'tagAttackCT':kind==='tagSpecial'?'tagSpecialCT':'tagDefenseCT']||0;}
function tag(index){if(s.enemyTransition)return;if(mobileBlocked)return;if(s.paused||s.ultimateMovie||s.ultimateImpact)return;
 if(s.deathTransition||s.domainVisual||s.charging||!s.running||['INTRO','READY','LOADING','BGM_WAIT','BGM_PAINT'].includes(s.phase)||s.apClearing||s.busy||s.poseTime||s.enemyTime||s.commands.length||index<0||index>=s.party.length||s.hp[index]<=0||(s.phase==='ACTION'&&s.pattern==='counter')||(s.phase==='ENGAGE'&&!s.canAct)||s.ap<1)return;
 const m=roster[s.party[index]],special=s.phase==='ACTION'&&s.pattern==='assault'&&m.blocksAssault,defense=s.phase==='ACTION'&&s.pattern==='unavoidable'&&m.tagDefense,same=index===s.active;
 if(same&&!special&&!defense)return;
 if(tagCooldown(m.id,tagKind(m))>0)return;
 closeChain(activeMember().id);s.ap--;s.active=index;s.specialVisual=null;
 if(defense){playSfx('chikageDefense');setTagCooldown(m.id,'tagDefense');for(const i of s.party)grantBuff(roster[i].id,'tagGuard',1,{damageReduction:.15});const v=visualFor(m);s.tagDefenseActive=true;s.specialVisual='chikage-defense';if(v.defense){setVisualSource($('ally'),v.defense);$('ally').classList.add('pose-defense');}pulse('ally','tag-enter');pulse('scene','tag-camera');s.tagFxTime=560;s.busy=560;domainEcho();if(!s.enemyHP){finish(true);return;}log(m.name+' 태그 디펜스');render();return;}
 // Red/purple neutral substitution is not a tag skill activation.
 if(!special&&s.phase==='ACTION'&&['assault','unavoidable'].includes(s.pattern)){
  clearPose();playSfx('swapOnly');pulse('ally','survivor-arrival');s.tagFxTime=900;s.busy=900;s.lastTag={character:m.id,kind:'switch'};log(m.name+' 교체');render();return;
 }
 const kind=special?'tagSpecial':'tag';
 const tagDamageStart=(s.damageNumbers||[]).length;setTagCooldown(m.id,kind);resolveHit(kind);domainEcho();
 if(special){const all=s.damageNumbers.splice(tagDamageStart);if(all.length)s.damageNumbers.push({...all[0],amount:all.reduce((sum,q)=>sum+q.amount,0),delay:Math.round(CLASH_MS.assaultBlock*.05)});s.autoAttackAfterParry=false;}
 s.lastTag={character:m.id,kind};
 const clashMs=special?prepareClash('assaultBlock'):0;if(!special)playSfx(attackSound(m.id,true));pose('attack',special?clashMs:560);if(!special){pulse('ally','tag-enter');pulse('scene','tag-camera');s.tagFxTime=560;}
 if(special){$('scene').classList.add('assault-clash');pulse('scene','clash');engage(true,m.name+' 태그 스페셜 · 강습 차단');}
 else if(s.phase==='ACTION'&&(s.pattern==='normal'||s.breakRest))engage(true,m.name+' 태그 어택 · 행동 시작');
 else log(m.name+' 태그 어택');
 if(!s.enemyHP)s.victoryPending=true;s.busy=special?clashMs:600;s.advance=ENGAGE_WAIT_MS;render();
}

function next(){if(s.enemyTransition)return;if(mobileBlocked)return;if(s.paused||s.ultimateMovie||s.ultimateImpact)return;if(s.deathTransition||s.domainVisual||s.charging)return;if(!s.running||s.commands.length||s.busy||s.poseTime||s.enemyTime)return;for(const id of Object.keys(s.battleStates)){closeChain(id);s.battleStates[id].ct=Math.max(0,s.battleStates[id].ct-1);s.battleStates[id].ultCT=Math.max(0,(s.battleStates[id].ultCT||0)-1);s.battleStates[id].tagCT=Math.max(0,(s.battleStates[id].tagCT||0)-1);s.battleStates[id].tagAttackCT=Math.max(0,(s.battleStates[id].tagAttackCT||0)-1);}tickEnemyEffects();tickCharacterEffects();if(s.enemyHP<=0){finish(true);if(s.enemyTransition)s.enemyTransition.nextAction=true;return;}s.round++;if((s.round-1)%3===0&&partyAlive('shion')){const b=stateFor('shion');b.plush=Math.min(4,b.plush+1);}enterAction();}


let readerOwnsPause=false;
function closePartySkills(resume=true){
 const shouldResume=resume&&readerOwnsPause;readerOwnsPause=false;
 $('party-skills-panel').hidden=true;$('party-skills-shade').hidden=true;
 $('open-party-skills').setAttribute('aria-expanded','false');
 if(shouldResume&&s.paused)resumeBattle();
 if(resume)$('open-party-skills').focus?.();
}
function openPartySkills(){
 if(!s.running||s.paused||!['ACTION','ENGAGE'].includes(s.phase))return;
 pauseBattle();if(!s.paused)return;
 readerOwnsPause=true;$('pause-overlay').hidden=true;
 const ids=s.party.map(n=>roster[n].id);
 const url='combat-reader.html?v=142&party='+ids.join(',')+'&active='+activeMember().id;
 const frame=$('party-skills-frame');
 if(frame.getAttribute('src')!==url)frame.src=url;
 $('party-skills-shade').hidden=false;$('party-skills-panel').hidden=false;
 $('open-party-skills').setAttribute('aria-expanded','true');$('close-party-skills').focus?.();
}
$('open-party-skills').onclick=openPartySkills;
$('close-party-skills').onclick=()=>closePartySkills();
addEventListener('message',e=>{if(e.origin===location.origin&&e.source===$('party-skills-frame').contentWindow&&e.data==='close-party-skills')closePartySkills();});

let pausedAudio=[];
function pauseBattle(){
 if(!s.running||s.paused||['READY','LOADING','BGM_PAINT','BGM_WAIT'].includes(s.phase))return;
 s.paused=true;$('open-party-skills').hidden=true;cancelAnimationFrame(raf);
 $('battle').classList.add('is-paused');$('pause-overlay').hidden=false;
 pausedAudio=[$('ultimate-video'),audioTrack('battle-bgm'),audioTrack('trial-sound'),...Object.values(sfxPool).flat()].filter(a=>a?.pause&&!a.paused&&!a.ended);
 for(const a of pausedAudio)a.pause();
 $('resume').focus?.();
}
function resumeBattle(){BattleAudio.unlock().catch(()=>showAudioGate('소리를 켜고 계속해주세요.'));
 if(!s.paused)return;closePartySkills(false);s.paused=false;$('open-party-skills').hidden=!s.running||!['ACTION','ENGAGE'].includes(s.phase);
 $('battle').classList.remove('is-paused');$('pause-overlay').hidden=true;
 for(const a of pausedAudio)a.play()?.catch(()=>{});pausedAudio=[];
 last=performance.now();cancelAnimationFrame(raf);
 if(s.releaseAfterPause){s.releaseAfterPause=false;releaseCharge();}
 raf=requestAnimationFrame(tick);$('pause-button').focus?.();
}

function tick(now){if(mobileBlocked||document.hidden){last=now;if(s.running||s.victorySequence)raf=requestAnimationFrame(tick);return;}if(s.phase==='LOADING'&&(!audioPrepared||!effectsReady||!sceneReady)){last=now;raf=requestAnimationFrame(tick);return;}if(s?.victorySequence){const dt=Math.min(Math.max(0,now-last),80);last=now;tickVictory(document.hidden?0:dt);if(s.victorySequence.stage!=='complete')raf=requestAnimationFrame(tick);return;}if(!s.running||s.paused)return;const dt=document.hidden?0:Math.min(now-last,80);last=now;
 if(s.ultimateImpact){tickUltimateImpact(dt);if(s.running)raf=requestAnimationFrame(tick);return;}
 if(s.ultimateMovie){raf=requestAnimationFrame(tick);return;}
 if(s.domainVisual){tickDomainVisual(dt);render();if(s.running)raf=requestAnimationFrame(tick);return;}
 if(s.enemyTransition){tickEnemyReplacement(dt);render();if(s.running)raf=requestAnimationFrame(tick);return;}
 tickDamageNumbers(dt);
 if(s.deathTransition){tickDeathTransition(dt);render();if(s.running)raf=requestAnimationFrame(tick);return;}
 tickSfx(dt);
 if(s.domainVisual){tickDomainVisual(dt);render();if(s.running)raf=requestAnimationFrame(tick);return;}
 tickHitVisual(dt);
 if(s.phase==='LOADING'){s.loadingTime=Math.max(0,s.loadingTime-dt);$('loading-progress').style.width=(650-s.loadingTime)/650*100+'%';if(s.loadingTime===0){s.phase='BGM_PAINT';showScreen('battle');render();}raf=requestAnimationFrame(tick);return;}
 if(s.phase==='BGM_PAINT'){s.phase='BGM_WAIT';s.loadingTime=TRIAL_DELAY_MS;startBattleAudio();render();raf=requestAnimationFrame(tick);return;}
 if(s.phase==='BGM_WAIT'){
  const bgm=audioTrack('battle-bgm');if(bgm?.error)bgmFailed=true;
  if(bgmFailed)s.loadingTime=Math.max(0,s.loadingTime-dt);else s.loadingTime=Math.max(0,TRIAL_DELAY_MS-(bgm.currentTime||0)*1000);
  if(s.loadingTime<=0){s.phase='INTRO';s.introTime=2200;$('trial-intro').hidden=false;pulse('trial-intro','play');playTrialSound();render();}
  raf=requestAnimationFrame(tick);return;
 }
 if(s.phase==='INTRO'){s.introTime-=dt;if(s.introTime<=0){$('trial-intro').hidden=true;enterAction();}raf=requestAnimationFrame(tick);return;}
 if(s.apClearing>0){s.apClearing=Math.max(0,s.apClearing-dt);if(!s.apClearing){s.ap=s.apTarget;s.apFill=1000;s.apFillElapsed=0;render();}raf=requestAnimationFrame(tick);return;}
 if(s.tagFxTime>0){s.tagFxTime=Math.max(0,s.tagFxTime-dt);if(!s.tagFxTime){$('scene').classList.remove('tag-camera');$('ally').classList.remove('tag-enter','survivor-arrival');}}
 if(s.breakFxTime>0){s.breakFxTime=Math.max(0,s.breakFxTime-dt);if(!s.breakFxTime)$('scene').classList.remove('break-impact');}
 if(s.nonoBuffTime>0)s.nonoBuffTime=Math.max(0,s.nonoBuffTime-dt);
 if(s.apFill>0){s.apFill-=dt;s.apFillElapsed+=dt;}if(s.enemyTime>0){s.enemyTime=Math.max(0,s.enemyTime-dt);if(!s.enemyTime)clearEnemy();}if(s.poseTime>0){s.poseTime=Math.max(0,s.poseTime-dt);if(!s.poseTime){clearPose();$('scene').classList.remove('clash');}}if(s.gradeTime>0){s.gradeTime-=dt;if(s.gradeTime<=0)$('grade').hidden=true;}if(s.busy>0)s.busy=Math.max(0,s.busy-dt);
 if(s.charging){s.chargeElapsed=Math.min(1800,s.chargeElapsed+dt);tickChargeSound();}
 const locked=s.busy||s.poseTime||s.enemyTime;
 if(s.victoryPending&&!locked){finish(true);if(s.enemyTransition)raf=requestAnimationFrame(tick);return;}
 if(!locked&&!s.charging&&s.autoAttackAfterParry){s.autoAttackAfterParry=false;if(s.ap>=skills.attack.cost){log('패링 후 일반 공격 자동 발동');s.parryFollowHit=true;execute('attack');s.parryFollowHit=false;if(s.running)pulse('ally','parry-follow','survivor-arrival');}else log('패링 후 일반 공격 · AP 부족');}
 else if(!locked&&!s.charging&&s.commands.length){const kind=s.commands.shift();s.commandCosts.shift();execute(kind,kind==='skill'?s.skillLevels.shift():1,kind==='skill'?s.skillSounds.shift():false);}
 else if(s.phase==='ACTION'&&!s.charging&&!s.breakRest){
  // Charge freezes both the action icon and its attack deadline.
  s.elapsed=Math.min(s.duration,s.elapsed+dt);
  $('runner').style.left=(94+186*(s.elapsed/s.duration))+'px';
  const counterProgress=Math.min(1,s.elapsed/s.counterDuration);
  $('pointer').style.left=counterProgress*100+'%';
  if(s.pattern==='counter'&&counterProgress>s.purpleEnd){
   resolveFailure();
  }else if(s.elapsed>=s.duration)resolveFailure();
 }
 else if(s.phase==='ACTION'&&s.breakRest&&!locked&&!s.charging){s.advance-=dt;if(s.advance<=0)next();}
 else if(s.phase==='ENGAGE'&&!locked&&!s.charging){if(s.ap===0&&!s.commands.length)s.advance=Math.min(s.advance,350);s.advance-=dt;if(s.advance<=0)next();}
 render();if(s.running)raf=requestAnimationFrame(tick);
}
function reset(){closePartySkills(false);sceneLoadToken++;sceneReady=false;clearLiveHitEffects();stopChargeHum();skillPointer=null;pointerSkill=false;suppressSkillClickUntil=0;hideAudioGate();mobileVideo=null;audioPrepared=false;audioPreparing=false;clearVictory();if(s)s.nonoBuffTime=0;$('damage-layer').replaceChildren();$('reserve-damage-layer').replaceChildren();$('engage-damage').hidden=true;clearUltimateImpact();clearUltimateMovie();pausedAudio=[];$('pause-overlay').hidden=true;$('battle').classList.remove('is-paused');clearDeathVisual();$('projectile-fx').classList.remove('flying');$('hit').classList.remove('flash');stopBattleAudio();cancelAnimationFrame(raf);clearDomainVisual();$('scene').classList.remove('break-impact','tag-camera');showScreen('selection');clearPose();clearEnemy();$('scene').classList.remove('clash');$('grade').hidden=true;$('trial-intro').hidden=true;s={victoryOwner:null,victorySequence:null,nonoBuffTime:0,nonoBuffLevel:1,damageNumbers:[],engageDamage:0,paused:false,releaseAfterPause:false,deathTransition:null,victoryPending:false,hitFxQueue:[],parryFollowHit:false,domainVisual:null,domainVisualQueue:[],domainImpactCount:0,tagFxTime:0,breakRest:false,breakUntilRound:0,breakFxTime:0,enemyBP:ENEMY_BP_MAX,enemyBroken:false,breakRewardPending:false,lastBreakBonus:0,magicChain:null,enemyEffects:{},effectSignature:null,battleStates:{},skillLevels:[],skillSounds:[],commandCosts:[],charging:false,chargeElapsed:0,loadingTime:0,introTime:0,commands:[],counterIndex:0,generatedTail:[],apClearing:0,clearCount:0,apTarget:4,enemyTime:0,apFill:0,apFillElapsed:0,poseTime:0,gradeTime:0,autoAttackAfterParry:false,tagDefenseActive:false,specialVisual:null,running:false,phase:'READY',round:1,ap:0,enemyHP:100,hp:[5000,5000,5000,5000],energy:[100,100,100,100],active:0,party:[...selected],pattern:'normal',canAct:false,busy:0,advance:0,elapsed:0,duration:2800};initEnemyRoster();$('enemy').classList.remove('enemy-arrival');$('enemy').hidden=false;history.length=0;$('log').replaceChildren();setText('status','파티를 편성하고 전투 시작을 눌러주세요.');$('result').hidden=true;$('queue').replaceChildren();$('runner').hidden=true;formation();render();}
function start(){if(s.running||!selected.length)return;reset();s.running=true;for(const i of s.party){const id=roster[i].id;stateFor(id);if(id==='koyomi')grantUS(id,750);}s.phase='LOADING';s.loadingTime=650;s.ap=0;primeBattleAudio();prepareBattleScene();prepareBattleEffects();warmPartyVisuals();showScreen('loading');$('loading-progress').style.width='0%';formation();render();last=performance.now();raf=requestAnimationFrame(tick);}
for(const group of Object.keys(filters)){for(const value of [...new Set(roster.map(m=>m[group]))]){$('filter-'+group+'-'+value).onclick=()=>{const set=filters[group];if(set.has(value))set.delete(value);else set.add(value);$('filter-'+group+'-'+value).classList.toggle('active',set.has(value));$('filter-'+group+'-'+value).setAttribute('aria-pressed',String(set.has(value)));filterRoster();};}}$('clear-filters').onclick=()=>{for(const group of Object.keys(filters)){for(const value of filters[group]){$('filter-'+group+'-'+value).classList.remove('active');$('filter-'+group+'-'+value).setAttribute('aria-pressed','false');}filters[group].clear();}$('character-search').value='';filterRoster();};
$('character-search').oninput=filterRoster;$('collapse-list').onclick=()=>{const body=$('character-list-body');body.hidden=!body.hidden;setText('collapse-list',body.hidden?'목록 펼치기':'목록 접기');$('collapse-list').setAttribute('aria-expanded',String(!body.hidden));};
for(const k of Object.keys(skills))$(k).onclick=()=>attack(k);
let pointerSkill=false,skillPointer=null,suppressSkillClickUntil=0;
const skillButton=$('skill');
function finishSkillHold(){if(skillPointer===null)return;skillPointer=null;suppressSkillClickUntil=performance.now()+750;releaseCharge();}
skillButton.onpointerdown=e=>{
 if(e.button!==undefined&&e.button!==0||e.isPrimary===false||skillPointer!==null||skillButton.disabled)return;
 if(!chargeAvailable())return;
 e.preventDefault();beginCharge();if(!s.charging)return;
 pointerSkill=true;skillPointer=e.pointerId;
 try{skillButton.setPointerCapture?.(e.pointerId);}catch{}
};
skillButton.onpointerup=e=>{if(e.pointerId!==skillPointer)return;e.preventDefault();finishSkillHold();};
skillButton.onpointercancel=e=>{if(e.pointerId===skillPointer)finishSkillHold();};
skillButton.onlostpointercapture=e=>{if(e.pointerId===skillPointer)finishSkillHold();};
skillButton.onclick=e=>{if(performance.now()<suppressSkillClickUntil||skillPointer!==null){e?.preventDefault();return;}pointerSkill=false;attack('skill');};
// Apply prevention to the actual hit target, including nested images and labels.
for(const id of ['skill','attack','ultimate','counter-button']){
 const button=$(id);
 button.addEventListener('contextmenu',e=>e.preventDefault());
 button.addEventListener('selectstart',e=>e.preventDefault());
 button.addEventListener('dragstart',e=>e.preventDefault());
 for(const image of button.querySelectorAll?.('img')||[])image.draggable=false;
}
// Touch-only fallback for Safari versions without Pointer Events.
if(!window.PointerEvent){
 skillButton.addEventListener('touchstart',e=>{if(skillPointer!==null||skillButton.disabled||!chargeAvailable())return;e.preventDefault();beginCharge();if(s.charging){skillPointer=e.changedTouches[0].identifier;pointerSkill=true;}},{passive:false});
 for(const type of ['touchend','touchcancel'])skillButton.addEventListener(type,e=>{if([...e.changedTouches].some(t=>t.identifier===skillPointer)){e.preventDefault();finishSkillHold();}},{passive:false});
}
addEventListener('blur',()=>{if(s.running)pauseBattle();});
addEventListener('keyup',e=>{if(e.code==='KeyW')releaseCharge();});
$('counter-button').onclick=counter;$('start').onclick=start;$('reset').onclick=reset;$('restart').onclick=start;$('end').onclick=()=>{if(!$('end').disabled)next();};
$('reform-party').onclick=()=>{const party=[...s.party];reset();selected=party;s.party=[...party];formation();render();};$('pause-restart').onclick=()=>{const party=[...s.party];reset();selected=party;start();};$('pause-button').onclick=pauseBattle;$('resume').onclick=resumeBattle;
addEventListener('keydown',e=>{if(s.paused){if(e.code==='Escape'){e.preventDefault();if(!$('party-skills-panel').hidden)closePartySkills();else resumeBattle();}return;}if(e.repeat||/INPUT|SELECT|TEXTAREA|SUMMARY/.test(document.activeElement.tagName))return;if(e.code==='KeyW'&&chargeAvailable()){e.preventDefault();beginCharge();return;}const map={KeyQ:'attack',KeyW:'skill',KeyE:'ultimate',Space:'counter-button',Enter:'end'};if(map[e.code]){e.preventDefault();$(map[e.code]).click();}if(/^Digit[1-4]$/.test(e.code))tag(Number(e.code.slice(-1))-1);});
for(const id of ['attack','skill','ultimate','counter-button'])$(id).addEventListener?.('animationend',e=>{if(e.target===$(id)&&e.animationName==='buttonUse')$(id).classList.remove('used');});
for(const id of ['ally','enemy','hit'])$(id).addEventListener?.('animationend',e=>{if(e.target!==$(id))return;$(id).classList.remove('flash','hurt','strike');});
// Battle touch guard: cancel Safari's tap default before it can become zoom.
// Pointer events still reach charge holds and the victory double-tap handler.
const battleTouchRoot=$('viewport');
let battleTap=null,battleTouchClickUntil=0;
battleTouchRoot.addEventListener('touchstart',e=>{
 if(e.touches.length!==1){battleTap=null;return;}
 const t=e.changedTouches[0],button=e.target.closest?.('button');
 battleTap={id:t.identifier,x:t.clientX,y:t.clientY,button,
  hold:button===skillButton&&chargeAvailable(),moved:false};
},{passive:true});
battleTouchRoot.addEventListener('touchmove',e=>{
 if(battleTap){const t=[...e.touches].find(t=>t.identifier===battleTap.id);
  if(!t||Math.hypot(t.clientX-battleTap.x,t.clientY-battleTap.y)>12)battleTap.moved=true;}
 if(e.cancelable)e.preventDefault();
},{passive:false});
battleTouchRoot.addEventListener('touchend',e=>{
 if(e.cancelable)e.preventDefault();
 battleTouchClickUntil=performance.now()+800;
 const tap=battleTap;
 if(!tap||![...e.changedTouches].some(t=>t.identifier===tap.id))return;
 battleTap=null;
 // Touchend suppresses the native click; deliver exactly one to normal buttons.
 // Charge release is already owned by pointerup / the touch-only fallback.
 if(!tap.moved&&!tap.hold&&tap.button&&!tap.button.disabled&&battleTouchRoot.contains(tap.button))tap.button.click();
},{passive:false,capture:true});
battleTouchRoot.addEventListener('touchcancel',()=>{battleTap=null;},{passive:true});
battleTouchRoot.addEventListener('click',e=>{
 // Reject a delayed browser-generated touch click, but allow our click(), mouse and keyboard.
 if(e.isTrusted&&e.detail>0&&e.pointerType!=='mouse'&&performance.now()<battleTouchClickUntil){e.preventDefault();e.stopImmediatePropagation();}
},{capture:true});
for(const type of ['gesturestart','gesturechange','gestureend','dblclick'])battleTouchRoot.addEventListener(type,e=>{if(e.cancelable)e.preventDefault();},{passive:false});
window.mobileAudioStatus=()=>({...BattleAudio.status(),prepared:audioPrepared,preparing:audioPreparing,blocked:mobileBlocked});window.combatSnapshot=()=>JSON.parse(JSON.stringify(s));reset();
})();



