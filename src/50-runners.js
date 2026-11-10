/* ================= Coureurs ================= */
function makeRunner(lk,bibT){
  const M=col=>new THREE.MeshStandardMaterial({color:lin(col),roughness:.7});
  const male=lk.male,bw=lk.build||1;
  const skin=M(lk.skin),top=M(lk.top),shorts=M(lk.shorts),hair=M(lk.hair),shoe=M(lk.shoe),vest=M(lk.vest),band=M(lk.band),sole=M(0xeeeeee);
  const limb=(r1,r2,len,m)=>{const g=new THREE.Group();const cyl=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,10),m);cyl.position.y=-len/2;g.add(cyl);g.add(new THREE.Mesh(new THREE.SphereGeometry(r1,10,8),m));return g;};
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);body.position.y=.92;root.scale.setScalar(lk.height||(male?1.04:1));
  const torso=new THREE.Group();body.add(torso);
  const sw=(male?1.1:1)*bw;
  const chest=new THREE.Mesh(new THREE.CylinderGeometry(.155*sw,.13*(male?1.05:1)*bw,.48,14),top);chest.scale.z=.62;chest.position.y=.26;torso.add(chest);
  const shoulders=new THREE.Mesh(new THREE.SphereGeometry(.155*sw,14,8,0,Math.PI*2,0,Math.PI/2),top);shoulders.scale.set(1,.45,.62);shoulders.position.y=.5;torso.add(shoulders);
  const pelvis=new THREE.Mesh(new THREE.CylinderGeometry(.135*bw,.145*bw,.16,14),shorts);pelvis.scale.z=.7;pelvis.position.y=-.01;torso.add(pelvis);
  const pack=new THREE.Mesh(new THREE.CylinderGeometry(.13*sw,.12*sw,.36,12),vest);pack.scale.z=.38;pack.position.set(0,.32,.11);torso.add(pack);
  const flaskL=new THREE.Mesh(new THREE.CylinderGeometry(.032,.032,.13,10),M(0x3aa0e0));flaskL.position.set(-.075*sw,.4,-.088);torso.add(flaskL);const flaskR=flaskL.clone();flaskR.position.x=.075*sw;torso.add(flaskR);
  // sponsor du maillot : poitrine et dos du sac
  const spT=lk.spTop&&sponsorById(lk.spTop);
  if(spT){const t=wordTex(spT,256,80);const ch=new THREE.Mesh(new THREE.PlaneGeometry(.15,.047),new THREE.MeshStandardMaterial({map:t,roughness:.7}));ch.position.set(0,.37,-.095*sw);ch.rotation.y=Math.PI;torso.add(ch);
    const bk=new THREE.Mesh(new THREE.PlaneGeometry(.21,.066),new THREE.MeshStandardMaterial({map:t,roughness:.7}));bk.position.set(0,.36,.11+.05*sw+.004);torso.add(bk);}
  const bib=new THREE.Mesh(new THREE.PlaneGeometry(.15,.1),new THREE.MeshStandardMaterial({map:bibT,roughness:.8}));bib.position.set(0,.2,-.09);bib.rotation.y=Math.PI;torso.add(bib);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(male?.048:.04,male?.052:.045,.1,8),skin);neck.position.y=.56;torso.add(neck);
  const head=new THREE.Group();head.position.y=.68;torso.add(head);
  const skull=new THREE.Mesh(new THREE.SphereGeometry(.105,16,12),skin);skull.scale.set(.92,1.05,1);head.add(skull);
  const hg=buildHeadGear(lk,M);head.add(hg.g);const pony=hg.pony;
  const sh=[],el=[],hip=[],knee=[];
  for(const side of[-1,1]){
    const s=new THREE.Group();s.position.set(side*.175*sw,.47,0);torso.add(s);s.add(limb(.042*(male?1.12:1)*bw,.036,.26,skin));
    const e=new THREE.Group();e.position.y=-.26;s.add(e);e.add(limb(.035*(male?1.1:1),.03,.24,skin));const hand=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),skin);hand.position.y=-.25;e.add(hand);sh.push(s);el.push(e);
    const h=new THREE.Group();h.position.set(side*.085*bw,0,0);body.add(h);
    const shortLeg=new THREE.Mesh(new THREE.CylinderGeometry(.075*bw,.068*bw,male?.22:.17,12),shorts);shortLeg.position.y=male?-.1:-.08;h.add(shortLeg);h.add(limb(.064*(male?1.06:1)*bw,.05,.43,skin));
    const k=new THREE.Group();k.position.y=-.43;h.add(k);k.add(limb(.05*(male?1.08:1),.034,.41,skin));
    const sock=new THREE.Mesh(new THREE.CylinderGeometry(.038,.04,.07,10),sole);sock.position.y=-.38;k.add(sock);
    const sb=new THREE.Mesh(new THREE.BoxGeometry(.095,.07,.24),shoe);sb.position.set(0,-.445,-.045);k.add(sb);const toe=new THREE.Mesh(new THREE.SphereGeometry(.048,10,6,0,Math.PI*2,0,Math.PI/2),shoe);toe.scale.set(1,.7,1.1);toe.position.set(0,-.48,-.16);k.add(toe);
    if(lk.spShoe){const spS=sponsorById(lk.spShoe);const sl=new THREE.Mesh(new THREE.PlaneGeometry(.17,.04),new THREE.MeshStandardMaterial({map:wordTex(spS,256,60),roughness:.6}));sl.position.set(side*.0495,-.445,-.05);sl.rotation.y=side*Math.PI/2;k.add(sl);}
    const so=new THREE.Mesh(new THREE.BoxGeometry(.1,.025,.25),sole);so.position.set(0,-.49,-.05);k.add(so);hip.push(h);knee.push(k);
  }
  root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return{root:root,body:body,torso:torso,head:head,pony:pony,sh:sh,el:el,hip:hip,knee:knee};
}
function buildHeadGear(lk,M){const head=new THREE.Group();const hair=M(lk.hair),band=M(lk.band);
  const st=lk.style;
  if(st!=="beanie"&&st!=="cap"){const cap=new THREE.Mesh(new THREE.SphereGeometry(.112,16,12,0,Math.PI*2,0,Math.PI*(st==="short"?.42:.56)),hair);cap.position.set(0,.01,.012);head.add(cap);}
  if(st==="beanie"){const bn=new THREE.Mesh(new THREE.SphereGeometry(.118,16,12,0,Math.PI*2,0,Math.PI*.55),M(lk.hat));bn.position.y=.012;head.add(bn);const pom=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),M(0xf4f1e8));pom.position.y=.125;head.add(pom);}
  else if(st==="cap"){const cp=new THREE.Mesh(new THREE.SphereGeometry(.114,16,12,0,Math.PI*2,0,Math.PI*.45),M(lk.hat));cp.position.y=.02;head.add(cp);const visor=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.012,16,1,false,0,Math.PI),M(lk.hat));visor.position.set(0,.04,-.08);visor.rotation.y=Math.PI/2;visor.scale.z=1.2;head.add(visor);const back=new THREE.Mesh(new THREE.SphereGeometry(.1,12,8,0,Math.PI*2,0,Math.PI*.5),hair);back.position.set(0,-.02,.03);back.scale.set(.95,.6,.8);head.add(back);}
  else if(!lk.spCap){const hb=new THREE.Mesh(new THREE.TorusGeometry(.104,.017,6,20),band);hb.rotation.x=Math.PI/2;hb.position.y=.04;head.add(hb);}
  // casquette sponsor
  const spC=lk.spCap&&st!=="beanie"&&sponsorById(lk.spCap);
  if(spC){const cm=M(st==="cap"?lk.hat:new THREE.Color(spC.bg).getHex());if(st!=="cap"){const cp=new THREE.Mesh(new THREE.SphereGeometry(.117,16,12,0,Math.PI*2,0,Math.PI*.45),cm);cp.position.y=.024;head.add(cp);const visor=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.012,16,1,false,0,Math.PI),cm);visor.position.set(0,.045,-.08);visor.rotation.y=Math.PI/2;visor.scale.z=1.2;head.add(visor);}
    const patch=new THREE.Mesh(new THREE.PlaneGeometry(.11,.036),new THREE.MeshStandardMaterial({map:wordTex(spC,256,84),roughness:.7}));patch.position.set(0,.085,-.096);patch.rotation.set(-.35,Math.PI,0);head.add(patch);}
  const glasses=new THREE.Mesh(new THREE.BoxGeometry(.15,.032,.02),new THREE.MeshStandardMaterial({color:0x14181c,roughness:.2,metalness:.6}));glasses.position.set(0,.01,-.098);head.add(glasses);
  const pony=new THREE.Group();pony.position.set(0,.05,.1);head.add(pony);
  if(st==="pony"){pony.add(new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),hair));const tail=new THREE.Mesh(new THREE.ConeGeometry(.045,.28,10),hair);tail.rotation.x=Math.PI;tail.position.y=-.14;pony.add(tail);}
  else if(st==="bun"){const b=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),hair);b.position.set(0,.06,0);pony.add(b);}
  else if(st==="braid"){for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.036-i*.004,8,6),hair);b.position.y=-.05-i*.06;pony.add(b);}}
  else if(st==="braids"){for(const sx of[-.05,0,.05])for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.014,.012,.1,6),hair);b.position.set(sx,-.06-i*.08,0);pony.add(b);}}
  else if(st==="bob"){const b=new THREE.Mesh(new THREE.SphereGeometry(.122,14,10,0,Math.PI*2,Math.PI*.35,Math.PI*.4),hair);b.position.set(0,.06,-.1);pony.add(b);}
  else if(st==="long"){const b=new THREE.Mesh(new THREE.BoxGeometry(.18,.24,.05),hair);b.position.set(0,-.1,0);pony.add(b);}
  if(lk.beard){const bd=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8,0,Math.PI*2,Math.PI*.5,Math.PI*.5),M(lk.beard));bd.position.set(0,-.02,-.035);bd.scale.set(1,1.1,.9);head.add(bd);}
  return{g:head,pony:pony};}
