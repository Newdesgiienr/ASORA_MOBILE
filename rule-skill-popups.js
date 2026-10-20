(() => {
  'use strict';
  const dataNode=document.getElementById('rule-skill-data'),popup=document.getElementById('rule-skill-popup');
  if(!dataNode||!popup)return;
  const data=JSON.parse(dataNode.textContent),title=document.getElementById('rule-skill-title'),content=document.getElementById('rule-skill-content');
  const buttons=Array.from(document.querySelectorAll('[data-skill-ref]'));
  let active=null,pinned=false,timer=0,restoring=false;
  function place(){
    if(!active||popup.hidden)return;
    const r=active.getBoundingClientRect(),w=Math.min(500,window.innerWidth-24);
    popup.style.width=w+'px';
    const h=popup.getBoundingClientRect().height;
    popup.style.left=Math.max(12,Math.min(r.left,window.innerWidth-w-12))+'px';
    popup.style.top=Math.max(12,Math.min(r.bottom+8,window.innerHeight-h-12))+'px';
  }
  function close(restore=false){
    clearTimeout(timer);const previous=active;
    if(active)active.setAttribute('aria-expanded','false');
    popup.hidden=true;active=null;pinned=false;
    if(restore&&previous){restoring=true;previous.focus();restoring=false;}
  }
  function add(tag,text,parent,cls){const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;parent.appendChild(el);return el;}
  function open(button){
    clearTimeout(timer);if(restoring)return;
    const entry=data[button.dataset.skillRef];if(!entry)return;
    if(active&&active!==button){active.setAttribute('aria-expanded','false');pinned=false;}
    active=button;button.setAttribute('aria-expanded','true');title.textContent=entry.title;content.replaceChildren();
    if(entry.kind==='term'){
      add('p','용어사전 · 정의 및 효과',content,'popup-label');
      for(const section of entry.definitions||[]){
        add('h3',section.label,content,'popup-definition-heading');
        add('p',section.text,content,'popup-definition');
      }
    }
    if(entry.context){
      add('p','현재 시뮬레이터 적용 기준',content,'popup-label');
      add('p',entry.context,content,'popup-context');
    }
    if(entry.temporary)add('p','[임시] 본문의 굵은 문장은 정식 출시 전 임의로 적용한 기준입니다.',content,'popup-temporary');
    function cards(items,boss){
      if(!items?.length)return;
      add('p',boss?'스코어 트라이얼 · 보스 기믹':'캐릭터 스킬 · 보존된 설명',content,'popup-label');
      if(!boss)add('p','원문과 현재 시뮬레이터의 적용 기준을 구분합니다.',content,'popup-source-note');
      for(const card of items){
        const article=add('article','',content,boss?'popup-skill-card popup-boss-card':'popup-skill-card');
        add('small',card.character+' · '+card.type,article);
        add('h3',card.name,article);add('p',card.text,article);
        const a=add('a',boss?'스코어 트라이얼에서 확인 ↗':'캐릭터 페이지에서 확인 ↗',article);a.href=card.href;a.target='_blank';a.rel='noopener';
      }
    }
    cards(entry.cards,false);cards(entry.bosses,true);
    popup.hidden=false;place();
  }
  function delayedClose(){clearTimeout(timer);if(!pinned)timer=setTimeout(()=>close(),220);}
  for(const button of buttons){
    button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!pinned)open(button);});
    button.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')delayedClose();});
    button.addEventListener('focus',()=>open(button));
    button.addEventListener('click',()=>{if(active===button&&pinned){close();return;}open(button);pinned=true;});
    button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&!popup.hidden){e.preventDefault();pinned=true;document.getElementById('rule-skill-close').focus();}});
  }
  popup.addEventListener('pointerenter',()=>clearTimeout(timer));
  popup.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')delayedClose();});
  document.getElementById('rule-skill-close').addEventListener('click',()=>close(true));
  document.addEventListener('pointerdown',e=>{if(active&&!popup.contains(e.target)&&!active.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();close(true);}});
  document.addEventListener('focusin',e=>{if(active&&!popup.contains(e.target)&&!active.contains(e.target))close();});
  window.addEventListener('resize',place);
  window.addEventListener('scroll',place,{passive:true});
})();

