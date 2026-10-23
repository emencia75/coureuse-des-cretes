/* ================= Monde d'un parcours ================= */
const W=3.2;               // demi-largeur du sentier (m)
const S0=-120;
let C=COURSES[0],L=600,RAVITO=300,ALT0=2000,S1=920,NS=1041;
let PX,PY,PZ,FX,FZ,RX,RZ,K,G;
// vitesses réalistes en descente de trail : ~14 à 20 km/h, 23 km/h en sprint
function baseVt(g){return clamp(3.0+g*11,2.8,5.6);}
function cx(s){return C.cx[0]*Math.sin(s*.0061)+C.cx[1]*Math.sin(s*.017+1.3)+C.cx[2]*Math.sin(s*.041+.4);}
function cyRaw(s){const k=2*Math.PI/C.vf;return-(C.g*s+C.g*C.v/k*Math.sin(s*k+1.1)+1.5*Math.sin(s*.023+1));}
function cy(s){let y;if(s<0)y=cyRaw(0)-s*.03;else if(s>L)y=cyRaw(L)-(s-L)*.035;else y=cyRaw(s);return y+.16*Math.sin(s*.9)*Math.sin(s*.13);}
// longueur choisie pour une descente d'environ 2 minutes à allure moyenne
function courseLength(c){const keep=C;C=c;let t=0,s=0;while(t<120&&s<2000){const g=(cyRaw(s)-cyRaw(s+2))/2;t+=1/(baseVt(g)*.99);s+=1;}C=keep;return Math.round(s/10)*10;}
COURSES.forEach(c=>{c.L=courseLength(c);const keep=C;C=c;L=c.L;c.drop=Math.round(cy(0)-cy(c.L));C=keep;});

const SP={x:0,y:0,z:0,fx:0,fz:-1,rx:1,rz:0,k:0,g:0};
function samp(s){let f=s-S0;if(f<0)f=0;if(f>NS-2.001)f=NS-2.001;const i=f|0,t=f-i,j=i+1;
  SP.x=PX[i]+(PX[j]-PX[i])*t;SP.y=PY[i]+(PY[j]-PY[i])*t;SP.z=PZ[i]+(PZ[j]-PZ[i])*t;SP.fx=FX[i]+(FX[j]-FX[i])*t;SP.fz=FZ[i]+(FZ[j]-FZ[i])*t;SP.rx=-SP.fz;SP.rz=SP.fx;SP.k=K[i]+(K[j]-K[i])*t;SP.g=G[i]+(G[j]-G[i])*t;return SP;}
function idx(s){return clamp(Math.round(s-S0),0,NS-1);}
function heading(){return Math.atan2(-SP.fx,-SP.fz);}
function buildTrack(){
  S1=L+320;NS=S1-S0+1;PX=new Float32Array(NS);PY=new Float32Array(NS);PZ=new Float32Array(NS);FX=new Float32Array(NS);FZ=new Float32Array(NS);RX=new Float32Array(NS);RZ=new Float32Array(NS);K=new Float32Array(NS);G=new Float32Array(NS);
  for(let i=0;i<NS;i++){const s=S0+i;PX[i]=cx(s);PY[i]=cy(s);PZ[i]=-s;const dx=cx(s+.5)-cx(s-.5);const len=Math.hypot(dx,1);FX[i]=dx/len;FZ[i]=-1/len;RX[i]=-FZ[i];RZ[i]=FX[i];}
  for(let i=0;i<NS;i++){const a=Math.max(0,i-1),b=Math.min(NS-1,i+1);K[i]=((FX[b]-FX[a])*RX[i]+(FZ[b]-FZ[a])*RZ[i])/(b-a);const c=Math.max(0,i-4),d=Math.min(NS-1,i+4);G[i]=(PY[c]-PY[d])/(d-c)*(-FZ[i]);}
}
function nearestS(x,z){let s0=-z,bs=s0,best=1e18;
  const W2=110+Math.abs(x)*.7,st=Math.abs(x)>200?8:4;for(let s=s0-W2;s<=s0+W2;s+=st){const i=idx(s);const dx=x-PX[i],dz=z-PZ[i],dd=dx*dx+dz*dz;if(dd<best){best=dd;bs=s;}}
  const c=bs,rr=Math.abs(x)>200?8:4;for(let s=c-rr;s<=c+rr;s+=.5){const i=idx(s);const dx=x-PX[i],dz=z-PZ[i],dd=dx*dx+dz*dz;if(dd<best){best=dd;bs=s;}}
  return bs;}
