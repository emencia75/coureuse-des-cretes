/* ================= Particules ================= */
const DUST=90;const dustGeo=new THREE.BufferGeometry();const dustPos=new Float32Array(DUST*3);dustGeo.setAttribute("position",new THREE.BufferAttribute(dustPos,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xb89a72,size:.3,map:dotTex,transparent:true,opacity:.55,depthWrite:false}));dust.frustumCulled=false;scene.add(dust);
const dustP=[];for(let i=0;i<DUST;i++){dustP.push({x:0,y:-999,z:0,vx:0,vy:0,vz:0,life:0});}let dustI=0;
function puff(x,y,z,n){for(let k=0;k<n;k++){const p=dustP[dustI=(dustI+1)%DUST];p.x=x+(Math.random()-.5)*.3;p.y=y+.05;p.z=z+(Math.random()-.5)*.3;p.vx=(Math.random()-.5)*.8;p.vy=.4+Math.random()*.7;p.vz=(Math.random()-.5)*.8;p.life=.7+Math.random()*.4;}}
const SPL=60;const splGeo=new THREE.BufferGeometry();const splPos=new Float32Array(SPL*3);splGeo.setAttribute("position",new THREE.BufferAttribute(splPos,3));
const splPts=new THREE.Points(splGeo,new THREE.PointsMaterial({color:0xe4eef5,size:.2,map:dotTex,transparent:true,opacity:.9,depthWrite:false}));splPts.frustumCulled=false;scene.add(splPts);
const splP=[];for(let i=0;i<SPL;i++)splP.push({x:0,y:-999,z:0,vx:0,vy:0,vz:0,life:0});let splI=0;
function splash(x,y,z,n){for(let k=0;k<n;k++){const p=splP[splI=(splI+1)%SPL];p.x=x+(Math.random()-.5)*.3;p.y=y;p.z=z+(Math.random()-.5)*.3;p.vx=(Math.random()-.5)*2;p.vy=1.5+Math.random()*1.5;p.vz=(Math.random()-.5)*2;p.life=.5;}}
function updSplash(dt){for(let i=0;i<SPL;i++){const p=splP[i];if(p.life>0){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=9*dt;if(p.life<=0)p.y=-999;}splPos[i*3]=p.x;splPos[i*3+1]=p.y;splPos[i*3+2]=p.z;}splGeo.attributes.position.needsUpdate=true;}
function updDust(dt){for(let i=0;i<DUST;i++){const p=dustP[i];if(p.life>0){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=.6*dt;if(p.life<=0)p.y=-999;}dustPos[i*3]=p.x;dustPos[i*3+1]=p.y;dustPos[i*3+2]=p.z;}dustGeo.attributes.position.needsUpdate=true;}
/* ================= Son ================= */
let AC=null,master=null,windG=null,noiseBuf=null,muted=false;
try{muted=localStorage.getItem("cdc-muted")==="1";}catch(e){}
// Musique de fond « Run the Ridge » (démarre au premier geste, en boucle)
const music=new Audio("run-the-ridge.mp3");music.loop=true;music.preload="auto";music.volume=.4;
function playMusic(){if(muted)return;try{const p=music.play();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
function musicVol(v){music.volume=v;}
window.addEventListener("pointerdown",()=>{if(music.paused)playMusic();},{once:true});
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=muted?0:.8;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const src=AC.createBufferSource();src.buffer=noiseBuf;src.loop=true;const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=420;windG=AC.createGain();windG.gain.value=0;src.connect(lp);lp.connect(windG);windG.connect(master);src.start();}catch(e){AC=null;}}
function sfxStep(vol){if(!AC)return;const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=noiseBuf;const bp=AC.createBiquadFilter();bp.type="bandpass";bp.frequency.value=700+Math.random()*500;bp.Q.value=1.2;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);s.connect(bp);bp.connect(g);g.connect(master);s.start(t,Math.random()*1.5,.08);}
function sfxBeep(f,dur){if(!AC)return;const t=AC.currentTime;const o=AC.createOscillator();o.type="square";o.frequency.value=f;const g=AC.createGain();g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur);}
function sfxThud(){if(!AC)return;const t=AC.currentTime;const o=AC.createOscillator();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(40,t+.3);const g=AC.createGain();g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);g.connect(master);o.start(t);o.stop(t+.36);sfxStep(.5);}
function sfxPick(){if(!AC)return;const t=AC.currentTime;[660,990].forEach((f,i)=>{const o=AC.createOscillator();o.type="triangle";o.frequency.value=f;const g=AC.createGain();g.gain.setValueAtTime(.0001,t+i*.07);g.gain.exponentialRampToValueAtTime(.15,t+i*.07+.01);g.gain.exponentialRampToValueAtTime(.001,t+i*.07+.18);o.connect(g);g.connect(master);o.start(t+i*.07);o.stop(t+i*.07+.2);});}
function sfxRumble(){if(!AC)return;const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=noiseBuf;const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=180;const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.7,t+.15);g.gain.exponentialRampToValueAtTime(.001,t+1.6);s.connect(lp);lp.connect(g);g.connect(master);s.start(t,0,1.7);}
function sfxWhistle(){if(!AC)return;const t=AC.currentTime;const o=AC.createOscillator();o.type="sine";o.frequency.setValueAtTime(2900,t);o.frequency.exponentialRampToValueAtTime(2300,t+.28);const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.13,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(master);o.start(t);o.stop(t+.32);}
function sfxSplash(){if(!AC)return;const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=noiseBuf;const hp=AC.createBiquadFilter();hp.type="highpass";hp.frequency.value=1400;const g=AC.createGain();g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);s.connect(hp);hp.connect(g);g.connect(master);s.start(t,Math.random(),.4);}
function sfxThunder(delay,dist){if(!AC)return;const t=AC.currentTime+delay;const s=AC.createBufferSource();s.buffer=noiseBuf;const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=dist<260?420:200;const g=AC.createGain();const v=clamp(1.1-dist/700,.25,1);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.06);g.gain.exponentialRampToValueAtTime(v*.5,t+.6);g.gain.exponentialRampToValueAtTime(.001,t+2.6);s.connect(lp);lp.connect(g);g.connect(master);s.start(t,Math.random(),2.7);}
let rainG=null;function initRain(){if(!AC||rainG)return;const src=AC.createBufferSource();src.buffer=noiseBuf;src.loop=true;const bp=AC.createBiquadFilter();bp.type="bandpass";bp.frequency.value=2600;bp.Q.value=.6;rainG=AC.createGain();rainG.gain.value=0;src.connect(bp);bp.connect(rainG);rainG.connect(master);src.start();}
const muteBtn=$("muteBtn");function syncMute(){muteBtn.textContent=muted?"Son : non":"Son : oui";if(master)master.gain.value=muted?0:.8;music.muted=muted;if(!muted&&music.paused&&AC)playMusic();}syncMute();
muteBtn.addEventListener("click",()=>{muted=!muted;try{localStorage.setItem("cdc-muted",muted?"1":"0");}catch(e){}initAudio();syncMute();muteBtn.blur();});

