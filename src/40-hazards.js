/* ================= Pièges et faune ================= */
let hazards=[],dyns=[],bottles=[],waterMeshes=[];
const SM=col=>new THREE.MeshStandardMaterial({color:lin(col),roughness:.8});
function relGround(s,d){if(Math.abs(d)<W+.6)return .1;samp(s);const sy=SP.y,x=SP.x+SP.rx*d,z=SP.z+SP.rz*d;return groundY(x,z)-sy+.02;}
const ANIMALS={
  deer:{label:"un cerf",body:[.72,.4,.3],y:1.05,leg:.95,legR:.045,fur:0x8a5a33,belly:0xc9a77d,dark:0x3a2a1c,horns:"antler",neck:.6,head:[.2,.11,.1],tail:0xf4f1e8},
  boar:{label:"un sanglier",body:[.62,.36,.3],y:.62,leg:.5,legR:.06,fur:0x3a2e26,belly:0x4a3c30,dark:0x1c1612,horns:"tusk",neck:.25,head:[.24,.14,.12],headDown:true,mane:0x2a201a,tail:0x2a201a},
  ibex:{label:"un bouquetin",body:[.58,.36,.28],y:.78,leg:.7,legR:.05,fur:0x7b6a55,belly:0xb3a48c,dark:0x3f342a,horns:"ibex",neck:.4,head:[.17,.1,.09],beard:true,tail:0x3f342a},
  isard:{label:"un isard",body:[.5,.3,.24],y:.75,leg:.68,legR:.04,fur:0xa07a4a,belly:0xd8c29a,dark:0x2f2418,horns:"hook",neck:.4,head:[.15,.09,.08],tail:0x2f2418},
  chamois:{label:"un chamois",body:[.52,.31,.25],y:.76,leg:.68,legR:.042,fur:0x6a4a30,belly:0xb89a72,dark:0x1f1812,horns:"hook",neck:.4,head:[.15,.09,.08],tail:0x1f1812},
  cow:{label:"une vache Salers",body:[.95,.55,.42],y:1.0,leg:.85,legR:.08,fur:0x7a2e1c,belly:0x8a3a24,dark:0x3a1a10,horns:"lyre",neck:.35,head:[.26,.17,.15],headDown:true,tail:0x3a1a10,big:true},
  pony:{label:"un pottok",body:[.62,.36,.27],y:.92,leg:.82,legR:.05,fur:0x4a2e1c,belly:0x6a4a30,dark:0x1a120c,neck:.55,head:[.24,.11,.1],mane:0x120c08,tail:0x120c08},
  goat:{label:"une chèvre",body:[.5,.32,.24],y:.7,leg:.62,legR:.04,fur:0x8a7a68,belly:0xc8bca8,dark:0x3a3228,horns:"goat",neck:.38,head:[.15,.09,.08],beard:true,tail:0x3a3228},
};
function legSet(g,pts,len,r,mat){const legs=[];for(const p of pts){const lg=new THREE.Group();lg.position.set(p[0],p[1],p[2]);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.7,len,7),mat);m.position.y=-len/2;m.castShadow=true;lg.add(m);g.add(lg);legs.push(lg);}return legs;}
function makeQuad(kind){const A=ANIMALS[kind];const g=new THREE.Group();const fur=SM(A.fur),belly=SM(A.belly),dark=SM(A.dark),hornM=SM(kind==="cow"?0xefe6d2:0x9a8a70);
  const [bx,by,bz]=A.body;const body=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),fur);body.scale.set(bx,by,bz);body.position.y=A.y;body.castShadow=true;g.add(body);
  const bl=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),belly);bl.scale.set(bx*.82,by*.62,bz*.86);bl.position.set(0,A.y-by*.3,0);g.add(bl);
  const nk=new THREE.Mesh(new THREE.CylinderGeometry(bz*.32,bz*.48,A.neck,10),fur);nk.position.set(bx*.76,A.y+by*.55*(A.headDown?.2:1),0);nk.rotation.z=A.headDown?-1.2:-.65;g.add(nk);
  const head=new THREE.Group();head.position.set(bx*1.08+(A.headDown?.08:0),A.y+by*(A.headDown?.25:1.4),0);g.add(head);
  const hm=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),fur);hm.scale.set(A.head[0],A.head[1],A.head[2]);head.add(hm);
  const sn=new THREE.Mesh(new THREE.SphereGeometry(A.head[1]*.5,8,6),dark);sn.position.set(A.head[0]*.95,-A.head[1]*.3,0);head.add(sn);
  for(const sd of[-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(A.head[2]*.4,A.head[1]*1.3,6),fur);ear.position.set(-A.head[0]*.3,A.head[1]*.9,sd*A.head[2]*.8);ear.rotation.x=sd*.7;head.add(ear);
    if(A.horns==="antler"){const a=new THREE.Group();a.position.set(-.02,.1,sd*.05);head.add(a);const ant=SM(0xd8c7a6);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.018,.026,.55,6),ant);beam.position.set(-.06,.26,sd*.08);beam.rotation.set(sd*.35,0,.25);a.add(beam);for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.2,5),ant);t.position.set(-.05*i,.18+.12*i,sd*(.1+.04*i));t.rotation.set(sd*.2,0,-.7);a.add(t);}}
    else if(A.horns==="ibex"){const h=new THREE.Mesh(new THREE.TorusGeometry(.3,.038,6,14,Math.PI*.85),hornM);h.position.set(-.3,.06,sd*.05);head.add(h);}
    else if(A.horns==="hook"){const h=new THREE.Mesh(new THREE.TorusGeometry(.06,.014,5,10,Math.PI*1.1),SM(0x1a1410));h.position.set(-.02,.15,sd*.04);h.rotation.z=Math.PI*.5;head.add(h);}
    else if(A.horns==="goat"){const h=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,6,12,Math.PI*.7),hornM);h.position.set(-.16,.06,sd*.05);head.add(h);}
    else if(A.horns==="lyre"){const h=new THREE.Mesh(new THREE.TorusGeometry(.16,.028,6,12,Math.PI*.9),hornM);h.position.set(-.04,.18,sd*.2);h.rotation.set(sd*1.3,0,Math.PI*.35);head.add(h);}
    else if(A.horns==="tusk"){const h=new THREE.Mesh(new THREE.ConeGeometry(.012,.08,5),SM(0xf0ead8));h.position.set(A.head[0]*.85,-.05,sd*.05);h.rotation.z=-.6;head.add(h);}}
  if(A.beard){const b=new THREE.Mesh(new THREE.ConeGeometry(.03,.13,6),dark);b.position.set(.08,-.12,0);b.rotation.z=Math.PI;head.add(b);}
  if(A.mane){const mn=new THREE.Mesh(new THREE.BoxGeometry(A.neck*.9,.06,.05),SM(A.mane));mn.position.set(bx*.7,A.y+by*1.05,0);mn.rotation.z=A.headDown?-.3:-.65;g.add(mn);}
  const tl=new THREE.Mesh(new THREE.SphereGeometry(bz*.26,8,6),SM(A.tail));tl.scale.y=kind==="pony"||kind==="cow"?2.4:1;tl.position.set(-bx*1.02,A.y+by*.1-(kind==="pony"||kind==="cow"?.2:0),0);g.add(tl);
  const lx=bx*.62,lz=bz*.48;const legs=legSet(g,[[lx,A.y-by*.4,lz],[lx,A.y-by*.4,-lz],[-lx,A.y-by*.4,lz],[-lx,A.y-by*.4,-lz]],A.leg-by*.4+.02,A.legR,kind==="pony"||kind==="cow"?fur:dark);
  return{g:g,legs:legs,head:head};}