function poseRunner(R,phase,v,air,fallK,steer,idle){
  if(R.x){poseRunnerX(R,v,air,fallK,steer,idle,GFX.dt||.016);return;}
  const amp=idle?.08:clamp(v/5.2,.2,1.15);
  for(let i=0;i<2;i++){const p=phase+(i?Math.PI:0);
    if(air){R.hip[i].rotation.x=i?-.35:.95;R.knee[i].rotation.x=i?-.5:-1.35;R.sh[i].rotation.x=i?.7:-.5;R.sh[i].rotation.z=(i?1:-1)*.55;R.el[i].rotation.x=1.0;}
    else{R.hip[i].rotation.x=Math.sin(p)*.85*amp;R.knee[i].rotation.x=-(.15+Math.max(0,Math.cos(p))*1.3*amp);R.sh[i].rotation.x=-Math.sin(p)*.75*amp;R.sh[i].rotation.z=(i?1:-1)*(.12+amp*.1);R.el[i].rotation.x=1.15+amp*.2;}}
  R.body.position.y=.9+(air?.04:Math.abs(Math.sin(phase))*.06*amp);
  R.torso.rotation.x=idle?0:-.1-amp*.08;
  R.pony.rotation.x=-.65-(air?.6:Math.sin(phase*2)*.18*amp);R.pony.rotation.z=Math.sin(phase)*.35*amp;
  R.body.rotation.z=-steer*.14;
  if(fallK>0){R.body.rotation.x=-1.45*fallK;R.body.position.y=lerp(R.body.position.y,.28,fallK);for(let i=0;i<2;i++){R.sh[i].rotation.x=lerp(R.sh[i].rotation.x,-2.6,fallK);R.hip[i].rotation.x=lerp(R.hip[i].rotation.x,-.2,fallK);}}
  else R.body.rotation.x=0;
}
function bibTex(n,col){return textTex(128,88,(x,w,h)=>{x.fillStyle="#fff";x.fillRect(0,0,w,h);x.fillStyle=col;x.fillRect(0,0,w,14);x.fillStyle="#111";x.font="900 64px "+FONT;x.textAlign="center";x.textBaseline="middle";x.fillText(String(n),w/2,h/2+8);});}
function tagSprite(name,n){const tex=textTex(320,80,(x,w,h)=>{x.fillStyle="rgba(13,23,20,.82)";x.beginPath();x.moveTo(8,0);x.lineTo(w-8,0);x.quadraticCurveTo(w,0,w,8);x.lineTo(w,h-8);x.quadraticCurveTo(w,h,w-8,h);x.lineTo(8,h);x.quadraticCurveTo(0,h,0,h-8);x.lineTo(0,8);x.quadraticCurveTo(0,0,8,0);x.fill();x.fillStyle="#f2c230";x.font="900 46px "+FONT;x.textBaseline="middle";x.fillText(String(n),16,h/2+3);x.fillStyle="#f4f1e8";x.font="800 44px "+FONT;x.fillText(name.toUpperCase(),92,h/2+3);});
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:true,transparent:true}));sp.scale.set(1.2,.3,1);sp.position.y=2.15;return sp;}