function terrainAt(x,z){const s=nearestS(x,z);const i=idx(s);const d=(x-PX[i])*RX[i]+(z-PZ[i])*RZ[i];const base=PY[i]-.38;const ad=Math.abs(d)-W-.9;let h=0;
  if(ad>0){const sh=ad<8?ad*ad/16:ad-4;const pk=C.peaks.h;
    if(d<0)h=sh*.42*(.6+pk*.3)+ad*ad*.0011*pk;else{h=-(sh*.4+ad*ad*.0007);const fl=-150+fbm(x*.01,z*.01)*14;if(h<fl+20)h=fl+20*Math.exp((h-fl-20)/20);}
    const amp=clamp((ad-2)/22,0,1);amp>0&&(h+=amp*amp*(fbm(x*.016,z*.016)*(7+ad*.1)+fbm(x*.06+5,z*.06)*1.4));
    h+=fbm(x*.25,z*.25)*.12*Math.min(1,ad/2);}
  return{y:base+h,d:d,s:s,ad:ad,rel:h};}
function groundY(x,z){return terrainAt(x,z).y;}

let adSpots=[];let world=null,terrainMesh=null,terrainBase=null,terrainSnowAmt=null,trailMesh=null,trailMaps=null,grassMesh=null,treeMeshes=[],cloudMat=null,clouds=[],fans=null,valley=null,seaFixedY=null,decorWater=null;
function dirtTex(base,pebble,snow){return canvasTex(512,(x,n)=>{x.fillStyle=snow?"#e9edf1":base;x.fillRect(0,0,n,n);const R=mulberry32(7);
  if(snow){for(let i=0;i<2600;i++){x.fillStyle="rgba(180,195,210,"+(.15+R()*.3)+")";x.beginPath();x.arc(R()*n,R()*n,R()*3+.5,0,7);x.fill();}
    x.strokeStyle="rgba(110,90,70,.45)";x.lineWidth=9;for(let i=0;i<4;i++){x.beginPath();const px=120+R()*270;x.moveTo(px,0);for(let y=0;y<=n;y+=16)x.lineTo(px+Math.sin(y*.025+i)*9,y);x.stroke();}return;}
  for(let i=0;i<5000;i++){const l=R();x.fillStyle=l<.5?"rgba(40,28,18,"+(.1+R()*.25)+")":"rgba(240,225,200,"+(.08+R()*.22)+")";const r=R()*3+.5;x.beginPath();x.arc(R()*n,R()*n,r,0,7);x.fill();}
  const pc=new THREE.Color(pebble||"#9a948a");
  for(let i=0;i<160;i++){const k=.8+R()*.35;const r=2+R()*7,px=R()*n,py=R()*n;x.fillStyle="rgba(40,30,20,.35)";x.beginPath();x.ellipse(px+1.5,py+2,r,r*.72,0,0,7);x.fill();x.fillStyle="rgb("+(pc.r*255*k|0)+","+(pc.g*255*k|0)+","+(pc.b*255*k|0)+")";x.beginPath();x.ellipse(px,py,r,r*.72,R()*3,0,7);x.fill();x.fillStyle="rgba(255,255,255,.18)";x.beginPath();x.ellipse(px-r*.25,py-r*.25,r*.4,r*.25,0,0,7);x.fill();}
  x.strokeStyle="rgba(40,28,16,.28)";x.lineWidth=5;for(let i=0;i<5;i++){x.beginPath();const px=90+R()*330;x.moveTo(px,0);for(let y=0;y<=n;y+=16)x.lineTo(px+Math.sin(y*.025+i)*9,y);x.stroke();}});}

function treeGeo(type){
  if(type==="pine"){const parts=[{geo:new THREE.CylinderGeometry(.1,.2,3.4,7).translate(0,1.7,0).rotateZ(.12),color:0x5a4030}];
    [[0,4,0,2.1],[.9,3.7,.4,1.5],[-.8,3.8,-.3,1.4]].forEach(p=>parts.push({geo:new THREE.SphereGeometry(1,10,7).scale(p[3],p[3]*.42,p[3]).translate(p[0]+.4,p[1],p[2]),color:0x3f5a2c}));return mergeColored(parts);}
  if(type==="broad"){const parts=[{geo:new THREE.CylinderGeometry(.14,.24,2.4,7).translate(0,1.2,0),color:0x5b4129}];
    [[0,3.2,0,1.6],[.8,2.7,.3,1.1],[-.7,2.8,-.4,1.15],[.1,3.9,.2,1.05]].forEach(p=>parts.push({geo:new THREE.IcosahedronGeometry(p[3],1).translate(p[0],p[1],p[2]),color:0x3f6a30}));return mergeColored(parts);}
  const parts=[{geo:new THREE.CylinderGeometry(.12,.22,1.6,7).translate(0,.8,0),color:0x4e3824}];
  for(const t of[[1.55,2.0,1.6],[1.3,1.9,2.6],[1.05,1.8,3.5],[.78,1.6,4.35],[.5,1.3,5.1],[.26,.9,5.75]])parts.push({geo:new THREE.ConeGeometry(t[0],t[1],9,1).translate(0,t[2],0),color:0x2c5230});
  return mergeColored(parts);}