function makeMarmot(){const g=new THREE.Group();const fur=SM(0x8b6a45),face=SM(0xb8976d),dark=SM(0x2a2018);const piv=new THREE.Group();g.add(piv);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),fur);body.scale.set(.24,.15,.14);body.position.set(0,.15,0);body.castShadow=true;piv.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),face);head.position.set(.24,.2,0);piv.add(head);const nose=new THREE.Mesh(new THREE.SphereGeometry(.022,6,5),dark);nose.position.set(.33,.21,0);piv.add(nose);
  const tail=new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,.18,6),SM(0x4a3828));tail.position.set(-.27,.14,0);tail.rotation.z=1.2;piv.add(tail);return{g:g,piv:piv};}
function hzLabel(h){return h.type==="cross"||h.type==="stand"?ANIMALS[h.kind].label:"";}
function capFirst(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function animalName(h){return capFirst(ANIMALS[h.kind].label.replace(/^(un|une) /,""));}

// produits du ravito, grossis pour être visibles en courant
function foodMesh(key,scale){const g=new THREE.Group();
  if(key==="coca"){const can=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.2,16),new THREE.MeshStandardMaterial({map:wordTex(sponsorById("coca"),256,96),roughness:.35,metalness:.3}));const top=new THREE.Mesh(new THREE.CylinderGeometry(.066,.07,.012,16),new THREE.MeshStandardMaterial({color:0xc8ccd0,metalness:.8,roughness:.3}));top.position.y=.106;g.add(can,top);}
  else if(key==="barre"){const b=new THREE.Mesh(new THREE.BoxGeometry(.28,.05,.1),[SM(0x0f3b2e),SM(0x0f3b2e),new THREE.MeshStandardMaterial({map:wordTex(sponsorById("naak"),256,96)}),SM(0x0f3b2e),SM(0x0f3b2e),SM(0x0f3b2e)]);g.add(b);}
  else if(key==="saucisson"){const m=SM(0x7a2e22);const b=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.3,12),m);b.rotation.z=Math.PI/2;g.add(b);for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),m);e.position.x=sx*.15;g.add(e);}const fl=new THREE.Mesh(new THREE.CylinderGeometry(.057,.057,.2,12,1,true),new THREE.MeshStandardMaterial({color:lin(0xf1ece2),transparent:true,opacity:.35,roughness:1}));fl.rotation.z=Math.PI/2;g.add(fl);const st=new THREE.Mesh(new THREE.TorusGeometry(.03,.006,4,10),SM(0xeee6d0));st.position.set(.2,.02,0);g.add(st);}
  else{const b=new THREE.Mesh(new THREE.CylinderGeometry(.075,.08,.3,14),new THREE.MeshStandardMaterial({color:lin(0x3fc9c0),roughness:.25,transparent:true,opacity:.92}));const cap=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,.06,10),SM(0xf4f1e8));cap.position.y=.18;
    const lb=new THREE.Mesh(new THREE.CylinderGeometry(.082,.082,.1,14,1,true),new THREE.MeshStandardMaterial({map:textTex(256,64,(x,w,h)=>{x.fillStyle="#f4f1e8";x.fillRect(0,0,w,h);x.fillStyle="#0e6f6a";x.font="900 40px "+FONT;x.textAlign="center";x.textBaseline="middle";x.fillText("ISOTONIQUE",w/2,h/2+2);})}));g.add(b,cap,lb);}
  g.scale.setScalar(scale||1.8);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function buildHazards(){
  hazards=[];dyns=[];waterMeshes=[];const R=mulberry32(42+C.id.length*13);const c=C;
  const rockMat=new THREE.MeshStandardMaterial({color:c.pal.rock,flatShading:true,roughness:.9});const bark=new THREE.MeshStandardMaterial({color:0x5b3f26,flatShading:true,roughness:.95});const ring=new THREE.MeshStandardMaterial({color:0xc89a62,roughness:.9});
  const mudMat=new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:.25,metalness:.1});const rootMat=new THREE.MeshStandardMaterial({color:0x4a3320,roughness:.9,flatShading:true});
  const rimMat=new THREE.MeshStandardMaterial({color:0x4a3a26,roughness:.6});
  const screeTex=textTex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);const r=mulberry32(5);const pc=new THREE.Color(c.pal.rock);for(let i=0;i<700;i++){const k=.75+r()*.35;x.fillStyle="rgb("+(pc.r*255*k|0)+","+(pc.g*255*k|0)+","+(pc.b*255*k|0)+")";const rr=2+r()*6;x.beginPath();x.ellipse(r()*w,r()*h,rr,rr*.7,r()*3,0,7);x.fill();}});
  const screeMat=new THREE.MeshStandardMaterial({map:screeTex,transparent:true,roughness:1,depthWrite:false});
  const bottleMat=new THREE.MeshStandardMaterial({color:0x3aa0e0,emissive:0x0d4f80,roughness:.3});const capMat=new THREE.MeshStandardMaterial({color:0xf2c230,emissive:0x5a4300});const holeMat=new THREE.MeshBasicMaterial({color:0x1a120a});
  function group(s,dy){const g=new THREE.Group();samp(s);g.position.set(SP.x,SP.y+(dy||.1),SP.z);g.rotation.set(-Math.atan(SP.g),heading(),0,"YXZ");world.add(g);return g;}
  function flat(s){const g=new THREE.Group();samp(s);g.position.set(SP.x,SP.y,SP.z);g.rotation.set(0,heading(),0);world.add(g);return g;}
  function add(h){hazards.push(h);if(h.dyn)dyns.push(h);return h;}
  function bottle(ss,d){const g=group(ss,.1);const b=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.42,10),bottleMat);b.position.set(d,.6,0);const cp=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.1,8),capMat);cp.position.y=.26;b.add(cp);g.add(b);add({type:"bottle",s:ss,d0:d-.35,d1:d+.35,depth:.9,g:g,m:b});}
  function food(ss,d,key){const g=group(ss,.1);const m=foodMesh(key);m.position.set(d,.6,0);g.add(m);add({type:"food",item:key,s:ss,d0:d-.4,d1:d+.4,depth:.9,g:g,m:m});}
  function warnSign(s,label){const g=new THREE.Group();placeOnTrail(g,s,-W-1.4,0);const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2.2,6),SM(0x9aa0a6));post.position.y=1.1;g.add(post);
    const tex=textTex(256,300,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="#d6392b";x.beginPath();x.moveTo(w/2,6);x.lineTo(w-6,226);x.lineTo(6,226);x.closePath();x.fill();x.fillStyle="#fff";x.beginPath();x.moveTo(w/2,40);x.lineTo(w-40,206);x.lineTo(40,206);x.closePath();x.fill();x.fillStyle="#111";x.font="900 92px "+FONT;x.textAlign="center";x.fillText("!",w/2,190);x.fillStyle="#fff";x.fillRect(0,238,w,58);x.fillStyle="#111";x.font="800 30px "+FONT;x.fillText(label,w/2,278);});
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(.75,.88),new THREE.MeshStandardMaterial({map:tex,transparent:true,side:THREE.DoubleSide,alphaTest:.1}));pl.position.set(0,2.0,0);pl.rotation.y=-Math.PI/2+.45;g.add(pl);world.add(g);}
  const types=Object.entries(c.hz).filter(e=>e[1]>0);const tot=types.reduce((a,e)=>a+e[1],0);
  function pick(){let r=R()*tot,a=0;for(const t of types){a+=t[1];if(r<a)return t[0];}return"rock";}
  let s=45,last="";
  while(s<L-30){
    const diff=s/L;
    if(Math.abs(s-RAVITO)<26){ // ravito : coca, barre, saucisson, isotonique, sur deux rangées
      const keys=Object.keys(FOODS);for(const row of[RAVITO-14,RAVITO+9]){const lanes=[-2.3,-.8,.8,2.3];for(let i=lanes.length-1;i>0;i--){const j=Math.floor(R()*(i+1));const t=lanes[i];lanes[i]=lanes[j];lanes[j]=t;}keys.forEach((k,i)=>food(row,lanes[i],k));}
      s=RAVITO+26;continue;}
    let t=pick();if(t===last&&t!=="rock")t=pick();last=t;
    if(t==="rock"){const two=R()<.35+diff*.3;const g=group(s,.1);const centers=two?[-W*.55+(R()-.5),W*.55+(R()-.5)]:[(R()-.5)*(2*W-1.8)];
      for(const cc of centers){const rad=.55+R()*.3;const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rad,0),rockMat);m.scale.set(1.15,.85+R()*.25,1);m.rotation.set(R()*3,R()*3,R()*3);m.position.set(cc,rad*.6,0);m.castShadow=true;g.add(m);add({type:"rock",s:s,d0:cc-rad*1.05,d1:cc+rad*1.05,depth:rad*1.6,clear:99,g:g});}}
    else if(t==="log"){const len=3.4+R()*1.6;const fromLeft=R()<.5;const d0=fromLeft?-W-.6:W+.6-len,d1=d0+len;const g=group(s,.1);
      const lg=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,len,9),bark);lg.rotation.z=Math.PI/2;lg.position.set((d0+d1)/2,.24,0);lg.castShadow=true;g.add(lg);
      const end=new THREE.Mesh(new THREE.CircleGeometry(.22,9),ring);end.position.set(fromLeft?d1+.001:d0-.001,.24,0);end.rotation.y=fromLeft?Math.PI/2:-Math.PI/2;g.add(end);add({type:"log",s:s,d0:d0,d1:d1,depth:.55,clear:.34,g:g});}
    else if(t==="roots"){const g=group(s,.1);for(let i=0;i<3;i++){const ln=2*W*(.5+R()*.4);const rt=new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,ln,6),rootMat);rt.rotation.set(0,(R()-.5)*.5,Math.PI/2);rt.position.set((R()-.5)*(2*W-ln)*.8,.07,(i-1)*.28);rt.castShadow=true;g.add(rt);}add({type:"roots",s:s,d0:-W-1,d1:W+1,depth:.9,clear:.16,g:g});}
    else if(t==="mud"){const cc=(R()-.5)*(2*W-1.2);const rad=1.1+R()*.7;const g=group(s,.115);const m=new THREE.Mesh(new THREE.CircleGeometry(1,18),mudMat);m.rotation.x=-Math.PI/2;m.scale.set(rad*1.15,rad*1.5,1);m.position.x=cc;m.receiveShadow=true;g.add(m);add({type:"mud",s:s,d0:cc-rad*1.1,d1:cc+rad*1.1,depth:rad*2.6,clear:.12,g:g});}
    else if(t==="water"){const wid=3.6+R()*2.2,len=3.4+R()*2.2;const cc=clamp((R()-.5)*(2*W-wid),-W+wid/2-.4,W-wid/2+.4);const g=group(s,.112);
      const rim=new THREE.Mesh(new THREE.CircleGeometry(1,28),rimMat);rim.rotation.x=-Math.PI/2;rim.scale.set(wid/2+.3,len/2+.3,1);rim.position.x=cc;rim.receiveShadow=true;g.add(rim);
      const wm=new THREE.Mesh(new THREE.CircleGeometry(1,28),new THREE.MeshStandardMaterial({color:0x6d8ea6,roughness:.03,metalness:.65,transparent:true,opacity:.92}));wm.rotation.x=-Math.PI/2;wm.scale.set(wid/2,len/2,1);wm.position.set(cc,.008,0);wm.receiveShadow=true;g.add(wm);waterMeshes.push(wm);
      add({type:"water",s:s,d0:cc-wid/2,d1:cc+wid/2,depth:len,clear:.12,g:g});}
    else if(t==="scree"){const len=10+R()*6;const g=group(s,.12);const m=new THREE.Mesh(new THREE.PlaneGeometry(2*W+.4,len),screeMat);m.rotation.x=-Math.PI/2;g.add(m);add({type:"scree",s:s,d0:-W-1,d1:W+1,depth:len,clear:.1,g:g});s+=len/2;}
    else if(t==="cross"){const kind=c.fauna.cross;const dir=R()<.5?1:-1;const g=flat(s);const A=makeQuad(kind);g.add(A.g);if(dir<0)A.g.rotation.y=Math.PI;const sp=kind==="boar"?5.2:6.4;const d0=-dir*(W+9);
      add({type:"cross",kind:kind,dyn:true,s:s,dir:dir,start:d0,d:d0,speed:sp+R()*1.4,tArr0:(W+9)/(sp+.6)+(R()-.4)*.9,len:kind==="boar"?.7:.85,depth:.8,clear:99,d0:-99,d1:-99,g:g,A:A});}
    else if(t==="stand"){const kind=c.fauna.stand;const big=ANIMALS[kind].big;const cc=(R()-.5)*(2*W-(big?2.6:2));const g=flat(s);const A=makeQuad(kind);g.add(A.g);const face=R()<.5?1:-1;if(face<0)A.g.rotation.y=Math.PI;const hl=big?1.05:.7;
      add({type:"stand",kind:kind,dyn:true,s:s,dir:face,start:cc,d:cc,stubborn:big||kind==="pony"||R()<.5,len:hl,depth:big?1.1:.8,clear:99,d0:cc-hl,d1:cc+hl,g:g,A:A});}
    else if(t==="rockfall"){warnSign(s-24,"CHUTES DE PIERRES");const n=2+(diff>.5&&R()<.5?1:0);
      for(let i=0;i<n;i++){const ss=s+i*(2.5+R()*2.5);const g=flat(ss);const rad=.4+R()*.35;const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rad,0),rockMat);m.castShadow=true;g.add(m);const sp=7+R()*3;
        add({type:"boulder",dyn:true,s:ss,start:-(W+18),d:-(W+18),speed:sp,rad:rad,tArr0:(W+18)/sp+(R()-.45)*1.1+i*.25,len:rad,depth:rad*1.6,clear:99,d0:-99,d1:-99,g:g,m:m,first:i===0});}s+=8;}
    else if(t==="small"){const n=R()<.5?2:1;for(let i=0;i<n;i++){const ss=s+i*3.5;const dir=R()<.5?1:-1;const g=flat(ss);const hole=new THREE.Mesh(new THREE.CircleGeometry(.2,12),holeMat);hole.rotation.x=-Math.PI/2;const hd=-dir*(W+.55);hole.position.set(hd,relGround(ss,hd)+.03,0);g.add(hole);
        const A=makeMarmot();g.add(A.g);if(dir<0)A.g.rotation.y=Math.PI;add({type:"marmot",dyn:true,s:ss,dir:dir,start:hd,d:hd,speed:3.6+R()*1.2,tArr0:.9+R()*.9,len:.28,depth:.5,clear:.3,d0:-99,d1:-99,g:g,A:A});}}
    if(R()<.1&&s>90)bottle(s+7,(R()-.5)*(2*W-1.6));
    s+=10+R()*11-diff*3;
  }
  hazards.sort((a,b)=>a.s-b.s);hazards.forEach((h,i)=>h.id=i);bottles=hazards.filter(h=>h.type==="bottle"||h.type==="food");
}
function resetDyn(h){h.st="armed";h.t=0;h.d=h.start;h.live=h.type==="stand";h.hNow=0;h.g.visible=true;h.tArr=h.tArr0;
  if(h.type==="stand"){h.d0=h.d-h.len;h.d1=h.d+h.len;h.A.g.rotation.y=h.dir<0?Math.PI:0;}else{h.d0=h.d1=-99;}placeDyn(h,0);}
