const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../combat-rules.html'),'utf8');
const data=JSON.parse(html.match(/id="rule-skill-data">(.*?)<\/script>/s)[1]);
assert(Object.keys(data).length>25);
for(const entry of Object.values(data)){assert(entry.cards.length);for(const c of entry.cards){assert(c.name&&c.character&&c.text);assert.match(c.href,/^characters.html#[a-z]+-(skills|ability|domain)$/);}}
assert(Object.values(data).some(e=>e.title.startsWith('저주')&&e.cards.some(c=>c.character==='하루')));
assert(Object.values(data).some(e=>e.title.startsWith('루나 ·')&&e.cards.some(c=>c.name==='얼음의 축복')));
class Node{constructor(){this.events={};this.style={};this.dataset={};this.children=[];this.attrs={};this.hidden=false;}addEventListener(k,f){this.events[k]=f;}setAttribute(k,v){this.attrs[k]=v;}appendChild(n){this.children.push(n);}replaceChildren(){this.children=[];}getBoundingClientRect(){return {left:100,bottom:200,height:300};}contains(n){return n===this||this.children.includes(n);}focus(){this.events.focus?.();}}
const nodes={};for(const key of ['rule-skill-data','rule-skill-popup','rule-skill-title','rule-skill-content','rule-skill-close'])nodes[key]=new Node;
nodes['rule-skill-data'].textContent=JSON.stringify(data);nodes['rule-skill-popup'].hidden=true;
const button=new Node;button.dataset.skillRef=Object.keys(data)[0];const events={};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../rule-skill-popups.js'),'utf8'),{document:{getElementById:k=>nodes[k],querySelectorAll:()=>[button],createElement:()=>new Node,addEventListener:(k,f)=>events[k]=f},window:{innerWidth:390,innerHeight:700,addEventListener(){}},setTimeout:()=>1,clearTimeout(){}});
button.events.pointerenter({pointerType:'touch'});assert(nodes['rule-skill-popup'].hidden);
button.events.click();assert(!nodes['rule-skill-popup'].hidden);assert.equal(button.attrs['aria-expanded'],'true');assert.equal(nodes['rule-skill-popup'].style.width,'366px');
button.events.click();assert(nodes['rule-skill-popup'].hidden);
button.events.pointerenter({pointerType:'mouse'});assert(!nodes['rule-skill-popup'].hidden);
events.keydown({key:'Escape',preventDefault(){}});assert(nodes['rule-skill-popup'].hidden);
button.events.click();events.pointerdown({target:new Node});assert(nodes['rule-skill-popup'].hidden);
button.events.focus();button.events.keydown({key:'ArrowDown',preventDefault(){}});nodes['rule-skill-close'].events.click();assert(nodes['rule-skill-popup'].hidden);
console.log('PASS popup reference data, curse/Haru, Luna ability, touch toggle, desktop hover, Escape, outside close, keyboard, small-screen sizing');