function placeOnTrail(obj,s,d,dy){samp(s);obj.position.set(SP.x+SP.rx*d,SP.y+(dy||0),SP.z+SP.rz*d);obj.rotation.set(0,heading(),0);}

function buildWorld(c){
  if(world){scene.remove(world);disposeTree(world);}
  C=c;L=c.L;RAVITO=Math.round(L/2/10)*10;ALT0=c.alt0;buildTrack();
  world=new THREE.Group();scene.add(world);treeMeshes=[];clouds=[];
  const R0=mulberry32(2024+c.id.length*97);
  // --- terrain
  {const STEP=2.6,GZ0=150,GZ1=-(L+290);const XS=[];for(let x=-170;x<=170;x+=STEP)XS.push(x);let dx=STEP,xr=XS[XS.length-1],xl=XS[0];while(xr<560){dx=Math.min(dx*1.12,18);xr+=dx;xl-=dx;XS.push(xr);XS.unshift(xl);}
    const cols=XS.length,rows=Math.floor((GZ0-GZ1)/STEP)+1,N=cols*rows;const pos=new Float32Array(N*3),col=new Float32Array(N*3),uv=new Float32Array(N*2),rels=new Float32Array(N),ads=new Float32Array(N),sides=new Int8Array(N);
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){let x=XS[k],z=GZ0-r*STEP;let t=terrainAt(x,z);if(t.ad>6){x+=(hash2(k,r)-.5)*1.2;z+=(hash2(r+9,k)-.5)*1.2;t=terrainAt(x,z);}const n=r*cols+k;pos[n*3]=x;pos[n*3+1]=t.y;pos[n*3+2]=z;uv[n*2]=x/7;uv[n*2+1]=z/7;rels[n]=t.rel;ads[n]=t.ad;sides[n]=t.d<0?-1:1;}
    const P=c.pal,mA=new THREE.Color(P.mA),mB=new THREE.Color(P.mB),dry=new THREE.Color(P.dry),forest=new THREE.Color(P.forest),rock=new THREE.Color(P.rock),rockD=new THREE.Color(P.rockD),snow=new THREE.Color(0xf6f8fb),earth=new THREE.Color(P.earth),cc=new THREE.Color(),rk2=new THREE.Color();
    terrainSnowAmt=new Float32Array(N);
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const n=r*cols+k;const x=pos[n*3],z=pos[n*3+2],y=pos[n*3+1];const k1=Math.min(cols-1,k+1);const ny=pos[(Math.min(rows-1,r+1)*cols+k)*3+1],nx=pos[(r*cols+k1)*3+1];const slope=Math.hypot((ny-y)/STEP,(nx-y)/Math.max(.5,XS[k1]-XS[k]||STEP));
      const nz=fbm(x*.04,z*.04),nz2=fbm(x*.15+3,z*.15);const rel=rels[n],ad=ads[n];
      cc.copy(mA).lerp(mB,clamp(nz*.9+.5,0,1));if(nz2>.3)cc.lerp(dry,.4);if(sides[n]>0&&ad>10)cc.lerp(forest,clamp((ad-10)/50,0,.6));
      const rk=clamp((slope-.95+c.rockBias)*2.5+(rel-c.rockRel-nz*14)/10+c.rockBias*(nz2+.4),0,1);if(rk>0)cc.lerp(rk2.copy(rock).lerp(rockD,clamp(nz2+.5,0,1)),rk);
      const sn=clamp((rel-c.snowRel-nz*24)/8,0,1);if(sn>0)cc.lerp(snow,sn);if(ad<2.5)cc.lerp(earth,.5*(1-Math.max(0,ad)/2.5));
      cc.convertSRGBToLinear();col[n*3]=cc.r;col[n*3+1]=cc.g;col[n*3+2]=cc.b;terrainSnowAmt[n]=clamp(1.05-slope*.55,.35,.92);}
    const index=new Uint32Array((rows-1)*(cols-1)*6);let q=0;for(let r=0;r<rows-1;r++)for(let k=0;k<cols-1;k++){const a=r*cols+k,b=a+1,d=a+cols,e=d+1;index[q++]=a;index[q++]=b;index[q++]=d;index[q++]=b;index[q++]=e;index[q++]=d;}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));g.setAttribute("uv",new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(index,1));g.computeVertexNormals();
    terrainBase=col.slice();terrainMesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,map:grassDetail,roughness:.96,metalness:0}));terrainMesh.material.map=grassDetail;terrainMesh.receiveShadow=true;world.add(terrainMesh);}
  // --- fond de vallée, ou mer
  const vcol=c.water&&c.water.kind==="sea"?c.water.color:c.pal.forest;
  valley=new THREE.Mesh(new THREE.PlaneGeometry(5000,5000),new THREE.MeshStandardMaterial({color:vcol,roughness:c.water&&c.water.kind==="sea"?.15:1,metalness:c.water&&c.water.kind==="sea"?.3:0}));valley.rotation.x=-Math.PI/2;world.add(valley);
  seaFixedY=c.water&&c.water.kind==="sea"?PY[idx(L)]-20:null;
  if(c.water&&c.water.kind==="lake"){samp(60);const lake=new THREE.Mesh(new THREE.CircleGeometry(150,40),new THREE.MeshStandardMaterial({color:c.water.color,roughness:.08,metalness:.4}));lake.rotation.x=-Math.PI/2;lake.position.set(SP.x+SP.rx*185,SP.y-26,SP.z+SP.rz*185);world.add(lake);decorWater=lake;}
  // --- sentier
  trailMaps={dry:dirtTex(c.dirt,c.pebble,false),snow:dirtTex(c.dirt,c.pebble,true)};
  {const D=[-W-1.2,-W-.35,-W*.5,0,W*.5,W+.35,W+1.2],Y=[-.36,.04,.09,.11,.09,.04,-.36];const pos=[],uv=[],col=[],index=[];const edge=new THREE.Color(0x8a7a58),mid=new THREE.Color(0xffffff),cc=new THREE.Color();let rows=0;
    for(let s=S0+2;s<=S1-2;s+=.75){samp(s);for(let k=0;k<D.length;k++){pos.push(SP.x+SP.rx*D[k],SP.y+Y[k],SP.z+SP.rz*D[k]);uv.push((D[k]+W+1.2)/(2*W+2.4)*1.6,s/3.4);cc.copy(k===0||k===D.length-1?edge:mid);cc.multiplyScalar(.9+fbm(s*.08,k*1.3)*.15);col.push(cc.r,cc.g,cc.b);}rows++;}
    const n=D.length;for(let r=0;r<rows-1;r++)for(let k=0;k<n-1;k++){const a=r*n+k,b=a+1,cc2=a+n,d=cc2+1;index.push(a,b,cc2,b,d,cc2);}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));g.setIndex(index);g.computeVertexNormals();
    trailMesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:trailMaps.dry,bumpMap:trailMaps.dry,bumpScale:.035,vertexColors:true,roughness:.95}));trailMesh.receiveShadow=true;world.add(trailMesh);}
  // --- herbes et fleurs
  {const tex=canvasTex(256,(x,n)=>{x.clearRect(0,0,n,n);const R=mulberry32(3);for(let i=0;i<70;i++){const bx=n*.5+(R()-.5)*n*.8,h=n*(.45+R()*.5),bend=(R()-.5)*60;const g=140+R()*90|0;x.strokeStyle="rgb("+(g*.6|0)+","+g+","+(g*.32|0)+")";x.lineWidth=2+R()*3;x.beginPath();x.moveTo(bx,n);x.quadraticCurveTo(bx+bend*.3,n-h*.5,bx+bend,n-h);x.stroke();}
      const fl=["#f4f1e8","#f2c230","#a76bd6","#e8577a"];for(let i=0;i<5;i++){x.fillStyle=fl[i%4];x.beginPath();x.arc(n*.2+R()*n*.6,n*(.15+R()*.35),4+R()*3,0,7);x.fill();}});
    tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;const a=new THREE.PlaneGeometry(1,1).translate(0,.5,0),b=a.clone().rotateY(Math.PI/2);const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.Float32BufferAttribute([...a.attributes.position.array,...b.attributes.position.array],3));geo.setAttribute("uv",new THREE.Float32BufferAttribute([...a.attributes.uv.array,...b.attributes.uv.array],2));const up=[];for(let i=0;i<8;i++)up.push(0,1,0);geo.setAttribute("normal",new THREE.Float32BufferAttribute(up,3));geo.setIndex([0,2,1,2,3,1,4,6,5,6,7,5]);a.dispose();b.dispose();
    const COUNT=Math.round(8000*(c.rockBias>.3?.45:1));const mesh=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide,roughness:1}),COUNT);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),up3=new THREE.Vector3(0,1,0),cc=new THREE.Color();const hsl={};new THREE.Color(c.pal.mB).getHSL(hsl);
    for(let n=0;n<COUNT;n++){const s=R0()*(L+120)-40;samp(s);const side=R0()<.5?-1:1;const far=R0()<.35;const d=side*(W+.15+(far?1.5+R0()*14:R0()*1.6));const x=SP.x+SP.rx*d,z=SP.z+SP.rz*d;const y=groundY(x,z);const k=.35+R0()*.45;sc.set(k*1.3,k*(c.id==="paysbasque"?1.6:1),k*1.3);q.setFromAxisAngle(up3,R0()*6.28);p.set(x,y-.04,z);m.compose(p,q,sc);mesh.setMatrixAt(n,m);
      cc.setHSL(hsl.h+(R0()-.5)*.06-(c.id==="paysbasque"&&R0()<.4?.14:0),.42,.62+R0()*.2);mesh.setColorAt(n,cc);}
    grassMesh=mesh;world.add(mesh);}
  // --- arbres
  {const types=c.trees.type==="mixed"?["fir","broad"]:[c.trees.type];const per=Math.round(c.trees.count/types.length);
    for(const ty of types){const mesh=new THREE.InstancedMesh(treeGeo(ty),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92}),per);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),cc=new THREE.Color(),e=new THREE.Euler();let n=0,tries=0;const base=[];
      while(n<per&&tries<per*20){tries++;const s=R0()*(L+260)-60;samp(s);const side=R0()<.62?1:-1;const d=side*(W+3.2+Math.pow(R0(),1.5)*150);const x=SP.x+SP.rx*d,z=SP.z+SP.rz*d;if(fbm(x*.03,z*.03)<-.1)continue;const t=terrainAt(x,z);if(t.ad<2.6||t.rel>c.trees.maxRel)continue;
        const k=(ty==="fir"?.7:.8)+R0()*.9;sc.set(k,k*(.85+R0()*.45),k);e.set((R0()-.5)*.06,R0()*6.28,(R0()-.5)*.06);q.setFromEuler(e);p.set(x,t.y-.15,z);m.compose(p,q,sc);mesh.setMatrixAt(n,m);cc.setHSL(.3+R0()*.06,.25+R0()*.2,.5+R0()*.4);mesh.setColorAt(n,cc);base.push(cc.r,cc.g,cc.b);n++;}
      mesh.count=n;mesh.receiveShadow=true;mesh.userData.base=base;world.add(mesh);treeMeshes.push(mesh);}}
  // --- rochers épars
  {const COUNT=Math.round(700*(1+Math.max(0,c.rockBias)*1.5));const mesh=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:c.pal.rock,flatShading:true,roughness:.95}),COUNT);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),e=new THREE.Euler(),cc=new THREE.Color();
    for(let i=0;i<COUNT;i++){const s=R0()*(L+240)-60;samp(s);const side=R0()<.5?1:-1;const near=R0()<.45;const d=side*(near?W+1.4+R0()*3:W+4+R0()*120);const x=SP.x+SP.rx*d,z=SP.z+SP.rz*d;const t=terrainAt(x,z);const k=near?.25+R0()*.55:.5+R0()*2.6;sc.set(k*(1+R0()*.6),k*(.5+R0()*.5),k*(1+R0()*.6));e.set(R0()*3,R0()*3,R0()*3);q.setFromEuler(e);p.set(x,t.y+k*.15,z);m.compose(p,q,sc);mesh.setMatrixAt(i,m);cc.setScalar(.8+R0()*.3);mesh.setColorAt(i,cc);}
    mesh.receiveShadow=true;world.add(mesh);}
  // --- massifs lointains
  {const pk=c.peaks;const g=pk.round?new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2):new THREE.ConeGeometry(1,1,9,5);if(!pk.round)g.translate(0,.5,0);const p=g.attributes.position;const col=[];const rock=new THREE.Color(pk.col),snow=new THREE.Color(0xf4f6f9),cc=new THREE.Color();
    for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<.9&&y>.02){const a=Math.atan2(p.getZ(i),p.getX(i));const r=1+(hash2(Math.round(a*3),Math.round(y*5))-.5)*(pk.round?.12:.35);p.setX(i,p.getX(i)*r);p.setZ(i,p.getZ(i)*r);}cc.copy(rock);if(pk.snow&&y>1-pk.snow)cc.copy(snow);if(pk.crater&&y>.92)cc.multiplyScalar(.6);cc.convertSRGBToLinear();col.push(cc.r,cc.g,cc.b);}
    g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
    const COUNT=64;const mesh=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:!pk.round,roughness:1}),COUNT);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),pp=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
    for(let i=0;i<COUNT;i++){const s=-260+(i/2|0)*((L+700)/(COUNT/2))+R0()*40;samp(clamp(s,S0,S1));const side=i%2?1:-1;const d=side*(620+R0()*520);const h=(side<0?520+R0()*520:380+R0()*420)*pk.h;const r=Math.min(h*(pk.round?1.6:.6+R0()*.3),Math.abs(d)*.5);
      pp.set(SP.x+SP.rx*d,SP.y+(side<0?40:-190)*(pk.round?.5:1),SP.z+SP.rz*d+(s<S0?s-S0:0));q.setFromAxisAngle(up,R0()*6);sc.set(r,h,r);m.compose(pp,q,sc);mesh.setMatrixAt(i,m);}
    world.add(mesh);}
  // --- nuages
  cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true,transparent:true,opacity:.92});
  for(let i=0;i<16;i++){const grp=new THREE.Group();for(let k=0;k<5;k++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(10+R0()*12,1),cloudMat);b.position.set(k*14-28+R0()*6,R0()*6,R0()*10);b.scale.y=.55;grp.add(b);}
    samp(R0()*L);grp.position.set(SP.x+(R0()-.5)*900,SP.y+150+R0()*120,SP.z+(R0()-.5)*300);grp.userData.v=1.5+R0()*2;world.add(grp);clouds.push(grp);}
  adSpots=[];buildDecor(R0);adSpots.sort((a,b)=>a.s-b.s);
}