/* ================= Entrées ================= */
const keys={left:0,right:0,up:0,down:0};let jumpPressed=false;
const KM={ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down"};
window.addEventListener("keydown",e=>{if(e.target&&e.target.tagName==="INPUT"){if(e.key==="Enter")$("startBtn").click();return;}
  if(KM[e.code]){keys[KM[e.code]]=1;e.preventDefault();}
  if(e.code==="Space"){if(!e.repeat)jumpPressed=true;e.preventDefault();}
  if((e.code==="Escape"||e.code==="KeyP")&&(state==="race"||state==="countdown"))togglePause();
  else if(e.code==="Escape"&&state==="paused")togglePause();});
window.addEventListener("keyup",e=>{if(KM[e.code])keys[KM[e.code]]=0;});
window.addEventListener("blur",()=>{keys.left=keys.right=keys.up=keys.down=0;if(state==="race")togglePause();});
function bindTouch(id,on,off){const el=$(id);el.addEventListener("pointerdown",e=>{e.preventDefault();el.setPointerCapture&&el.setPointerCapture(e.pointerId);el.classList.add("on");on();});
  const up=e=>{el.classList.remove("on");off&&off();};el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);el.addEventListener("lostpointercapture",up);}
bindTouch("tLeft",()=>keys.left=1,()=>keys.left=0);bindTouch("tRight",()=>keys.right=1,()=>keys.right=0);
bindTouch("tSprint",()=>keys.up=1,()=>keys.up=0);bindTouch("tBrake",()=>keys.down=1,()=>keys.down=0);bindTouch("tJump",()=>{jumpPressed=true;},null);
const isTouch=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;
