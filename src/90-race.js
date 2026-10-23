/* ================= Course ================= */
let camGuardT=0,camGround=-1e9;
let state="menu",raceT=0,countT=0,finishWait=0,lastRank=8,shake=0,menuT=0,lastBeep=4,pausedFrom=null;
let gustT=8,gustOn=0,gustDir=1;
const camPos=new THREE.Vector3(),camLook=new THREE.Vector3(),tmpV=new THREE.Vector3(),tmpL=new THREE.Vector3(),camRight=new THREE.Vector3();
const fe=r=>r.hero.sex==="F"?"e":"";
function resetRace(){
  const opp=runners.filter(r=>!r.isPlayer);const order=opp.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=order[i];order[i]=order[j];order[j]=t;}
  const skills=[.985,.975,.965,.955,.945,.935,.925];
  runners.forEach(r=>{r.v=0;r.lv=0;r.h=0;r.vy=0;r.stam=100;r.fallT=0;r.fallK=0;r.stumT=0;r.invT=0;r.falls=0;r.finished=false;r.finishT=Infinity;r.hi=0;r.sprintT=0;r.steer=0;r.thinkT=0;r.place=0;r.fallDur=r.P.fallT;
    if(r.isPlayer){r.s=-1;r.d=0;}
    else{const k=order[opp.indexOf(r)];r.s=3+k*4.2+Math.random()*1.5;r.d=((k%3)-1)*1.8+(Math.random()-.5)*.4;r.pref=(Math.random()-.5)*3.6;r.skill=skills[k]*(.99+Math.random()*.02);r.err=.025+(1-skills[k])*.9;
      r.miss=new Set();hazards.forEach(h=>{if(h.type!=="bottle"&&h.type!=="scree"&&Math.random()<r.err)r.miss.add(h.id);});}
    r.tD=r.d;});
  bottles.forEach(b=>{b.taken=false;b.m.visible=true;});dyns.forEach(resetDyn);
  raceT=0;lastRank=8;finishWait=0;gustT=6+Math.random()*5;gustOn=0;
}
function rankOrder(){return runners.slice().sort((a,b)=>{if(a.finished&&b.finished)return a.finishT-b.finishT;if(a.finished)return-1;if(b.finished)return 1;return b.s-a.s;});}
function fall(r,why){r.fallDur=r.P.fallT;r.fallT=r.fallDur;r.invT=r.fallDur+1.2;r.falls++;r.vy=0;r.h=0;if(r.isPlayer){sfxThud();shake=.6;toast("Chute !",why);}}
function stumble(r,why){r.stumT=.55;r.invT=.9;r.v*=.5;if(r.isPlayer){sfxStep(.6);shake=.25;toast("Trébuche !",why);}}
const BLOCK={rock:1,stand:1,cross:1,boulder:1};

function aiThink(r,dt){
  r.thinkT-=dt;if(r.thinkT<=0){r.thinkT=.12+Math.random()*.08;
    const lanes=[-2.5,-1.7,-.85,0,.85,1.7,2.5];let best=r.d,bs=1e9;
    for(const ln of lanes){let sc=Math.abs(ln-r.d)*.55+Math.abs(ln-r.pref)*.18;
      for(let j=r.hi;j<hazards.length;j++){const h=hazards[j];const ds=h.s-r.s;if(ds>19)break;if(ds<.6||r.miss.has(h.id))continue;if(!(ln>h.d0-.55&&ln<h.d1+.55))continue;const w=1-ds/24;
        if(h.dyn&&!h.live&&h.type!=="stand")continue;
        if(BLOCK[h.type])sc+=60*w;else if(h.type==="mud"||h.type==="water")sc+=9*w;else if(h.type==="log")sc+=2.5*w;}
      for(const o of runners){if(o===r)continue;const ds=o.s-r.s;if(ds>-.5&&ds<4.5&&Math.abs(o.d-ln)<.75)sc+=(o.v<r.v+.4?5:1.5);}
      if(sc<bs){bs=sc;best=ln;}}
    r.tD=best;if(Math.random()<.01)r.pref=(Math.random()-.5)*3.6;
    if(r.sprintT<=0&&r.stam>55){const behind=player.s<r.s&&r.s-player.s<7;if(behind&&Math.random()<.25||Math.random()<.012)r.sprintT=1.5+Math.random()*2;}
  }
  if(r.h===0&&r.vy===0&&r.fallT<=0){for(let j=r.hi;j<hazards.length;j++){const h=hazards[j];const ds=h.s-r.s;if(ds>4)break;if(ds<0)continue;if((h.type==="log"||h.type==="roots"||(h.type==="marmot"&&h.live))&&!r.miss.has(h.id)&&r.d+.25>h.d0&&r.d-.25<h.d1){if(ds<r.v*.2+.45){r.vy=r.P.jumpV;break;}}}}
}