const wood=()=>new THREE.MeshStandardMaterial({color:0x6b4b2e,roughness:.9,flatShading:true});
function buildDecor(R0){
  function arch(s,label,bg,spId){const g=new THREE.Group();placeOnTrail(g,s,0,0);const sp=sponsorById(spId);const postG=new THREE.CylinderGeometry(.12,.12,4.2,8);const pm=new THREE.MeshStandardMaterial({color:0xf4f1e8,roughness:.6});
    for(const sd of[-1,1]){const p=new THREE.Mesh(postG,pm);p.position.set(sd*(W+.7),2.1,0);p.castShadow=true;g.add(p);}
    // bandeau : l'étape à gauche, le sponsor de l'arche à droite
    const tex=textTex(1024,160,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle="#f4f1e8";for(let i=0;i<w;i+=64){x.fillRect(i,0,32,14);x.fillRect(i+32,h-14,32,14);}x.fillStyle="#fff";x.font="900 96px "+FONT;x.textAlign="center";x.textBaseline="middle";x.fillText(label,w*.31,h/2+6);
      x.fillStyle="#f4f1e8";x.fillRect(w*.6,18,w*.38,h-36);drawWord(x,sp,w*.6+5,23,w*.38-10,h-46);});
    for(const sd of[-1,1]){const fl=new THREE.Mesh(new THREE.PlaneGeometry(.55,1.5),new THREE.MeshStandardMaterial({map:wordTex(sp,256,128),side:THREE.DoubleSide,roughness:.8}));fl.position.set(sd*(W+.7),1.6,.13);fl.rotation.z=sd*Math.PI/2;g.add(fl);}
    adSpots.push({s:s,brand:spId,kind:"arche"});
    const ban=new THREE.Mesh(new THREE.PlaneGeometry(2*W+1.6,1.05),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,roughness:.8}));ban.position.set(0,3.7,0);g.add(ban);world.add(g);}
  function signpost(s,top,bottom){const g=new THREE.Group();placeOnTrail(g,s,-W-1.3,0);const post=new THREE.Mesh(new THREE.BoxGeometry(.12,2.2,.12),wood());post.position.y=1.1;post.castShadow=true;g.add(post);
    const tex=textTex(512,160,(x,w,h)=>{x.fillStyle="#f2c230";x.beginPath();x.moveTo(0,0);x.lineTo(w-60,0);x.lineTo(w,h/2);x.lineTo(w-60,h);x.lineTo(0,h);x.fill();x.fillStyle="#1a1608";let fs=62;x.font="900 "+fs+"px "+FONT;while(x.measureText(top).width>w-90&&fs>30){fs-=2;x.font="900 "+fs+"px "+FONT;}x.textBaseline="top";x.fillText(top,24,16);x.font="700 40px "+FONT;x.fillText(bottom,24,92);});
    const plate=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.5),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,roughness:.7}));plate.position.set(.7,1.85,0);plate.rotation.y=-Math.PI/2+.5;g.add(plate);world.add(g);}
  {const geoW=new THREE.BoxGeometry(.13,.16,.13);const mw=new THREE.MeshStandardMaterial({color:0xf4f1e8}),mr=new THREE.MeshStandardMaterial({color:0xd6392b}),wm=wood();const postG=new THREE.BoxGeometry(.12,1,.12);
    for(let s=40,i=0;s<L;s+=55,i++){const g=new THREE.Group();placeOnTrail(g,s,(i%2?1:-1)*(W+1.05),0);const p=new THREE.Mesh(postG,wm);p.position.y=.5;g.add(p);const a=new THREE.Mesh(geoW,mw);a.position.y=1.04;g.add(a);const b=new THREE.Mesh(geoW,mr);b.position.y=.88;g.add(b);world.add(g);}}
  const AS=ARCH_SPONSORS[C.id]||["salomon","hoka"];arch(0,"DÉPART","#1f3d33",AS[0]);arch(L,"ARRIVÉE","#d6392b",AS[1]);
  // panneaux publicitaires le long du sentier, côté montagne
  {const order=SPONSORS.map(x=>x.id);const off=COURSES.indexOf(C);const postM=new THREE.MeshStandardMaterial({color:0x8a9096,roughness:.6});let i=0;
    for(let s=70;s<L-30;s+=78,i++){if(Math.abs(s-RAVITO)<20)continue;const sp=sponsorById(order[(i+off)%order.length]);const g=new THREE.Group();placeOnTrail(g,s,-W-2.3,0);
      for(const px of[-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,2.1,6),postM);p.position.set(px*1.1,1.05,0);g.add(p);}
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.95),new THREE.MeshStandardMaterial({map:wordTex(sp,512,188),side:THREE.DoubleSide,roughness:.7}));bd.position.y=1.6;g.add(bd);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(2.7,1.05,.04),postM);fr.position.set(0,1.6,-.03);g.add(fr);g.rotation.y+=.45;world.add(g);adSpots.push({s:s,brand:sp.id,kind:"panneau"});}
    // bâches le long de la ligne droite d'arrivée
    for(let s=L-48,j=0;s<L+20;s+=6,j++)for(const sd of[-1,1]){const sp=sponsorById(order[(j+(sd>0?3:0)+off)%order.length]);const g=new THREE.Group();placeOnTrail(g,s,sd*(W+.75),0);
      const bn=new THREE.Mesh(new THREE.PlaneGeometry(5.6,.7),new THREE.MeshStandardMaterial({map:wordTex(sp,512,64),side:THREE.DoubleSide,roughness:.8}));bn.position.y=.45;bn.rotation.y=Math.PI/2;g.add(bn);world.add(g);}}
  for(const f of[.3,.72]){const s=Math.round(L*f);signpost(s,C.to.toUpperCase(),fmtKm(L-s,1)+" km  ·  alt. "+fmtInt(ALT0+cy(s)-cy(0))+" m");}
  // ravito
  {const g=new THREE.Group();placeOnTrail(g,RAVITO,-W-2.6,0);const roof=new THREE.Mesh(new THREE.BoxGeometry(3.2,.12,3.2),new THREE.MeshStandardMaterial({color:0xd6392b,roughness:.7}));roof.position.y=2.5;roof.castShadow=true;g.add(roof);
    const pm=new THREE.MeshStandardMaterial({color:0xdddddd});for(const a of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,2.5,6),pm);p.position.set(a[0],1.25,a[1]);g.add(p);}
    const table=new THREE.Mesh(new THREE.BoxGeometry(.8,.08,2.6),new THREE.MeshStandardMaterial({color:0xf4f1e8}));table.position.set(1.1,.85,0);g.add(table);
    ["coca","barre","saucisson","iso","coca","barre","iso","saucisson"].forEach((k,i)=>{const it=foodMesh(k,1);it.position.set(1.1,.95+(k==="iso"?.06:k==="coca"?.04:.03),-1.1+i*.31);if(k==="barre"||k==="saucisson")it.rotation.y=Math.PI/2;g.add(it);});world.add(g);
    const bg=new THREE.Group();placeOnTrail(bg,RAVITO-6,0,0);const tex=textTex(1024,140,(x,w,h)=>{x.fillStyle="#f2c230";x.fillRect(0,0,w,h);x.fillStyle="#1a1608";x.font="900 96px "+FONT;x.textAlign="center";x.textBaseline="middle";x.fillText("RAVITO  ·  "+fmtKm(RAVITO)+" KM",w/2,h/2+4);});
    const wm=wood();for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3.6,6),wm);p.position.set(sd*(W+.6),1.8,0);bg.add(p);}const ban=new THREE.Mesh(new THREE.PlaneGeometry(2*W+1.2,.8),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide}));ban.position.y=3.3;bg.add(ban);world.add(bg);}
  // spectateurs
  {const zones=[[-30,25,40],[RAVITO-40,RAVITO+12,26],[L-140,L+40,70]];const list=[];
    for(const z of zones)for(let i=0;i<z[2];i++){const s=lerp(z[0],z[1],R0());samp(s);const side=R0()<.6?-1:1;const d=side*(W+1.6+R0()*3.4);const x=SP.x+SP.rx*d,zz=SP.z+SP.rz*d;const t=terrainAt(x,zz);list.push({x:x,y:t.y,z:zz,ph:R0()*6,sp:4+R0()*5,c:R0()});}
    const armG=sd=>new THREE.CylinderGeometry(.045,.04,.55,8).translate(0,.27,0).rotateZ(sd*.5).translate(sd*.19,1.28,0);
    const shirtGeo=mergeColored([{geo:new THREE.CylinderGeometry(.17,.15,.56,12).scale(1,1,.65).translate(0,1.12,0),color:0xffffff},{geo:new THREE.SphereGeometry(.17,12,6,0,Math.PI*2,0,Math.PI/2).scale(1,.4,.65).translate(0,1.4,0),color:0xffffff},{geo:armG(-1),color:0xffffff},{geo:armG(1),color:0xffffff}]);
    const restGeo=mergeColored([{geo:new THREE.SphereGeometry(.11,14,10).translate(0,1.6,0),color:0xd9a07a},{geo:new THREE.SphereGeometry(.117,14,10,0,Math.PI*2,0,Math.PI*.5).translate(0,1.62,.01),color:0x3a2618},{geo:new THREE.CylinderGeometry(.065,.05,.84,8).translate(-.08,.42,0),color:0x2b3442},{geo:new THREE.CylinderGeometry(.065,.05,.84,8).translate(.08,.42,0),color:0x2b3442},{geo:new THREE.SphereGeometry(.04,8,6).translate(-.47,1.72,0),color:0xd9a07a},{geo:new THREE.SphereGeometry(.04,8,6).translate(.47,1.72,0),color:0xd9a07a}]);
    const body=new THREE.InstancedMesh(shirtGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),list.length),head=new THREE.InstancedMesh(restGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),list.length);body.castShadow=head.castShadow=true;
    const pal=[0xd6392b,0x2d6fb8,0xf2c230,0x2c9c6a,0xf4f1e8,0x8a4fb8,0xff8a3d,0x1f2f4a],cc=new THREE.Color();list.forEach((f,i)=>{cc.set(pal[Math.floor(f.c*pal.length)]);body.setColorAt(i,cc);cc.setRGB(1,1,1);head.setColorAt(i,cc);});
    world.add(body);world.add(head);fans={list:list,body:body,head:head};}
}
const _m=new THREE.Matrix4();
function animFans(t,near){const L2=fans.list;for(let i=0;i<L2.length;i++){const f=L2[i];const cheer=near(f)?Math.abs(Math.sin(t*f.sp+f.ph))*.22:0;_m.makeRotationY(f.ph);_m.setPosition(f.x,f.y+cheer,f.z);fans.body.setMatrixAt(i,_m);fans.head.setMatrixAt(i,_m);}fans.body.instanceMatrix.needsUpdate=true;fans.head.instanceMatrix.needsUpdate=true;}