const BIBS=[7,12,23,31,38,45,51,64,77,88];
const runners=[];let player=null;
function heroGear(hero,custom){const D=HERO_SPONSORS[hero.id]||[null,null,null];const c=custom||{};const pickId=(v,d)=>v===undefined?d:(v&&sponsorById(v)?v:null);return{top:pickId(c.spTop,D[0]),shoe:pickId(c.spShoe,D[1]),cap:pickId(c.spCap,D[2])};}
function lookOf(hero,custom){const lk=Object.assign({},hero.look,{male:hero.sex==="M"});if(custom){if(custom.top!=null)lk.top=custom.top;if(custom.shoe!=null)lk.shoe=custom.shoe;}const gr=heroGear(hero,custom);lk.spTop=gr.top;lk.spShoe=gr.shoe;lk.spCap=gr.cap;return lk;}
function newRunner(hero,isPlayer,bib,custom){const lk=lookOf(hero,custom);const bt=bibTex(bib,"#"+new THREE.Color(lk.top).getHexString());const R=makeRunnerX(lk,bt)||makeRunner(lk,bt);scene.add(R.root);
  const first=hero.name.split(" ")[0];
  const r={gear:heroGear(hero,custom),hero:hero,P:heroParams(hero),R:R,isPlayer:isPlayer,name:first,bib:bib,s:0,d:0,v:0,lv:0,h:0,vy:0,phase:Math.random()*6,stam:100,fallT:0,fallDur:1.7,fallK:0,stumT:0,invT:0,falls:0,finished:false,finishT:Infinity,hi:0,pref:0,skill:1,err:.04,miss:null,thinkT:0,tD:0,sprintT:0,steer:0,lastStep:0};
  if(!isPlayer){r.tag=tagSprite(first,bib);R.root.add(r.tag);}return r;}