function placeDyn(h,y){const o=h.type==="boulder"?h.m:h.A.g;o.position.set(h.d,y,0);}
function updDyn(h,dt){
  if(h.st==="done")return;
  const eta=(h.s-player.s)/Math.max(player.v,2.2);h.t+=dt;
  if(h.type==="cross"){
    if(h.st==="armed"){h.A.head.rotation.z=Math.sin(T*1.3+h.s)*.15;placeDyn(h,relGround(h.s,h.d));if(h.s>player.s&&eta<h.tArr){h.st="go";h.t=0;if(h.s-player.s<45)warn("Attention, "+ANIMALS[h.kind].label+" !");}return;}
    h.d+=h.dir*h.speed*dt;const ph=h.t*(h.kind==="boar"?16:11);const y=relGround(h.s,h.d)+Math.abs(Math.sin(ph))*(h.kind==="boar"?.08:.35);placeDyn(h,y);h.A.legs.forEach((l,i)=>l.rotation.z=Math.sin(ph+(i<2?0:2.2))*.7);
    h.live=Math.abs(h.d)<W+1;h.d0=h.d-h.len;h.d1=h.d+h.len;if(Math.abs(h.d)>W+14){h.st="done";h.g.visible=false;h.live=false;}
  }else if(h.type==="stand"){
    if(h.st==="armed"){h.A.head.rotation.z=Math.sin(T*.8+h.s)*.2-.1;placeDyn(h,.1);if(!h.stubborn&&h.s>player.s&&eta<1.15){h.st="go";h.t=0;h.jumpTo=-W-6;}return;}
    const k=Math.min(1,h.t/1.1);h.d=lerp(h.start,h.jumpTo,k);placeDyn(h,lerp(.1,relGround(h.s,h.d),k)+Math.sin(k*Math.PI)*1.1);h.A.g.rotation.y=Math.PI;h.A.legs.forEach((l,i)=>l.rotation.z=(i<2?-.8:.8)*Math.sin(k*Math.PI));
    h.d0=h.d-.6;h.d1=h.d+.6;h.live=Math.abs(h.d)<W+.8&&k<.9;if(k>=1){h.st="done";h.live=false;}
  }else if(h.type==="boulder"){
    if(h.st==="armed"){h.g.visible=false;if(h.s>player.s&&eta<h.tArr){h.st="go";h.t=0;h.g.visible=true;if(h.first){sfxRumble();warn("Chute de pierres !");}}return;}
    h.d+=h.speed*dt;const ph=h.t*4.2;const b=Math.abs(Math.sin(ph))*Math.max(.25,1.6-h.t*.35);h.hNow=b;placeDyn(h,relGround(h.s,h.d)+h.rad*.8+b);h.m.rotation.z-=dt*h.speed/h.rad;h.m.rotation.x+=dt*2;
    h.live=Math.abs(h.d)<W+.8;h.clear=b>.9?-1:99;h.d0=h.d-h.rad;h.d1=h.d+h.rad;if(h.d>W+30){h.st="done";h.g.visible=false;h.live=false;}
  }else if(h.type==="marmot"){
    if(h.st==="armed"){h.A.piv.rotation.z=1.25;placeDyn(h,relGround(h.s,h.d)+.02+Math.max(0,Math.sin(T*.9+h.s*3))*.03);if(h.s>player.s&&eta<h.tArr){h.st="go";h.t=0;if(h.s-player.s<30)sfxWhistle();}return;}
    h.A.piv.rotation.z=0;h.d+=h.dir*h.speed*dt;placeDyn(h,relGround(h.s,h.d)+Math.abs(Math.sin(h.t*18))*.05);
    h.live=Math.abs(h.d)<W+.4;h.d0=h.d-h.len;h.d1=h.d+h.len;if(Math.abs(h.d)>W+.6&&Math.sign(h.d)===h.dir){h.st="done";h.g.visible=false;h.live=false;}
  }
}