function updateRunner(r,dt){
  const P=r.P;
  while(r.hi<hazards.length&&hazards[r.hi].s<r.s-12)r.hi++;
  if(r.invT>0)r.invT-=dt;
  samp(r.s);const fz=SP.fz,k=SP.k,g=SP.g;
  if(r.fallT>0){r.fallT-=dt;r.v*=Math.pow(.03,dt);r.s+=r.v*dt*(-fz);const D=r.fallDur;r.fallK=r.fallT>.55?Math.min(1,(D-r.fallT)*6):Math.max(0,r.fallT/.55);
    if(r.fallT<=0){r.fallK=0;r.v=1.2;if(r.d>W+.6)r.d=W-.6;}return;}
  let steer=0,sprint=false,brake=false;
  if(r.isPlayer){if(state==="race"||state==="finished"){steer=keys.right-keys.left;sprint=keys.up&&r.stam>1;brake=!!keys.down;}if(r.finished){steer=0;sprint=false;}}
  else{aiThink(r,dt);steer=clamp((r.tD-r.d)*1.4,-1,1);if(r.sprintT>0){r.sprintT-=dt;sprint=r.stam>1;}}
  const grip=P.weatherProof?1:WX.grip,wet=WXID==="pluie"||WXID==="orage",icy=WXID==="neige";
  let vt=baseVt(g)*P.vMul*(r.isPlayer?1:r.skill)*(P.weatherProof?1:WX.speed);if(g>.22)vt*=1+P.steepBonus;
  if(!r.isPlayer&&!r.finished){const gap=r.s-player.s;if(gap>40)vt*=.95;else if(gap<-25)vt*=1.05;}
  if(r.finished){vt=Math.max(0,(L+26+(r.bib%5)*2.5-r.s)*.3);sprint=false;}
  if(sprint){vt+=P.sprint;r.stam=Math.max(0,r.stam-P.drain*dt);}else r.stam=Math.min(100,r.stam+P.regen*dt);
  if(!r.finished)vt=Math.min(vt,6.45); // plafond réaliste : ~23 km/h
  if(brake)vt*=.5;
  const off=Math.abs(r.d)>W+.1;if(off)vt=Math.min(vt,2.0);
  let mud=false,scree=false,water=false;
  for(let j=r.hi;j<hazards.length;j++){const h=hazards[j];if(h.s>r.s+h.depth/2+.4)break;if(Math.abs(r.s-h.s)>h.depth/2+.25)continue;if(r.d+.24<h.d0||r.d-.24>h.d1)continue;
    if(h.type==="bottle"){if(r.isPlayer&&!h.taken){h.taken=true;h.m.visible=false;r.stam=Math.min(100,r.stam+P.pick);sfxPick();toast("Ravito","+"+P.pick+" d’énergie");}continue;}
    if(r.h>(h.clear||0))continue;if(h.dyn&&!h.live)continue;
    if(h.type==="mud")mud=true;else if(h.type==="scree")scree=true;else if(h.type==="water")water=true;
    else if(r.invT<=0){
      if(h.type==="rock")fall(r,"sur un rocher");else if(h.type==="log")fall(r,"saute les troncs avec Espace");
      else if(h.type==="roots"){if(!P.rootsProof)stumble(r,"les racines t’ont accroché"+fe(r));}
      else if(h.type==="cross")fall(r,"percuté"+fe(r)+" par "+ANIMALS[h.kind].label);else if(h.type==="stand")fall(r,"contre "+ANIMALS[h.kind].label);
      else if(h.type==="boulder")fall(r,"touché"+fe(r)+" par une pierre");else if(h.type==="marmot")stumble(r,"une marmotte t’a coupé la route");}
    if(r.fallT>0)return;}
  let slip=0;
  if(water){if(icy){vt*=.97;if(!P.slipProof)slip+=1.7;}else{vt*=P.waterF*(wet?.9:1);if(r.isPlayer){if(!r.inWater){sfxSplash();shake=Math.max(shake,.15);}samp(r.s);splash(SP.x+SP.rx*r.d,SP.y+.12,SP.z+SP.rz*r.d,2);}slip+=.6;}}
  r.inWater=water;
  if(mud)vt*=P.mudF*(wet?.85:1);if(scree&&!P.slipProof)slip+=.9;
  if(r.stumT>0){r.stumT-=dt;vt*=.45;}
  const recovering=r.v<vt*.8;const acc=vt>r.v?2.3*(recovering?P.acc:1):(brake?5:3);r.v+=clamp(vt-r.v,-acc*dt,acc*dt);
  // latéral : adhérence selon la météo
  const lvT=steer*P.lat*grip*(slip>0?.7:1);r.lv+=(lvT-r.lv)*Math.min(1,dt*9*grip*(slip>0?.4:1));
  let drift=-k*r.v*r.v*1.1*(1+(1-grip)*1.5);if(slip)drift+=Math.sin(raceT*2.7+r.bib)*slip;
  if(gustOn>0&&C.wind)drift+=gustDir*1.8*Math.sin(Math.min(1,gustOn/1.6)*Math.PI);
  r.d+=(r.lv+drift)*dt;r.steer=lerp(r.steer,steer,Math.min(1,dt*8));
  if(r.d<-W-.7){r.d=-W-.7;r.lv=Math.max(0,r.lv);}
  if(r.d>W+1.7&&r.invT<=0){fall(r,"hors sentier, côté ravin");r.d=W+1.2;return;}
  r.d=clamp(r.d,-W-.7,W+1.75);
  if(r.isPlayer&&jumpPressed&&r.h===0&&r.vy===0&&state==="race"&&!r.finished)r.vy=P.jumpV;
  if(r.h>0||r.vy>0){r.vy-=15*dt;r.h+=r.vy*dt;if(r.h<=0){r.h=0;r.vy=0;if(r.isPlayer){sfxStep(.4);shake=Math.max(shake,.08);}samp(r.s);puff(SP.x+SP.rx*r.d,SP.y+.1,SP.z+SP.rz*r.d,6);}}
  const prevS=r.s;r.s+=r.v*dt*(-fz);r.phase+=dt*(3.2+r.v*1.25);
  if(!r.finished&&prevS<L&&r.s>=L){r.finished=true;r.finishT=raceT-(r.s-L)/Math.max(.1,r.v*(-fz));if(r.isPlayer)onPlayerFinish();}
  if(r.isPlayer&&r.h===0&&r.v>2){const st=Math.floor(r.phase/Math.PI);if(st!==r.lastStep){r.lastStep=st;sfxStep(.08+r.v*.012);samp(r.s);if(Math.random()<.7)puff(SP.x+SP.rx*r.d,SP.y+.1,SP.z+SP.rz*r.d,mud?3:1);}}
}
function collide(){for(let i=0;i<runners.length;i++)for(let j=i+1;j<runners.length;j++){const a=runners[i],b=runners[j];if(a.fallT>0||b.fallT>0)continue;const ds=a.s-b.s,dd=a.d-b.d;
  if(Math.abs(ds)<.75&&Math.abs(dd)<.55){const push=(dd>=0?1:-1)*.9*(1/60);a.d+=push;b.d-=push;(ds<0?a:b).v*=.985;}}}
