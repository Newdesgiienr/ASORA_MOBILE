/* One user-unlocked Web Audio context; reusable decoded sounds, no HTMLAudio priming. */
(() => {
'use strict';
let ctx, activeLoads=0;
const buffers=new Map(), queue=[], tracks=new Set();
function context(){
 if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw new Error('Web Audio 미지원');ctx=new C();ctx.addEventListener('statechange',()=>{if(ctx.state!=='running')window.dispatchEvent(new Event('battle-audio-interrupted'));});}
 return ctx;
}
function pump(){while(activeLoads<3&&queue.length){activeLoads++;const job=queue.shift();job().finally(()=>{activeLoads--;pump();});}}
function load(url){
 if(buffers.has(url))return buffers.get(url);
 const promise=new Promise((resolve,reject)=>{queue.push(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);try{
 const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status+' '+url);
 const bytes=await response.arrayBuffer();const c=context();const buffer=await new Promise((yes,no)=>c.decodeAudioData(bytes,yes,no));resolve(buffer);
 }catch(e){buffers.delete(url);reject(e);}finally{clearTimeout(timer);}});pump();});buffers.set(url,promise);return promise;
}
class Track {
 constructor(src){this.src=src;this.paused=true;this.ended=false;this.loop=false;this.error=null;this.onended=null;this.onerror=null;this._offset=0;this._volume=1;this._serial=0;tracks.add(this);}
 get duration(){return this._buffer?.duration||0;}
 get currentTime(){if(!this._source)return this._offset;const t=this._offset+context().currentTime-this._started;return this.loop&&this.duration?t%this.duration:Math.min(t,this.duration);}
 set currentTime(t){const playing=!this.paused;this.pause();this._offset=Math.max(0,Number(t)||0);this.ended=false;if(playing)this.play().catch(()=>{});}
 get volume(){return this._volume;}
 set volume(v){this._volume=Math.max(0,Math.min(1,v));if(this._gain)this._gain.gain.value=this._volume;}
 async play(){
 if(!this.paused)return;const serial=++this._serial;this.paused=false;this.ended=false;this.error=null;
 try{const c=context();this._buffer=await load(this.src);if(serial!==this._serial||this.paused)return;
 const source=c.createBufferSource(),gain=c.createGain();source.buffer=this._buffer;source.loop=this.loop;gain.gain.value=this.volume;source.connect(gain);gain.connect(c.destination);
 this._source=source;this._gain=gain;this._started=c.currentTime;if(this._offset>=this.duration)this._offset=0;
 source.onended=()=>{if(serial!==this._serial||this._source!==source)return;this._source=null;this._gain=null;source.disconnect();gain.disconnect();this._offset=this.duration;this.paused=true;this.ended=true;this.onended?.();};source.start(0,this._offset);
 }catch(e){if(serial!==this._serial)return;this.paused=true;this.error=e;this.onerror?.(e);throw e;}
 }
 pause(){this._offset=this.currentTime;this.paused=true;this._serial++;if(this._source){this._source.onended=null;this._source.stop();this._source.disconnect();this._source=null;this._gain?.disconnect();this._gain=null;}}
}
window.BattleAudio={Track,load,
 unlock(){try{if(navigator.audioSession)navigator.audioSession.type='playback';const c=context();const p=c.resume();const source=c.createBufferSource();source.buffer=c.createBuffer(1,1,c.sampleRate);source.connect(c.destination);source.start();return p;}catch(e){return Promise.reject(e);}},
 suspend(){if(ctx&&ctx.state!=='suspended')ctx.suspend().catch(()=>{});},
 get ready(){return !!ctx&&ctx.state==='running';},get state(){return ctx?.state||'not-started';},
 preload(urls){return Promise.all(urls.map(load));},
 retain(urls){const keep=new Set(urls);for(const track of tracks)if(!track.paused)keep.add(track.src);
 for(const url of buffers.keys())if(!keep.has(url))buffers.delete(url);
 for(const track of tracks)if(track.paused&&!keep.has(track.src))track._buffer=null;
 },
 status(){return {state:this.state,cached:buffers.size,loading:activeLoads,queued:queue.length,playing:[...tracks].filter(t=>!t.paused).map(t=>t.src)};}
};
})();

