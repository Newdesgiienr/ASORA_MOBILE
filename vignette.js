(() => {
'use strict';
const TERM_LIST = window.AO_TERMS?.terms || [];
const TERMS = new Map(TERM_LIST.map(t=>[t.id,t]));
const esc = v => String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const term = (id,label) => `<button type="button" class="term-link vignette-term-link" data-term="${id}">${label}</button>`;
const element = (key,name) => `<span class="artifact-inline-element"><span class="artifact-inline-icon"><img alt="${name}" src="assets/${key}.png"/></span><span>${name}</span></span>`;
const VIGNETTES = [
 {id:'blossom-road',name:'Blossom Road',grade:'SSR',image:'assets/vignettes/video/blossom-road.jpg',effects:[`HP 50% 이하인 필드 위 아군의 공격력 <strong>24%</strong> 증가`]},
 {id:'missing-wizard-night',name:'사라진 마법사와 괴담 사냥꾼들의 밤',grade:'SSR',image:'assets/vignettes/video/missing-wizard-night.jpg',effects:[`전투 시작 10${term('round','라운드')} 후 아군 전체의 공격력 <strong>20%</strong> 증가`]},
 {id:'first-flight',name:'첫 비상',grade:'SSR',image:'assets/vignettes/video/first-flight.jpg',effects:[`아군 전체의 BP <strong>9.5%</strong> 증가`,`기본 ${term('ap','AP')} <strong>+1</strong>`]},
 {id:'tokyo-civil-servant-wizard',name:'도쿄, 공무원, 그리고 마법사',grade:'SSR',image:'assets/vignettes/video/tokyo-civil-servant-wizard.jpg',effects:[`전투 시작 10${term('round','라운드')} 후 아군 전체의 타격력 <strong>11.5%</strong> 증가`]},
 {id:'shooting-star-tower-girl-cat',name:'별똥별, 타워, 소녀, 그리고 고양이',grade:'SSR',image:'assets/vignettes/video/shooting-star-tower-girl-cat.jpg',effects:[`아군이 일반 스킬 사용 시 아군 전체의 전투 스킬 피해량 <strong>23.5%</strong> 증가 (최대 1중첩) <span class="artifact-effect-note">(유지 ${term('round','라운드')} 1)</span>`]},
 {id:'urban-legend-hunt',name:'괴담 사냥',grade:'SSR',image:'assets/vignettes/video/urban-legend-hunt.jpg',effects:[`전투 시작 시 아군 전체의 공격력 <strong>16%</strong> 증가 <span class="artifact-effect-note">(유지 ${term('round','라운드')} 4)</span>`]},
 {id:'divine-trial',name:'신명 재판',grade:'SR',image:'assets/vignettes/video/divine-trial.jpg',effects:[`아군이 일반 스킬 사용 시 아군 전체의 ${term('us','US 포인트')} <strong>+9</strong>`]},
 {id:'metal-is-justice',name:'메탈 이즈 저스티스!',grade:'SR',image:'assets/vignettes/video/metal-is-justice.jpg',effects:[`HP 50% 이하인 필드 위 아군의 공격력 <strong>12%</strong> 증가`]},
 {id:'response',name:'응답',grade:'SR',image:'assets/vignettes/video/response.jpg',effects:[`HP 50% 이하인 필드 위 아군의 ${term('us','US 포인트')} 회복 <strong>10%</strong> 증가`]},
 {id:'metal-sheriff-sylvan',name:'메탈 보안관 시르반',grade:'SR',image:'assets/vignettes/video/metal-sheriff-sylvan.jpg',effects:[`HP 50% 이하인 필드 위 아군의 방어력 <strong>20%</strong> 증가`]},
 {id:'run-toward-light',name:'빛을 향해 달리다',grade:'SR',image:'assets/vignettes/video/run-toward-light.jpg',effects:[`전투 시작 시 적 전체의 공격력 <strong>12%</strong> 감소 <span class="artifact-effect-note">(유지 ${term('round','라운드')} 4)</span>`]},
 {id:'urban-legend-hunters-active',name:'괴담 사냥꾼들의 활약',grade:'SR',image:'assets/vignettes/video/urban-legend-hunters-active.jpg',effects:[`아군 전체의 ${term('us','US 포인트')} 회복 <strong>5%</strong> 증가`,`아군이 적 처치 시 아군 전체의 ${term('us','US 포인트')} <strong>13.5%</strong> 회복`]},
 {id:'minato-night',name:'미나토구의 밤',grade:'SR',image:'assets/vignettes/video/minato-night.jpg',effects:[`아군 전체의 ${element('nox','녹스')} 속성 공격력 <strong>7.5%</strong> 증가`]},
 {id:'flutter',name:'설렘',grade:'SR',image:'assets/vignettes/video/flutter.jpg',effects:[`아군 전체의 HP <strong>6%</strong> 증가`,`5${term('round','라운드')}마다 필드 위 적에게 ${term('fracture','#파쇄')} 1중첩 부여`]},
 {id:'importance-of-recon',name:'정찰의 중요성',grade:'SR',image:'assets/vignettes/video/importance-of-recon.jpg',effects:[`전투 시작 시 적 전체의 방어력 <strong>20.5%</strong> 감소 <span class="artifact-effect-note">(유지 ${term('round','라운드')} 4)</span>`]},
 {id:'festival-of-nightless-city',name:'불야성의 축제',grade:'SR',image:'assets/vignettes/video/festival-of-nightless-city.jpg',effects:[`아군 전체의 HP <strong>6%</strong> 증가`,`6${term('round','라운드')}마다 필드 위 적에게 ${term('curse','#저주')} 1중첩 부여`]},
 {id:'city-incarnation',name:'도시의 화신',grade:'R',image:'assets/vignettes/video/city-incarnation.jpg',effects:[`아군 전체의 타격력 <strong>4%</strong> 증가`]},
 {id:'guardian-in-bag',name:'가방 속의 수호자',grade:'R',image:'assets/vignettes/video/guardian-in-bag.jpg',effects:[`아군 전체의 치명타 확률 <strong>6%</strong> 증가`]},
 {id:'fiat-astra',name:'피아트 아스트라',grade:'R',image:'assets/vignettes/video/fiat-astra.jpg',effects:[`아군 전체의 HP <strong>4%</strong> 증가`]},
 {id:'tower-and-meteor-shower',name:'탑과 유성우',grade:'R',image:'assets/vignettes/video/tower-and-meteor-shower.jpg',effects:[`아군 전체의 방어력 <strong>7%</strong> 증가`]},
 {id:'paradigm-shift',name:'패러다임 시프트',grade:'R',image:'assets/vignettes/video/paradigm-shift.jpg',effects:[`영지 선언 시 아군 전체의 공격력, 타격력 <strong>3.2%</strong> 증가 <span class="artifact-effect-note">(유지 ${term('round','라운드')} 2)</span>`]},
 {id:'call-of-inaegak',name:'이내각의 부름',grade:'R',image:'assets/vignettes/video/call-of-inaegak.jpg',effects:[`아군 전체의 BP <strong>4%</strong> 증가`]}
];
const gradeOrder = {SSR:0,SR:1,R:2};
VIGNETTES.sort((a,b)=>(gradeOrder[a.grade]-gradeOrder[b.grade]) || a.name.localeCompare(b.name,'ko'));
const list=document.getElementById('vignette-list'), count=document.getElementById('vignette-count'), empty=document.getElementById('vignette-empty'), search=document.getElementById('vignette-search'), reset=document.getElementById('vignette-reset-filters');
let selectedGrade='';
const strip = html => { const d=document.createElement('div'); d.innerHTML=html; return d.textContent||''; };
const renderCard = v => `<details class="artifact-entry artifact-sheet vignette-sheet" data-id="${v.id}" data-grade="${v.grade}" data-search="${esc([v.name,v.grade,...v.effects.map(strip)].join(' ').toLowerCase())}">
<summary class="artifact-sheet-titlebar"><div class="artifact-sheet-title-row"><h2>${esc(v.name)}</h2><span aria-hidden="true" class="summary-action"><i></i></span></div><div class="artifact-sheet-summary-art"><img alt="${esc(v.name)} 비네트 이미지" loading="lazy" src="${v.image}"/></div></summary>
<div class="artifact-sheet-body vignette-sheet-body"><section class="artifact-sheet-effect-section vignette-effect-section"><div class="artifact-sheet-effects">${v.effects.map(e=>`<p>${e}</p>`).join('')}</div></section></div></details>`;
list.innerHTML=VIGNETTES.map(renderCard).join('');
function applyFilters(){const q=(search?.value||'').trim().toLowerCase();let visible=0;list.querySelectorAll('.vignette-sheet').forEach(card=>{const okGrade=!selectedGrade||card.dataset.grade===selectedGrade;const okSearch=!q||card.dataset.search.includes(q);card.hidden=!(okGrade&&okSearch);if(!card.hidden)visible++;});count.textContent=String(visible);empty.hidden=visible>0;reset.hidden=!selectedGrade&&!q;}
search?.addEventListener('input',applyFilters);
document.querySelectorAll('.vignette-grade-filter').forEach(btn=>btn.addEventListener('click',()=>{const val=btn.dataset.filterValue||'';selectedGrade=selectedGrade===val?'':val;document.querySelectorAll('.vignette-grade-filter').forEach(b=>b.classList.toggle('active',b.dataset.filterValue===selectedGrade));applyFilters();}));
reset?.addEventListener('click',()=>{selectedGrade='';if(search)search.value='';document.querySelectorAll('.vignette-grade-filter').forEach(b=>b.classList.remove('active'));applyFilters();});
document.getElementById('vignette-expand-all')?.addEventListener('click',()=>list.querySelectorAll('details:not([hidden])').forEach(d=>d.open=true));
document.getElementById('vignette-collapse-all')?.addEventListener('click',()=>list.querySelectorAll('details').forEach(d=>d.open=false));

// Same floating glossary tooltip behavior used on character pages.
const tooltip=document.querySelector('.tooltip');let active=null;
const definition=t=>t?.sections?.find(s=>s.label==='정의 및 효과 설명')?.text||t?.sections?.[0]?.text||'';
function place(target){if(!tooltip)return;const r=target.getBoundingClientRect(),tr=tooltip.getBoundingClientRect();let l=r.left+r.width/2-tr.width/2;l=Math.max(12,Math.min(l,window.innerWidth-tr.width-12));let top=r.top-tr.height-10;if(top<10)top=r.bottom+10;tooltip.style.left=`${l}px`;tooltip.style.top=`${top}px`;}
function show(target){const t=TERMS.get(target.dataset.term);if(!tooltip||!t)return;active=target;tooltip.innerHTML=`<div class="tooltip-category">${esc(t.category)}</div><h3>${esc(t.name)}</h3><p>${esc(definition(t)).replaceAll('\n','<br>')}</p>`;tooltip.classList.add('visible');tooltip.setAttribute('aria-hidden','false');requestAnimationFrame(()=>place(target));}
function hide(){active=null;tooltip?.classList.remove('visible');tooltip?.setAttribute('aria-hidden','true');}
document.addEventListener('mouseover',e=>{const t=e.target.closest('.term-link[data-term]');if(t)show(t);});
document.addEventListener('mouseout',e=>{const t=e.target.closest('.term-link[data-term]');if(!t)return;if(e.relatedTarget&&t.contains(e.relatedTarget))return;hide();});
document.addEventListener('click',e=>{const t=e.target.closest('.term-link[data-term]');if(t){e.preventDefault();active===t?hide():show(t)}else if(!e.target.closest('.tooltip'))hide();});
window.addEventListener('scroll',()=>{if(active)place(active)},{passive:true});window.addEventListener('resize',()=>{if(active)place(active)});document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
applyFilters();
})();