function placeRunner(r){samp(r.s);const x=SP.x+SP.rx*r.d,z=SP.z+SP.rz*r.d;let gy=SP.y+.09;const ex=Math.abs(r.d)-W-.35;if(ex>0)gy+=r.d<0?ex*.15:-ex*.3;r.R.root.position.set(x,gy+r.h,z);
  const vx=SP.fx*r.v+SP.rx*r.lv*.6,vz=SP.fz*r.v+SP.rz*r.lv*.6;r.R.root.rotation.y=(r.v>.3)?Math.atan2(-vx,-vz):heading();}

const HINTS={log:"Tronc · saute",roots:"Racines · saute",marmot:"Marmotte · saute"};
function updateHUD(){
  const order=rankOrder();const rank=order.indexOf(player)+1;const hp=$("hPos");hp.textContent="";hp.append(String(rank));hp.append(el("sup",null,ord(rank)),el("small",null,"/"+runners.length));
  $("hTime").textContent=fmtTime(player.finished?player.finishT:raceT);$("hSpeed").firstChild.nodeValue=String(Math.round(player.v*3.6));
  $("hEnergy").style.transform="scaleX("+(player.stam/100).toFixed(3)+")";$("hEnergyBox").classList.toggle("low",player.stam<20);
  $("hLeft").textContent=fmtKm(Math.max(0,L-player.s));const alt=ALT0+cy(clamp(player.s,0,L))-cy(0);$("hAlt").textContent=fmtInt(alt);$("hDminus").textContent=fmtInt(ALT0-alt);
  runners.forEach((r,i)=>{if(dots[i])dots[i].style.left=(clamp(r.s/L,0,1)*100).toFixed(2)+"%";});
  if(state==="race"&&raceT>2&&rank!==lastRank){const ahead=rank<lastRank;const other=ahead?order[rank]:order[rank-2];if(other&&!other.isPlayer)toast(rank+ord(rank),ahead?"tu dépasses "+other.name:other.name+" te dépasse");lastRank=rank;}
  let hint="";if(state==="race"&&player.h===0&&player.fallT<=0){const HD=player.P.hintDist;for(let j=player.hi;j<hazards.length;j++){const h=hazards[j];const ds=h.s-player.s;if(ds>HD)break;if(ds<0)continue;const inL=player.d+.3>h.d0&&player.d-.3<h.d1;
    if(HINTS[h.type]&&inL&&(h.type!=="marmot"||h.live)){hint=HINTS[h.type];break;}
    if(ds<HD*.9&&inL&&(h.type==="rock"||(h.type==="stand"&&h.live))){hint=h.type==="rock"?"Rocher · écarte-toi":animalName(h)+" · écarte-toi";break;}
    if(ds<HD*.8&&inL&&h.type==="water"){hint=WXID==="neige"?"Plaque de verglas · contourne":"Grosse flaque · contourne";break;}}}
  const he=$("hint");if(hint){he.textContent=isTouch?hint:hint+(hint.indexOf("saute")>0?" (Espace)":"");he.classList.add("show");}else he.classList.remove("show");
}

