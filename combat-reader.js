(()=>{
 const params=new URLSearchParams(location.search);
 const ids=[...new Set((params.get('party')||'').split(','))].filter(id=>/^[a-z]+$/.test(id)&&document.getElementById('reader-'+id)).slice(0,4);
 const names={canon:'카논',moa:'하나모리 모아',erin:'타나카 에린',mayoi:'케이코 마요이',anna:'안나',haru:'하루',akina:'아키나',chikage:'치카게',doll:'인형',koyomi:'코요미',liria:'리리아',luna:'루나',mai:'마이',nono:'노노',ren:'렌',shion:'시온',sigrid:'울브헤른',souka:'소우카'};
 const nav=document.getElementById('reader-party');
 function select(id){
  document.querySelectorAll('.reader-character').forEach(c=>c.hidden=c.id!=='reader-'+id);
  nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
  document.querySelector('.tooltip')?.setAttribute('aria-hidden','true');
  window.scrollTo(0,0);
 }
 ids.forEach(id=>{
  const b=document.createElement('button');b.type='button';b.dataset.id=id;
  const img=document.createElement('img');img.src='assets/cards/'+id+'.webp';img.alt='';
  const label=document.createElement('span');label.textContent=names[id];
  b.append(img,label);b.onclick=()=>select(id);nav.append(b);
 });
 select(ids.includes(params.get('active'))?params.get('active'):ids[0]);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();parent.postMessage('close-party-skills',location.origin);}});
})();