function removeRunner(r){scene.remove(r.R.root);disposeTree(r.R.root);const i=runners.indexOf(r);if(i>=0)runners.splice(i,1);}
function setPlayer(hero,custom){if(player)removeRunner(player);player=newRunner(hero,true,42,custom);runners.unshift(player);}
function setupOpponents(){for(const r of runners.slice())if(!r.isPlayer)removeRunner(r);
  const pool=HEROES.filter(h=>h!==player.hero);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=pool[i];pool[i]=pool[j];pool[j]=t;}
  pool.slice(0,7).forEach((h,i)=>runners.push(newRunner(h,false,BIBS[HEROES.indexOf(h)],null)));}

/* --- coureur réaliste : personnage articulé animé (capture de mouvement) --- */
let XB=null; // mesures du modèle, calculées une fois
function prepXbot(){if(XB||!GFX.xbot||!THREE.SkeletonUtils)return XB;const sc=GFX.xbot.scene;sc.updateMatrixWorld(true);const meshes=[];sc.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});if(!meshes.length)return null;
  // positions réellement rendues à la pose de repos (déformées par le squelette)
  const v=new THREE.Vector3();let minY=1e9,maxY=-1e9;const wp=meshes.map(m=>{m.skeleton.update();const p=m.geometry.attributes.position,a=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);a[i*3]=v.x;a[i*3+1]=v.y;a[i*3+2]=v.z;minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}return a;});
  const H=maxY-minY;let fz=-1e9,bz=1e9,hx=0,hz=0,hn=0,hMin=1e9;
  wp.forEach(a=>{for(let i=0;i<a.length;i+=3){const h=(a[i+1]-minY)/H,ax=Math.abs(a[i]);if(h>.66&&h<.72&&ax<.04*H){fz=Math.max(fz,a[i+2]);bz=Math.min(bz,a[i+2]);}if(h>.88){hx+=a[i];hz+=a[i+2];hn++;hMin=Math.min(hMin,a[i+1]);}}});
  // zones : 0 peau, 1 maillot, 2 short, 3 chaussette, 4 chaussure
  const regions=wp.map(a=>{const r=new Uint8Array(a.length/3);for(let i=0;i<r.length;i++){const h=(a[i*3+1]-minY)/H,ax=Math.abs(a[i*3])/H;
    r[i]=h<.05?4:h<.075?3:h<.41?0:h<.56?2:(h<.815&&ax<.105)?1:0;}return r;});
  XB={H:H,minY:minY,front:fz,back:bz,chestY:minY+H*.69,head:{x:hx/hn,z:hz/hn,y:(hMin+maxY)/2,r:(maxY-hMin)/2},names:meshes.map(m=>m.name),regions:regions};return XB;}