function setScreen(name){["menu","end","pause"].forEach(id=>$(id).hidden=id!==name);}
function showMenu(){state="menu";setScreen("menu");$("hud").hidden=true;$("touch").hidden=true;$("pauseBtn").hidden=true;document.body.classList.remove("racing");
  for(const r of runners.slice())if(!r.isPlayer)removeRunner(r);resetRace();runners.forEach(placeRunner);renderBoards();renderSummary();}
function startRace(){initAudio();initRain();if(AC&&AC.state==="suspended")AC.resume();playMusic();musicVol(.4);try{localStorage.setItem("cdc-pseudo",pseudoEl.value.trim());}catch(e){}
  ensureWorld(()=>{setupOpponents();buildDots();resetRace();state="countdown";countT=3.2;setScreen(null);$("hud").hidden=false;$("touch").hidden=!isTouch;$("pauseBtn").hidden=false;document.body.classList.add("racing");$("count").hidden=false;lastBeep=4;
    $("hWhere").textContent=C.name+" · "+WX.label;$("hTrack").querySelector(".rv").style.left="50%";
    samp(player.s);camPos.set(SP.x-SP.fx*6,SP.y+3,SP.z-SP.fz*6);camLook.set(SP.x+SP.fx*6,SP.y+1,SP.z+SP.fz*6);});}
function onPlayerFinish(){state="finished";finishWait=3;const order=rankOrder();const place=order.indexOf(player)+1;player.place=place;
  toast("Arrivée !",place+ord(place)+" sur "+runners.length+" · "+fmtTime(player.finishT));sfxBeep(880,.25);
  const rec={name:playerName(),hero:player.hero.id,course:C.id,weather:WXID,time:Math.round(player.finishT*100)/100,place:place,falls:player.falls,at:Date.now()};
  saveScore(rec).then(res=>{const b=$("eBadge");b.textContent="";if(res.improved)b.appendChild(el("span","badge",res.prev?"Nouveau record perso sur "+C.name+" · "+fmtTime(res.prev)+" battu":"Premier chrono inscrit sur "+C.name));renderBoards();});}
