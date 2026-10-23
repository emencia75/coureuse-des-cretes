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
  const bib=new THREE.Mesh(new THREE.PlaneGeometry(.15,.1),new THREE.MeshStandardMaterial({map:bibT,roughness:.8}));bib.position.set(0,.2,-.09);bib.rotation.y=Math.PI;torso.add(bib);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(male?.048:.04,male?.052:.045,.1,8),skin);neck.position.y=.56;torso.add(neck);
  const head=new THREE.Group();head.position.y=.68;torso.add(head);
  const skull=new THREE.Mesh(new THREE.SphereGeometry(.105,16,12),skin);skull.scale.set(.92,1.05,1);head.add(skull);
  const st=lk.style;
  if(st!=="beanie"&&st!=="cap"){const cap=new THREE.Mesh(new THREE.SphereGeometry(.112,16,12,0,Math.PI*2,0,Math.PI*(st==="short"?.42:.56)),hair);cap.position.set(0,.01,.012);head.add(cap);}
  if(st==="beanie"){const bn=new THREE.Mesh(new THREE.SphereGeometry(.118,16,12,0,Math.PI*2,0,Math.PI*.55),M(lk.hat));bn.position.y=.012;head.add(bn);const pom=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),M(0xf4f1e8));pom.position.y=.125;head.add(pom);}
  else if(st==="cap"){const cp=new THREE.Mesh(new THREE.SphereGeometry(.114,16,12,0,Math.PI*2,0,Math.PI*.45),M(lk.hat));cp.position.y=.02;head.add(cp);const visor=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.012,16,1,false,0,Math.PI),M(lk.hat));visor.position.set(0,.04,-.08);visor.rotation.y=Math.PI/2;visor.scale.z=1.2;head.add(visor);const back=new THREE.Mesh(new THREE.SphereGeometry(.1,12,8,0,Math.PI*2,0,Math.PI*.5),hair);back.position.set(0,-.02,.03);back.scale.set(.95,.6,.8);head.add(back);}
  else{const hb=new THREE.Mesh(new THREE.TorusGeometry(.104,.017,6,20),band);hb.rotation.x=Math.PI/2;hb.position.y=.04;head.add(hb);}
  const glasses=new THREE.Mesh(new THREE.BoxGeometry(.15,.032,.02),new THREE.MeshStandardMaterial({color:0x14181c,roughness:.2,metalness:.6}));glasses.position.set(0,.01,-.098);head.add(glasses);
  const pony=new THREE.Group();pony.position.set(0,.05,.1);head.add(pony);
  if(st==="pony"){pony.add(new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),hair));const tail=new THREE.Mesh(new THREE.ConeGeometry(.045,.28,10),hair);tail.rotation.x=Math.PI;tail.position.y=-.14;pony.add(tail);}
  else if(st==="bun"){const b=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),hair);b.position.set(0,.06,0);pony.add(b);}
  else if(st==="braid"){for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.036-i*.004,8,6),hair);b.position.y=-.05-i*.06;pony.add(b);}}
  else if(st==="braids"){for(const sx of[-.05,0,.05])for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.014,.012,.1,6),hair);b.position.set(sx,-.06-i*.08,0);pony.add(b);}}
  else if(st==="bob"){const b=new THREE.Mesh(new THREE.SphereGeometry(.122,14,10,0,Math.PI*2,Math.PI*.35,Math.PI*.4),hair);b.position.set(0,.06,-.1);pony.add(b);}
  else if(st==="long"){const b=new THREE.Mesh(new THREE.BoxGeometry(.18,.24,.05),hair);b.position.set(0,-.1,0);pony.add(b);}
  if(lk.beard){const bd=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8,0,Math.PI*2,Math.PI*.5,Math.PI*.5),M(lk.beard));bd.position.set(0,-.02,-.035);bd.scale.set(1,1.1,.9);head.add(bd);}
  const sh=[],el=[],hip=[],knee=[];
  for(const side of[-1,1]){
    const s=new THREE.Group();s.position.set(side*.175*sw,.47,0);torso.add(s);s.add(limb(.042*(male?1.12:1)*bw,.036,.26,skin));
    const e=new THREE.Group();e.position.y=-.26;s.add(e);e.add(limb(.035*(male?1.1:1),.03,.24,skin));const hand=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),skin);hand.position.y=-.25;e.add(hand);sh.push(s);el.push(e);
    const h=new THREE.Group();h.position.set(side*.085*bw,0,0);body.add(h);
    const shortLeg=new THREE.Mesh(new THREE.CylinderGeometry(.075*bw,.068*bw,male?.22:.17,12),shorts);shortLeg.position.y=male?-.1:-.08;h.add(shortLeg);h.add(limb(.064*(male?1.06:1)*bw,.05,.43,skin));
    const k=new THREE.Group();k.position.y=-.43;h.add(k);k.add(limb(.05*(male?1.08:1),.034,.41,skin));
    const sock=new THREE.Mesh(new THREE.CylinderGeometry(.038,.04,.07,10),sole);sock.position.y=-.38;k.add(sock);
    const sb=new THREE.Mesh(new THREE.BoxGeometry(.095,.07,.24),shoe);sb.position.set(0,-.445,-.045);k.add(sb);const toe=new THREE.Mesh(new THREE.SphereGeometry(.048,10,6,0,Math.PI*2,0,Math.PI/2),shoe);toe.scale.set(1,.7,1.1);toe.position.set(0,-.48,-.16);k.add(toe);
    const so=new THREE.Mesh(new THREE.BoxGeometry(.1,.025,.25),sole);so.position.set(0,-.49,-.05);k.add(so);hip.push(h);knee.push(k);
  }
  root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return{root:root,body:body,torso:torso,head:head,pony:pony,sh:sh,el:el,hip:hip,knee:knee};
}
function poseRunner(R,phase,v,air,fallK,steer,idle){
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
function lookOf(hero,custom){const lk=Object.assign({},hero.look,{male:hero.sex==="M"});if(custom){if(custom.top!=null)lk.top=custom.top;if(custom.shoe!=null)lk.shoe=custom.shoe;}return lk;}
function newRunner(hero,isPlayer,bib,custom){const lk=lookOf(hero,custom);const bt=bibTex(bib,"#"+new THREE.Color(lk.top).getHexString());const R=makeRunner(lk,bt);scene.add(R.root);
  const first=hero.name.split(" ")[0];
  const r={hero:hero,P:heroParams(hero),R:R,isPlayer:isPlayer,name:first,bib:bib,s:0,d:0,v:0,lv:0,h:0,vy:0,phase:Math.random()*6,stam:100,fallT:0,fallDur:1.7,fallK:0,stumT:0,invT:0,falls:0,finished:false,finishT:Infinity,hi:0,pref:0,skill:1,err:.04,miss:null,thinkT:0,tD:0,sprintT:0,steer:0,lastStep:0};
  if(!isPlayer){r.tag=tagSprite(first,bib);R.root.add(r.tag);}return r;}
function removeRunner(r){scene.remove(r.R.root);disposeTree(r.R.root);const i=runners.indexOf(r);if(i>=0)runners.splice(i,1);}
function setPlayer(hero,custom){if(player)removeRunner(player);player=newRunner(hero,true,42,custom);runners.unshift(player);}
function setupOpponents(){for(const r of runners.slice())if(!r.isPlayer)removeRunner(r);
  const pool=HEROES.filter(h=>h!==player.hero);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=pool[i];pool[i]=pool[j];pool[j]=t;}
  pool.slice(0,7).forEach((h,i)=>runners.push(newRunner(h,false,BIBS[HEROES.indexOf(h)],null)));}