function makeRunnerX(lk,bibT){const X=prepXbot();if(!X)return null;
  const M=col=>new THREE.MeshStandardMaterial({color:lin(col),roughness:.7});
  const root=new THREE.Group(),tilt=new THREE.Group(),inner=THREE.SkeletonUtils.clone(GFX.xbot.scene);root.add(tilt);tilt.add(inner);
  const hgt=(lk.height||(lk.male?1.03:.97))*1.76/X.H,bw=(lk.build||1)*(lk.male?1.04:.97);inner.scale.set(hgt*bw,hgt,hgt*bw);inner.rotation.y=Math.PI;inner.position.y=-X.minY*hgt;
  const pal=[lin(lk.skin).multiplyScalar(.72),lin(lk.top),lin(lk.shorts),lin(0xeeeeee),lin(lk.shoe)];
  inner.traverse(o=>{if(!o.isSkinnedMesh)return;const k=X.names.indexOf(o.name);const g=o.geometry.clone();const reg=X.regions[k]||X.regions[0];const col=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<reg.length&&i<col.length/3;i++){const c=pal[reg[i]];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}g.setAttribute("color",new THREE.BufferAttribute(col,3));o.geometry=g;
    o.material=new THREE.MeshStandardMaterial({vertexColors:true,skinning:true,roughness:.62,metalness:0});o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;});
  root.updateMatrixWorld(true);
  const bone=n=>{let b=null;inner.traverse(o=>{if(o.isBone&&(o.name==="mixamorig"+n||o.name==="mixamorig:"+n))b=o;});return b;};
  // fixe un objet décrit dans le repère du coureur (mètres, avant = -Z) sur un os, à la pose de repos
  const attach=(obj,b)=>{if(!b)return;obj.updateMatrix();const m=new THREE.Matrix4().copy(b.matrixWorld).invert().multiply(obj.matrix);m.decompose(obj.position,obj.quaternion,obj.scale);b.add(obj);};
  const toRoot=(x,y,z)=>new THREE.Vector3(-x*hgt*bw,(y-X.minY)*hgt,-z*hgt*bw);
  // tête : coiffure, casquette, lunettes
  const hg=buildHeadGear(lk,M);const hc=toRoot(X.head.x,X.head.y,X.head.z);hg.g.position.copy(hc);hg.g.scale.setScalar(X.head.r*hgt/.105);attach(hg.g,bone("Head"));
  // buste : sac de trail, flasques, dossard, sponsor
  const t=new THREE.Group();const cy=toRoot(0,X.chestY,0).y;const fZ=-X.front*hgt*bw,bZ=-X.back*hgt*bw;t.position.set(0,cy,0);
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.27*bw,.34,.07),M(lk.vest));pack.position.set(0,.02,bZ+.035);t.add(pack);
  for(const sx of[-1,1]){const fl=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.13,10),M(0x3aa0e0));fl.position.set(sx*.075,.09,fZ-.025);t.add(fl);const st=new THREE.Mesh(new THREE.BoxGeometry(.04,.3,.012),M(lk.vest));st.position.set(sx*.085,.05,fZ-.006);t.add(st);}
  const bib=new THREE.Mesh(new THREE.PlaneGeometry(.15,.1),new THREE.MeshStandardMaterial({map:bibT,roughness:.8}));bib.position.set(0,-.12,fZ-.006);bib.rotation.y=Math.PI;t.add(bib);
  const spT=lk.spTop&&sponsorById(lk.spTop);if(spT){const tx=wordTex(spT,256,80);const bk=new THREE.Mesh(new THREE.PlaneGeometry(.22,.07),new THREE.MeshStandardMaterial({map:tx,roughness:.7}));bk.position.set(0,.07,bZ+.072);t.add(bk);
    const ch=new THREE.Mesh(new THREE.PlaneGeometry(.12,.04),new THREE.MeshStandardMaterial({map:tx,roughness:.7}));ch.position.set(0,-.03,fZ-.008);ch.rotation.y=Math.PI;t.add(ch);}
  attach(t,bone("Spine2"));
  // chaussures : marque sur le côté
  if(lk.spShoe){const spS=sponsorById(lk.spShoe);for(const [n,sx] of[["LeftFoot",1],["RightFoot",-1]]){const b=bone(n);if(!b)continue;const wpz=new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(.15,.035),new THREE.MeshStandardMaterial({map:wordTex(spS,256,60),roughness:.6}));pl.position.set(wpz.x+sx*.052,.06,wpz.z-.04);pl.rotation.y=sx*Math.PI/2;attach(pl,b);}}
  root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  const mixer=new THREE.AnimationMixer(inner);const A={};for(const cl of GFX.xbot.animations){if(["idle","walk","run"].includes(cl.name)){const a=mixer.clipAction(cl);a.play();a.setEffectiveWeight(cl.name==="idle"?1:0);A[cl.name]=a;}}
  mixer.update(Math.random()*2);
  return{x:true,root:root,tilt:tilt,mixer:mixer,A:A,pony:hg.pony};}
function poseRunnerX(R,v,air,fallK,steer,idle,dt){const A=R.A;const sp=idle?0:v;
  const wI=clamp(1-sp/1.1,0,1),wR=clamp((sp-1.6)/1.4,0,1),wW=clamp(1-wI-wR,0,1);
  if(A.idle)A.idle.setEffectiveWeight(wI);if(A.walk){A.walk.setEffectiveWeight(wW);A.walk.timeScale=clamp(sp/1.4,.5,1.5);}
  if(A.run){A.run.setEffectiveWeight(wR);A.run.timeScale=air?.12:clamp(sp/3.3,.7,1.75);}
  R.mixer.update(dt);
  R.tilt.rotation.set(-1.35*fallK+(idle?0:-.06),0,-steer*.12);R.tilt.position.y=air?.05:0;
  if(R.pony){R.pony.rotation.x=-.65-(air?.5:Math.sin(performance.now()*.012)*.12);}}