function showEnd(){state="ended";setScreen("end");$("hud").hidden=true;$("touch").hidden=true;$("pauseBtn").hidden=true;document.body.classList.remove("racing");
  const p=player.place||8;const er=$("eRank");er.textContent="";er.append(String(p),el("sup",null,ord(p)),el("small",null," / "+runners.length));
  $("eWhere").textContent="Arrivée · "+C.to+" · "+C.name+" · "+WX.label;
  $("eTime").textContent=fmtTime(player.finishT);$("eFalls").textContent=String(player.falls);$("eAvg").textContent=((L/player.finishT)*3.6).toFixed(1).replace(".",",")+" km/h";selectTab("race");renderRace();}
function renderRace(){const box=$("raceList");box.textContent="";const t=el("table");t.innerHTML="<thead><tr><th>#</th><th>Dossard</th><th>Coureur</th><th class=\"r\">Temps</th></tr></thead>";const tb=el("tbody");
  const order=rankOrder();order.forEach((r,i)=>{const tr=el("tr");if(r.isPlayer)tr.className="me";tr.appendChild(el("td","rk",String(i+1)));tr.appendChild(el("td",null,String(r.bib)));
    const nm=el("td","nm",r.isPlayer?playerName():r.name);nm.appendChild(el("small",null,"« "+r.hero.nick+" »"));tr.appendChild(nm);
    tr.appendChild(el("td","r num",r.finished?(i===0?fmtTime(r.finishT):"+"+(r.finishT-order[0].finishT).toFixed(2)+" s"):"en course"));tb.appendChild(tr);});t.appendChild(tb);box.appendChild(t);}
function selectTab(w){$("tabRace").setAttribute("aria-selected",w==="race");$("tabAll").setAttribute("aria-selected",w!=="race");$("raceList").hidden=w!=="race";$("boardEnd").hidden=w==="race";}
$("tabRace").addEventListener("click",()=>selectTab("race"));$("tabAll").addEventListener("click",()=>selectTab("all"));
function togglePause(){if(state==="paused"){state=pausedFrom;setScreen(null);$("hud").hidden=false;musicVol(.4);}else if(state==="race"||state==="countdown"){pausedFrom=state;state="paused";setScreen("pause");musicVol(.15);keys.left=keys.right=keys.up=keys.down=0;}}
$("startBtn").addEventListener("click",startRace);$("againBtn").addEventListener("click",startRace);$("menuBtn").addEventListener("click",showMenu);
$("resumeBtn").addEventListener("click",togglePause);$("quitBtn").addEventListener("click",showMenu);$("pauseBtn").addEventListener("click",()=>{togglePause();$("pauseBtn").blur();});

