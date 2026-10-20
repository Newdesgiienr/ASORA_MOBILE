const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../combat-rules.html'),'utf8'),code=fs.readFileSync(path.join(__dirname,'../combat-rules.js'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length);
for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),m[1]);
const count=(html.match(/data-temporary/g)||[]).length;assert.equal(count,31);
function node(){const classes=new Set();return {classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},style:{setProperty(){}},focus(){},listeners:{},addEventListener(k,f){this.listeners[k]=f;},setAttribute(){},removeAttribute(){},getBoundingClientRect:()=>({height:60}),scrollIntoView(o){this.scrolled=o;}};}
function test(n,reduced){
 const marks=Array.from({length:n},()=>{const el=node(),row=node();el.closest=()=>row;return el;}),elements={};
 for(const key of ['.rules-page','.temp-toolbar','.app-topbar','temp-count','temp-find','temp-prev','temp-next','temp-controls','temp-close'])elements[key]=node();
 const context={document:{querySelector:k=>elements[k],querySelectorAll:()=>marks,getElementById:k=>elements[k]},window:{addEventListener(){},matchMedia:()=>({matches:reduced})}};
 vm.runInNewContext(code,context);
 const click=k=>elements[k].listeners.click();
 assert.equal(elements['temp-count'].textContent,'0 / '+n);
 assert.equal(elements['.temp-toolbar'].hidden,false);
 assert.equal(elements['temp-controls'].hidden,true);assert.equal(marks.filter(m=>m.scrolled).length,0);click('temp-next');assert.equal(marks.filter(m=>m.scrolled).length,0);
 if(!n){assert(elements['temp-next'].disabled);click('temp-find');return;}
 click('temp-find');assert.equal(elements['temp-count'].textContent,'1 / '+n);assert.equal(marks[0].scrolled.behavior,reduced?'auto':'smooth');
 click('temp-prev');assert.equal(elements['temp-count'].textContent,n+' / '+n);
 click('temp-next');assert.equal(elements['temp-count'].textContent,'1 / '+n);
 for(let i=0;i<n;i++)click('temp-next');
 assert.equal(elements['temp-count'].textContent,'1 / '+n);
 assert.equal(marks.filter(m=>m.classList.contains('is-current')).length,1);assert.equal(elements['temp-controls'].hidden,false);click('temp-close');assert.equal(elements['temp-controls'].hidden,true);assert.equal(marks.filter(m=>m.classList.contains('is-current')).length,0);click('temp-find');assert.equal(elements['temp-count'].textContent,'1 / '+n);
}
test(count,false);test(count,true);test(0,false);
console.log('PASS guide anchors, marker count, first/previous/next/wrap, reduced motion, empty list');

assert(!html.includes('문서 V151'));assert(!html.includes('맞출 예정'));assert(html.includes('CBT 기록을 바탕으로 제작된 전투 시뮬레이터</mark> 입니다.'));assert(html.includes('AP가 0이 되어도 발동'));