/* ================= Boucle ================= */
function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener("resize",resize);resize();
let last=performance.now(),T=0;
function frame(now){requestAnimationFrame(frame);let dt=(now-last)/1000;last=now;if(dt>.05)dt=.05;if(dt<=0||!world)return;T+=dt;
  if(state==="countdown"){countT-=dt;const n=Math.ceil(countT-.2);if(n!==lastBeep&&n>=0){lastBeep=n;if(n>0){$("count").textContent=String(n);sfxBeep(520,.15);}else{$("count").textContent="Partez !";sfxBeep(1040,.35);}}if(countT<=0){state="race";$("count").hidden=true;}}
  const simulate=state==="race"||state==="finished"||state==="ended";
  if(simulate){raceT+=dt;
    if(C.wind&&state==="race"){if(gustOn>0)gustOn-=dt;else{gustT-=dt;if(gustT<=0){gustOn=1.6;gustT=6+Math.random()*6;gustDir=Math.random()<.5?-1:1;warn("Rafale de mistral !");}}}
    for(const h of dyns)if(Math.abs(h.s-player.s)<140)updDyn(h,dt);for(const r of runners)updateRunner(r,dt);collide();}
  else for(const r of runners)r.phase+=dt*1.2;
  jumpPressed=false;
  for(const r of runners){placeRunner(r);poseRunner(r.R,r.phase,simulate?r.v:0,r.h>.02,r.fallK,r.steer,!simulate||r.v<.4);if(r.tag){const dz=r.s-player.s;r.tag.visible=state!=="menu"&&dz>3&&dz<45;}}
  if(state==="finished"){finishWait-=dt;if(finishWait<=0)showEnd();}
  if(state==="ended"&&Math.random()<.02)renderRace();
  for(const b of bottles)if(b.m.visible){b.m.rotation.y+=dt*2;b.m.position.y=.6+Math.sin(T*3+b.s)*.08;}
  for(const c of clouds)c.position.x+=c.userData.v*dt;
  samp(player.s);const P=player.R.root.position;
  if(state==="menu"){menuT+=dt;const narrow=window.innerWidth<=760;const a=.35+Math.sin(menuT*.25)*.6;const dist=narrow?5.5:3.9;
    // de face, légèrement de trois quarts
    tmpV.set(P.x+(SP.fx*Math.cos(a)+SP.rx*Math.sin(a))*dist,P.y+1.45,P.z+(SP.fz*Math.cos(a)+SP.rz*Math.sin(a))*dist);
    // aperçu du héros décalé hors du panneau
    camRight.set(tmpV.z-P.z,0,-(tmpV.x-P.x)).normalize();const off=narrow?0:-1.15;tmpL.set(P.x+camRight.x*off,P.y+(narrow?-.5:1.0),P.z+camRight.z*off);
    camera.fov=lerp(camera.fov,45,dt*3);camPos.lerp(tmpV,1-Math.exp(-dt*3));camLook.lerp(tmpL,1-Math.exp(-dt*3));}
  else if(state==="ended"||state==="finished"&&finishWait<2.2){const a=T*.25;tmpV.set(P.x+Math.sin(a)*6,P.y+2.4,P.z+Math.cos(a)*6);tmpL.set(P.x,P.y+1.1,P.z);camPos.lerp(tmpV,1-Math.exp(-dt*1.5));camLook.lerp(tmpL,1-Math.exp(-dt*3));camera.fov=lerp(camera.fov,58,dt*2);}
  else{const back=5.6,up=2.3;const cs=player.s-back;samp(cs);const cd=player.d*.7;tmpV.set(SP.x+SP.rx*cd,SP.y+up,SP.z+SP.rz*cd);
    samp(player.s+9);tmpL.set(SP.x+SP.rx*player.d*.5,Math.min(SP.y+1,P.y+.9),SP.z+SP.rz*player.d*.5);
    camPos.lerp(tmpV,1-Math.exp(-dt*8));camLook.lerp(tmpL,1-Math.exp(-dt*8));camera.fov=lerp(camera.fov,clamp(60+(player.v-3)*3.6+(keys.up&&player.stam>1?3:0),58,76),dt*3);}
  camGuardT-=dt;if(camGuardT<=0){camGuardT=.1;camGround=groundY(camPos.x,camPos.z);}if(camPos.y<camGround+(state==="menu"?.9:1.3))camPos.y=camGround+(state==="menu"?.9:1.3);
  camera.position.copy(camPos);if(shake>0){shake=Math.max(0,shake-dt*1.5);camera.position.x+=(Math.random()-.5)*shake*.5;camera.position.y+=(Math.random()-.5)*shake*.5;}
  camera.lookAt(camLook);camera.updateProjectionMatrix();
  sky.position.copy(camera.position);valley.position.set(camera.position.x,seaFixedY!=null?seaFixedY:PY[idx(player.s)]-190,camera.position.z);
  sun.position.set(P.x+SUN_DIR.x*60,P.y+SUN_DIR.y*60,P.z+SUN_DIR.z*60);sun.target.position.copy(P);sunDisc.position.set(camera.position.x+SUN_DIR.x*1500,camera.position.y+SUN_DIR.y*1500,camera.position.z+SUN_DIR.z*1500);
  if(windG)windG.gain.value=(simulate?clamp((player.v-2)/8,0,1)*.22:0)+(gustOn>0?.35:0);
  if(rainG)rainG.gain.value=WX.rain?(WX.storm?.22:.13):0;
  updWeather(dt,camera.position);animFans(T,f=>Math.abs(f.z-P.z)<120);updDust(dt);updSplash(dt);
  if(warnT>0){warnT-=dt;if(warnT<=0)warnEl.classList.remove("show");}if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.classList.remove("show");}
  if(state==="race"||state==="finished"||state==="countdown")updateHUD();
  renderer.render(scene,camera);
}
// démarrage
setPlayer(heroById(cfg.hero),cfg.custom[cfg.hero]);
renderHeroGrid();renderHeroDetail();renderCourses();renderWeather();renderSummary();renderBoards();
ensureWorld(()=>{$("loading").hidden=true;showMenu();});
requestAnimationFrame(frame);
})();
</script>
