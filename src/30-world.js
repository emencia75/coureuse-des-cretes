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

let adSpots=[],trailDirt=null,waterObj=null,panoObj=null;let world=null,terrainMesh=null,terrainBase=null,terrainSnowAmt=null,trailMesh=null,trailMaps=null,grassMesh=null,treeMeshes=[],cloudMat=null,clouds=[],fans=null,valley=null,seaFixedY=null,decorWater=null;
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

// vent : balancement des herbes et des arbres (amplitude, hauteur de départ)
function windShader(mat,amp,y0,ao){mat.onBeforeCompile=sh=>{sh.uniforms.uTime=GFX.time;if(ao)sh.fragmentShader=sh.fragmentShader.replace("#include <map_fragment>","#include <map_fragment>\ndiffuseColor.rgb*=mix(.35,1.,smoothstep(0.,.9,vUv.x));");sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nuniform float uTime;").replace("#include <begin_vertex>",
  "#include <begin_vertex>\nvec4 ip=instanceMatrix[3];float h=max(0.,position.y-"+y0.toFixed(2)+");float ph=uTime*1.7+ip.x*.21+ip.z*.17;transformed.x+=sin(ph)*"+amp.toFixed(3)+"*h*h;transformed.z+=cos(ph*.8)*"+(amp*.6).toFixed(3)+"*h*h;");};}
// arbres en cartes : tronc + rameaux (sapin), houppier (feuillus, pins)
function treeCards(type){const P=[],U=[],Nn=[],I=[];const quad=(a,b,c2,d,n)=>{const o=P.length/3;[a,b,c2,d].forEach(v=>{P.push(v.x,v.y,v.z);});U.push(0,0,1,0,1,1,0,1);for(let i=0;i<4;i++)Nn.push(n.x,n.y,n.z);I.push(o,o+1,o+2,o,o+2,o+3);};
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);const R=mulberry32(type.length*31+5);let trunk;
  if(type==="fir"){const H=7.5,maxR=2.3,LAY=15;trunk=new THREE.CylinderGeometry(.04,.2,H*.82,6).translate(0,H*.41,0);
    for(let i=0;i<LAY;i++){const t=i/(LAY-1);const y=H*(.12+.84*t);const r=maxR*Math.pow(1-t,1.1)+.28;const n=t>.85?5:9;const off=R()*6.28;
      for(let k=0;k<n;k++){const a=off+k/n*6.28+(R()-.5)*.35;const dx=Math.cos(a),dz=Math.sin(a);const w2=r*.42;const sx=-dz*w2,sz=dx*w2;const dr=r*(.28+R()*.14);
        // rameau en deux segments : part presque à plat puis retombe
        const mx=dx*r*.55,mz=dz*r*.55,my=y-dr*.25;const nU=new THREE.Vector3(dx,.8,dz).normalize(),nD=new THREE.Vector3(dx,.45,dz).normalize();
        const o=P.length/3;[[sx*.25,y,sz*.25,0,0],[-sx*.25,y,-sz*.25,0,1],[mx-sx*.85,my,mz-sz*.85,.55,1],[mx+sx*.85,my,mz+sz*.85,.55,0],[dx*r-sx*.6,y-dr,dz*r-sz*.6,1,1],[dx*r+sx*.6,y-dr,dz*r+sz*.6,1,0]].forEach((q,qi)=>{P.push(q[0],q[1],q[2]);U.push(q[3],q[4]);const nn=qi<4?nU:nD;Nn.push(nn.x,nn.y,nn.z);});
        I.push(o,o+1,o+2,o,o+2,o+3,o+3,o+2,o+4,o+3,o+4,o+5);}}
    }
  else if(type==="pine"){const H=4.2;trunk=new THREE.CylinderGeometry(.1,.2,H,7).translate(0,H/2,0).rotateZ(.1);
    for(let k=0;k<20;k++){const a=R()*6.28,r=Math.sqrt(R())*2.2;const cx=Math.cos(a)*r+.4,cz=Math.sin(a)*r,cy=H+(R()-.3)*.6;const s=.9+R()*.5;const ta=R()*3.14;const ux=Math.cos(ta)*s,uz=Math.sin(ta)*s;
      quad(V(cx-ux,cy-.15,cz-uz),V(cx+ux,cy-.15,cz+uz),V(cx+uz*.2+ux,cy+.25,cz-ux*.2+uz),V(cx+uz*.2-ux,cy+.25,cz-ux*.2-uz),V(0,1,0));
      quad(V(cx-ux*.7,cy-.45,cz-uz*.7),V(cx+ux*.7,cy-.45,cz+uz*.7),V(cx+ux*.7,cy+.35,cz+uz*.7),V(cx-ux*.7,cy+.35,cz-uz*.7),V(Math.cos(a),.6,Math.sin(a)).normalize());}}
  else{const H=2.6;trunk=new THREE.CylinderGeometry(.13,.24,H+1,7).translate(0,(H+1)/2,0);
    for(let k=0;k<28;k++){const a=R()*6.28,el=(R()-.35)*1.6,r=.6+R()*1.2;const cx=Math.cos(a)*Math.cos(el)*r*1.25,cy=H+1.1+Math.sin(el)*r,cz=Math.sin(a)*Math.cos(el)*r*1.25;const s=.75+R()*.5;const n=V(cx,cy-H-1.1,cz).normalize();
      const ta=R()*3.14;const ux=Math.cos(ta)*s,uz=Math.sin(ta)*s;quad(V(cx-ux,cy-s,cz-uz),V(cx+ux,cy-s,cz+uz),V(cx+ux,cy+s,cz+uz),V(cx-ux,cy+s,cz-uz),n);}}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setAttribute("normal",new THREE.Float32BufferAttribute(Nn,3));g.setIndex(I);return{foliage:g,trunk:trunk};}
// sapin photo : trois panneaux croisés (l'image détourée contient le tronc)
function spruceCards(){const P=[],U=[],Nn=[],I=[];const H=9,Wd=4.6;for(let k=0;k<3;k++){const a=k*Math.PI/3;const dx=Math.cos(a)*Wd/2,dz=Math.sin(a)*Wd/2;const o=P.length/3;
    P.push(-dx,0,-dz,dx,0,dz,dx,H,dz,-dx,H,-dz);U.push(0,0,1,0,1,1,0,1);for(let i=0;i<4;i++)Nn.push(0,1,0);I.push(o,o+1,o+2,o,o+2,o+3);}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setAttribute("normal",new THREE.Float32BufferAttribute(Nn,3));g.setIndex(I);return{foliage:g,trunk:new THREE.BufferGeometry()};}
// rocher irrégulier : icosaèdre déformé par du bruit
function rockGeo(v){const g=new THREE.IcosahedronGeometry(1,3);const p=g.attributes.position;const tmp=new THREE.Vector3();for(let i=0;i<p.count;i++){tmp.fromBufferAttribute(p,i);const n=fbm(tmp.x*1.6+v*7,tmp.z*1.6+tmp.y*1.3+v*3);const k=1+n*.38+Math.max(0,tmp.y)*-.15;tmp.multiplyScalar(k);if(tmp.y<-.3)tmp.y=-.3+(tmp.y+.3)*.3;p.setXYZ(i,tmp.x,tmp.y,tmp.z);}g.computeVertexNormals();return g;}
function makeTerrainMat(c){
  const nrm=GFX.tex.grassN||GFX.tex.rock.normal;const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,normalMap:nrm});m.normalScale.set(.9,.9);
  const RK=rockOf(c);const U={tGrass:{value:GFX.tex.grass||grassDetail},tRock:{value:RK.set.map},tRockN:{value:RK.set.normal},tDirt:{value:trailDirt.map},tDirtN:{value:trailDirt.normal},uRock:{value:RK.photo?new THREE.Color(.6,.6,.6).multiplyScalar(RK.tint):lin(c.pal.rock)},uSnow:{value:0},uWet:{value:0},uPhoto:{value:GFX.tex.grass?1:0}};
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nattribute vec3 aSplat;varying vec3 vSplat;varying vec3 vWPos;varying vec3 vWN;")
      .replace("#include <begin_vertex>","#include <begin_vertex>\nvSplat=aSplat;vWPos=(modelMatrix*vec4(position,1.)).xyz;vWN=normalize(mat3(modelMatrix)*normal);");
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>",["#include <common>","uniform sampler2D tGrass,tRock,tRockN,tDirt,tDirtN;uniform vec3 uRock;uniform float uSnow,uWet,uPhoto;varying vec3 vSplat;varying vec3 vWPos;varying vec3 vWN;float wR,wS,wD;vec2 uvG;",
      "vec3 tri(sampler2D t,vec3 p,vec3 n,float s){vec3 b=abs(n);b/=(b.x+b.y+b.z);return texture2D(t,p.zy*s).rgb*b.x+texture2D(t,p.xz*s).rgb*b.y+texture2D(t,p.xy*s).rgb*b.z;}"].join("\n"))
      .replace("#include <map_fragment>",[
      "uvG=vWPos.xz*.085;vec3 g=mix(texture2D(tGrass,uvG).rgb,texture2D(tGrass,vWPos.xz*.019+.3).rgb,.45);float gl=dot(g,vec3(.3,.59,.11));",
      "vec3 grass=mix(vec3(gl)*2.2,g*1.15,.25)*vColor.rgb*mix(4.2,2.2,uPhoto);",
      "float nz=texture2D(tRock,vWPos.xz*.013).r;float slope=1.-clamp(vWN.y,0.,1.);",
      "wR=clamp(smoothstep(.5,.72,vSplat.x+(nz-.5)*.7)+smoothstep(.55,.78,slope+(nz-.5)*.3),0.,1.);",
      "wD=smoothstep(.15,.85,vSplat.z+(nz-.5)*.6)*(1.-wR);",
      "wS=max(smoothstep(.4,.7,vSplat.y+(nz-.5)*.4),uSnow*smoothstep(.95,.55,slope+(nz-.5)*.35));",
      "vec3 rock=tri(tRock,vWPos,vWN,.16)*uRock*1.7;vec3 dirt=texture2D(tDirt,vWPos.xz*.28).rgb;",
      "vec3 col=mix(mix(grass,dirt,wD),rock,wR);col=mix(col,vec3(.9,.92,.96),wS);col*=1.-uWet*.32*(1.-wS);diffuseColor.rgb=col;"].join("\n"))
      .replace("#include <roughnessmap_fragment>","float roughnessFactor=clamp(mix(mix(.96,.82,wR),.5,wS)-uWet*.25*(1.-wS),.55,1.);")
      .replace("#include <normal_fragment_maps>",[
      "vec3 nG=texture2D(normalMap,uvG).xyz*2.-1.;vec3 b3=abs(vWN);b3/=(b3.x+b3.y+b3.z);",
      "vec3 nRk=(texture2D(tRockN,vWPos.zy*.16).xyz*b3.x+texture2D(tRockN,vWPos.xz*.16).xyz*b3.y+texture2D(tRockN,vWPos.xy*.16).xyz*b3.z)*2.-1.;",
      "vec3 nDt=texture2D(tDirtN,vWPos.xz*.28).xyz*2.-1.;vec3 mapN=normalize(mix(mix(nG,nDt,wD),nRk,wR)+vec3(0.,0.,wS*3.));mapN.xy*=normalScale;",
      "normal=perturbNormal2Arb(-vViewPosition,normal,mapN,faceDirection);"].join("\n"));};
  m.userData.U=U;return m;}
function placeOnTrail(obj,s,d,dy){samp(s);obj.position.set(SP.x+SP.rx*d,SP.y+(dy||0),SP.z+SP.rz*d);obj.rotation.set(0,heading(),0);}

// étape de construction : affiche où on en est et rend la main au navigateur
function buildStep(label){GFX.stepLabel=label;GFX.steps.push([label,performance.now()]);const ld=document.getElementById("loading");if(ld&&!ld.querySelector("button"))ld.textContent="Balisage du sentier · "+C.name+" · "+label+"…";return new Promise(r=>setTimeout(r,16));}
async function buildWorld(c){
  if(world){scene.remove(world);disposeTree(world);}
  C=c;L=c.L;RAVITO=Math.round(L/2/10)*10;ALT0=c.alt0;GFX.steps=[];await buildStep("Tracé");buildTrack();
  world=new THREE.Group();scene.add(world);treeMeshes=[];clouds=[];
  const R0=mulberry32(2024+c.id.length*97);
  await buildStep("Relief");
  // --- terrain : herbe photo, roche, terre et neige mêlées dans le shader
  {const STEP=GFX.q==="basse"?3.6:2.6,GZ0=150,GZ1=-(L+290);const XS=[];for(let x=-170;x<=170;x+=STEP)XS.push(x);let dx=STEP,xr=XS[XS.length-1],xl=XS[0];while(xr<560){dx=Math.min(dx*1.12,18);xr+=dx;xl-=dx;XS.push(xr);XS.unshift(xl);}
    const cols=XS.length,rows=Math.floor((GZ0-GZ1)/STEP)+1,N=cols*rows;const pos=new Float32Array(N*3),col=new Float32Array(N*3),uv=new Float32Array(N*2),spl=new Float32Array(N*3),rels=new Float32Array(N),ads=new Float32Array(N),sides=new Int8Array(N);
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){let x=XS[k],z=GZ0-r*STEP;let t=terrainAt(x,z);if(t.ad>6){x+=(hash2(k,r)-.5)*1.2;z+=(hash2(r+9,k)-.5)*1.2;t=terrainAt(x,z);}const n=r*cols+k;pos[n*3]=x;pos[n*3+1]=t.y;pos[n*3+2]=z;uv[n*2]=x/7;uv[n*2+1]=z/7;rels[n]=t.rel;ads[n]=t.ad;sides[n]=t.d<0?-1:1;}
    const P=c.pal,mA=new THREE.Color(P.mA),mB=new THREE.Color(P.mB),dry=new THREE.Color(P.dry),forest=new THREE.Color(P.forest),cc=new THREE.Color();
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const n=r*cols+k;const x=pos[n*3],z=pos[n*3+2],y=pos[n*3+1];const k1=Math.min(cols-1,k+1);const ny=pos[(Math.min(rows-1,r+1)*cols+k)*3+1],nx=pos[(r*cols+k1)*3+1];const slope=Math.hypot((ny-y)/STEP,(nx-y)/Math.max(.5,XS[k1]-XS[k]||STEP));
      const nz=fbm(x*.04,z*.04),nz2=fbm(x*.15+3,z*.15);const rel=rels[n],ad=ads[n];
      cc.copy(mA).lerp(mB,clamp(nz*.9+.5,0,1));if(nz2>.3)cc.lerp(dry,.4);if(sides[n]>0&&ad>10)cc.lerp(forest,clamp((ad-10)/50,0,.6));cc.convertSRGBToLinear();col[n*3]=cc.r;col[n*3+1]=cc.g;col[n*3+2]=cc.b;
      spl[n*3]=clamp((slope-.95+c.rockBias)*2.5+(rel-c.rockRel-nz*14)/10+c.rockBias*(nz2+.4),0,1);
      spl[n*3+1]=clamp((rel-c.snowRel-nz*24)/8,0,1);
      spl[n*3+2]=ad<3.2?1-Math.max(0,ad)/3.2:0;}
    const index=new Uint32Array((rows-1)*(cols-1)*6);let q=0;for(let r=0;r<rows-1;r++)for(let k=0;k<cols-1;k++){const a=r*cols+k,b=a+1,d=a+cols,e=d+1;index[q++]=a;index[q++]=b;index[q++]=d;index[q++]=b;index[q++]=e;index[q++]=d;}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));g.setAttribute("uv",new THREE.BufferAttribute(uv,2));g.setAttribute("aSplat",new THREE.BufferAttribute(spl,3));g.setIndex(new THREE.BufferAttribute(index,1));g.computeVertexNormals();
    trailDirt=soilOf(c)||makeDirt(c.dirt,c.pebble);terrainMesh=new THREE.Mesh(g,makeTerrainMat(c));terrainMesh.receiveShadow=true;world.add(terrainMesh);}
  await buildStep("Eau");
  // --- fond de vallée, mer ou lac (eau réfléchissante si la qualité le permet)
  const isSea=c.water&&c.water.kind==="sea";seaFixedY=isSea?PY[idx(L)]-20:null;waterObj=null;
  function waterMesh(geo,color){if(QS().water&&THREE.Water&&GFX.tex.water){const w=new THREE.Water(geo,{textureWidth:512,textureHeight:512,waterNormals:GFX.tex.water,sunDirection:SUN_DIR.clone(),sunColor:0xffffff,waterColor:color,distortionScale:2.2,fog:true});w.rotation.x=-Math.PI/2;waterObj=w;return w;}
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:lin(color),roughness:.08,metalness:.5}));m.rotation.x=-Math.PI/2;return m;}
  if(isSea){valley=waterMesh(new THREE.PlaneGeometry(6000,6000),c.water.color);}else{valley=new THREE.Mesh(new THREE.PlaneGeometry(5000,5000),new THREE.MeshStandardMaterial({color:lin(c.pal.forest),roughness:1}));valley.rotation.x=-Math.PI/2;}
  world.add(valley);
  if(c.water&&c.water.kind==="lake"){samp(60);const lake=waterMesh(new THREE.CircleGeometry(150,48),c.water.color);lake.position.set(SP.x+SP.rx*185,SP.y-26,SP.z+SP.rz*185);world.add(lake);decorWater=lake;}
  // --- sentier : terre tassée et cailloux en relief
  trailMaps={dry:trailDirt.map,dryN:trailDirt.normal,snow:dirtTex(c.dirt,c.pebble,true)};

  {const D=[-W-1.2,-W-.35,-W*.5,0,W*.5,W+.35,W+1.2],Y=[-.36,.04,.09,.11,.09,.04,-.36];const pos=[],uv=[],col=[],index=[];const edge=new THREE.Color(0x8a7a58),mid=new THREE.Color(0xffffff),cc=new THREE.Color();let rows=0;
    for(let s=S0+2;s<=S1-2;s+=.75){samp(s);for(let k=0;k<D.length;k++){pos.push(SP.x+SP.rx*D[k],SP.y+Y[k],SP.z+SP.rz*D[k]);uv.push((D[k]+W+1.2)/(2*W+2.4)*3.4,s/2.2);cc.copy(k===0||k===D.length-1?edge:mid);cc.multiplyScalar(.9+fbm(s*.08,k*1.3)*.15);col.push(cc.r,cc.g,cc.b);}rows++;}
    const n=D.length;for(let r=0;r<rows-1;r++)for(let k=0;k<n-1;k++){const a=r*n+k,b=a+1,cc2=a+n,d=cc2+1;index.push(a,b,cc2,b,d,cc2);}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));g.setIndex(index);g.computeVertexNormals();
    trailMesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:trailMaps.dry,normalMap:trailMaps.dryN,vertexColors:true,roughness:.93}));trailMesh.material.normalScale.set(1.2,1.2);trailMesh.userData.tint=(PHOTO[c.id]&&PHOTO[c.id].soil==='calcaire')?.74:1;trailMesh.material.color.setScalar(trailMesh.userData.tint);trailMesh.receiveShadow=true;world.add(trailMesh);}
  await buildStep("Herbe");
  // --- herbes : touffes fines qui ondulent au vent
  {const tex=canvasTex(256,(x,n)=>{x.clearRect(0,0,n,n);const R=mulberry32(3);for(let i=0;i<110;i++){const bx=n*.5+(R()-.5)*n*.85,h=n*(.35+R()*.6),bend=(R()-.5)*70;const g=120+R()*110|0;
      x.strokeStyle="rgb("+(g*.62|0)+","+g+","+(g*.3|0)+")";x.lineWidth=1.2+R()*2.2;x.beginPath();x.moveTo(bx,n);x.quadraticCurveTo(bx+bend*.25,n-h*.55,bx+bend,n-h);x.stroke();}
      const fl=["#f4f1e8","#f2c230","#a76bd6","#e8577a","#5b8bd6"];for(let i=0;i<4;i++){x.fillStyle=fl[(R()*fl.length)|0];x.beginPath();x.arc(n*.2+R()*n*.6,n*(.12+R()*.35),3+R()*2.5,0,7);x.fill();}});
    tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;const a=new THREE.PlaneGeometry(1,1).translate(0,.5,0),b=a.clone().rotateY(Math.PI/2),e=a.clone().rotateY(Math.PI/4);const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.Float32BufferAttribute([...a.attributes.position.array,...b.attributes.position.array,...e.attributes.position.array],3));geo.setAttribute("uv",new THREE.Float32BufferAttribute([...a.attributes.uv.array,...b.attributes.uv.array,...e.attributes.uv.array],2));
    const up=[];for(let i=0;i<12;i++)up.push(0,1,0);geo.setAttribute("normal",new THREE.Float32BufferAttribute(up,3));geo.setIndex([0,2,1,2,3,1,4,6,5,6,7,5,8,10,9,10,11,9]);a.dispose();b.dispose();e.dispose();
    const COUNT=Math.round(QS().grass*.7*(c.rockBias>.3?.45:1));const mat=new THREE.MeshStandardMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide,roughness:1});windShader(mat,.12,0);
    const mesh=new THREE.InstancedMesh(geo,mat,COUNT);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),up3=new THREE.Vector3(0,1,0),cc=new THREE.Color();const hsl={};new THREE.Color(c.pal.mB).getHSL(hsl);
    for(let n=0;n<COUNT;n++){const s=R0()*(L+120)-40;samp(s);const side=R0()<.5?-1:1;const far=R0()<.4;const d=side*(W+.1+(far?1.2+Math.pow(R0(),1.6)*6:R0()*1.4));const x=SP.x+SP.rx*d,z=SP.z+SP.rz*d;const y=groundY(x,z);const k=.28+R0()*.42;
      sc.set(k*1.2,k*(c.id==="paysbasque"?1.7:1)*(.8+R0()*.5),k*1.2);q.setFromAxisAngle(up3,R0()*6.28);p.set(x,y-.03,z);m.compose(p,q,sc);mesh.setMatrixAt(n,m);
      cc.setHSL(hsl.h+(R0()-.5)*.07-(c.id==="paysbasque"&&R0()<.4?.14:0),.38+R0()*.12,.5+R0()*.25);mesh.setColorAt(n,cc);}
    grassMesh=mesh;world.add(mesh);}
  await buildStep("Arbres");
  // --- arbres : rameaux d'aiguilles ou feuillage sur cartes, balancés par le vent
  {const types=c.trees.type==="mixed"?["fir","broad"]:[c.trees.type];const per=Math.round(c.trees.count*QS().trees/types.length);
    for(const ty of types){const photo=ty==="fir"&&!!GFX.tex.spruce;const T=photo?spruceCards():treeCards(ty);const fol=new THREE.MeshStandardMaterial({map:photo?GFX.tex.spruce:ty==="fir"?GFX.tex.needles:GFX.tex.leaves,alphaTest:.4,side:THREE.DoubleSide,roughness:.9,color:lin(ty==="pine"?0x8a9468:ty==="broad"?0xa4b08a:0xffffff)});windShader(fol,.004,1.5,ty==="fir"&&!photo);
      const bark=new THREE.MeshStandardMaterial({color:lin(0x5a4330),roughness:.95,map:GFX.tex.rock.map,normalMap:GFX.tex.rock.normal});
      const mF=new THREE.InstancedMesh(T.foliage,fol,per),mT=new THREE.InstancedMesh(T.trunk,bark,per);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),cc=new THREE.Color(),e=new THREE.Euler();let n=0,tries=0;const base=[];
      while(n<per&&tries<per*20){tries++;const s=R0()*(L+260)-60;samp(s);const side=R0()<.62?1:-1;const d=side*(W+3.4+Math.pow(R0(),1.5)*150);const x=SP.x+SP.rx*d,z=SP.z+SP.rz*d;if(fbm(x*.03,z*.03)<-.1)continue;const t=terrainAt(x,z);if(t.ad<2.8||t.rel>c.trees.maxRel)continue;
        const k=.75+R0()*.85;sc.set(k,k*(.85+R0()*.4),k);e.set((R0()-.5)*.05,R0()*6.28,(R0()-.5)*.05);q.setFromEuler(e);p.set(x,t.y-.2,z);m.compose(p,q,sc);mF.setMatrixAt(n,m);mT.setMatrixAt(n,m);if(photo)cc.setHSL(.25,.12+R0()*.1,.62+R0()*.3);else if(ty==="fir")cc.setHSL(.28+R0()*.05,.25+R0()*.15,.5+R0()*.25);else cc.setHSL(.24+R0()*.08,.3+R0()*.2,.55+R0()*.3);mF.setColorAt(n,cc);base.push(cc.r,cc.g,cc.b);n++;}
      mF.count=mT.count=n;mF.receiveShadow=mT.receiveShadow=true;mF.userData.base=base;world.add(mF);if(!photo)world.add(mT);treeMeshes.push(mF);}}
  await buildStep("Rochers");
  // --- rochers sculptés (relief irrégulier, texture de roche)
  {const variants=[0,1,2,3].map(v=>rockGeo(v));const RK=rockOf(c);const mat=new THREE.MeshStandardMaterial({color:RK.photo?new THREE.Color(1,1,1).multiplyScalar(RK.tint):lin(c.pal.rock),map:RK.set.map,normalMap:RK.set.normal,roughness:.9});const COUNT=Math.round(700*(1+Math.max(0,c.rockBias)*1.5));const per=Math.ceil(COUNT/4);
    variants.forEach(geo=>{const mesh=new THREE.InstancedMesh(geo,mat,per);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),e=new THREE.Euler(),cc=new THREE.Color();
      for(let i=0;i<per;i++){const s=R0()*(L+240)-60;samp(s);const side=R0()<.5?1:-1;const near=R0()<.45;const d=side*(near?W+1.4+R0()*3:W+4+R0()*120);const x=SP.x+SP.rx*d,z=SP.z+SP.rz*d;const t=terrainAt(x,z);const k=near?.25+R0()*.5:.5+R0()*2.6;
        sc.set(k*(1+R0()*.5),k*(.55+R0()*.4),k*(1+R0()*.5));e.set((R0()-.5)*.4,R0()*6.28,(R0()-.5)*.4);q.setFromEuler(e);p.set(x,t.y+k*.1,z);m.compose(p,q,sc);mesh.setMatrixAt(i,m);cc.setScalar(.8+R0()*.35);mesh.setColorAt(i,cc);}
      mesh.receiveShadow=true;mesh.castShadow=false;world.add(mesh);});}

  await buildStep("Montagnes");
  // --- toile de fond photo (panorama détouré sur un cylindre qui suit la caméra)
  panoObj=null;const PH=PHOTO[c.id]||{};const pt=PH.pano&&GFX.tex.pano&&GFX.tex.pano[PH.pano];
  if(pt){const Rr=1700,rep=4,Hh=2*Math.PI*Rr/rep/3;const t=pt.clone();t.needsUpdate=true;t.repeat.set(rep,1);
    const g=new THREE.CylinderGeometry(Rr,Rr,Hh,96,1,true);g.translate(0,Hh/2-90,0);
    panoObj=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,transparent:true,fog:false,depthWrite:false,alphaTest:.02}));panoObj.renderOrder=-1;panoObj.rotation.y=Math.PI*.25;world.add(panoObj);}
  if(!pt)  // --- massifs lointains
  {const pk=c.peaks;const g=pk.round?new THREE.SphereGeometry(1,40,16,0,Math.PI*2,0,Math.PI/2):new THREE.ConeGeometry(1,1,40,16);if(!pk.round)g.translate(0,.5,0);const p=g.attributes.position;const col=[];const rock=new THREE.Color(pk.col),snow=new THREE.Color(0xf4f6f9),haze=new THREE.Color(0x9fb4c8),cc=new THREE.Color();
    for(let i=0;i<p.count;i++){const y=p.getY(i);const a=Math.atan2(p.getZ(i),p.getX(i));let n=0;if(y<.97&&y>.01){n=fbm(Math.cos(a)*2.2+y*3,Math.sin(a)*2.2+y*2.5);const r=1+n*(pk.round?.18:.55);p.setX(i,p.getX(i)*r);p.setZ(i,p.getZ(i)*r);p.setY(i,y+n*.06);}
      cc.copy(rock).multiplyScalar(.8+n*.5);if(pk.snow&&y>1-pk.snow+n*.18)cc.copy(snow);if(pk.crater&&y>.92)cc.multiplyScalar(.6);cc.lerp(haze,.3);cc.convertSRGBToLinear();col.push(cc.r,cc.g,cc.b);}
    g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
    const COUNT=64;const mesh=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}),COUNT);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),pp=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
    for(let i=0;i<COUNT;i++){const s=-260+(i/2|0)*((L+700)/(COUNT/2))+R0()*40;samp(clamp(s,S0,S1));const side=i%2?1:-1;const d=side*(620+R0()*520);const h=(side<0?520+R0()*520:380+R0()*420)*pk.h;const r=Math.min(h*(pk.round?1.6:.6+R0()*.3),Math.abs(d)*.5);
      pp.set(SP.x+SP.rx*d,SP.y+(side<0?40:-190)*(pk.round?.5:1),SP.z+SP.rz*d+(s<S0?s-S0:0));q.setFromAxisAngle(up,R0()*6);sc.set(r,h,r);m.compose(pp,q,sc);mesh.setMatrixAt(i,m);}
    world.add(mesh);}
  await buildStep("Ciel");
  // --- nuages : sprites vaporeux
  cloudMat=new THREE.SpriteMaterial({map:GFX.tex.cloud,transparent:true,depthWrite:false,fog:false,opacity:.9});
  for(let i=0;i<22;i++){const sp=new THREE.Sprite(cloudMat);const sz=160+R0()*220;sp.scale.set(sz*1.8,sz*.7,1);samp(R0()*L);sp.position.set(SP.x+(R0()-.5)*1400,SP.y+170+R0()*200,SP.z-200+(R0()-.5)*900);sp.userData.v=1.5+R0()*2.5;world.add(sp);clouds.push(sp);}

  await buildStep("Décor et spectateurs");
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
  {const zones=[[-30,25,40],[RAVITO-40,RAVITO+12,26],[L-140,L+40,70]];const list=[];const fq={haute:1,moyenne:.6,basse:.35}[GFX.q]||1;
    for(const z of zones)for(let i=0;i<Math.round(z[2]*fq);i++){const s=lerp(z[0],z[1],R0());samp(s);const side=R0()<.6?-1:1;const d=side*(W+1.6+R0()*3.4);const x=SP.x+SP.rx*d,zz=SP.z+SP.rz*d;const t=terrainAt(x,zz);list.push({x:x,y:t.y,z:zz,ph:R0()*6,sp:4+R0()*5,c:R0()});}
    let shirtGeo,restGeo;const baked=GFX.q==="basse"?false:bakeSpectator();
    if(baked){shirtGeo=baked.cloth;restGeo=baked.skin;}else{const armG=sd=>new THREE.CylinderGeometry(.045,.04,.55,8).translate(0,.27,0).rotateZ(sd*.5).translate(sd*.19,1.28,0);
    shirtGeo=mergeColored([{geo:new THREE.CylinderGeometry(.17,.15,.56,12).scale(1,1,.65).translate(0,1.12,0),color:0xffffff},{geo:new THREE.SphereGeometry(.17,12,6,0,Math.PI*2,0,Math.PI/2).scale(1,.4,.65).translate(0,1.4,0),color:0xffffff},{geo:armG(-1),color:0xffffff},{geo:armG(1),color:0xffffff}]);
    restGeo=mergeColored([{geo:new THREE.SphereGeometry(.11,14,10).translate(0,1.6,0),color:0xd9a07a},{geo:new THREE.SphereGeometry(.117,14,10,0,Math.PI*2,0,Math.PI*.5).translate(0,1.62,.01),color:0x3a2618},{geo:new THREE.CylinderGeometry(.065,.05,.84,8).translate(-.08,.42,0),color:0x2b3442},{geo:new THREE.CylinderGeometry(.065,.05,.84,8).translate(.08,.42,0),color:0x2b3442},{geo:new THREE.SphereGeometry(.04,8,6).translate(-.47,1.72,0),color:0xd9a07a},{geo:new THREE.SphereGeometry(.04,8,6).translate(.47,1.72,0),color:0xd9a07a}]);}
    const body=new THREE.InstancedMesh(shirtGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,flatShading:!!baked}),list.length),head=new THREE.InstancedMesh(restGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65,flatShading:!!baked}),list.length);body.castShadow=head.castShadow=!baked;
    const pal=[0xd6392b,0x2d6fb8,0xf2c230,0x2c9c6a,0xf4f1e8,0x8a4fb8,0xff8a3d,0x1f2f4a],cc=new THREE.Color();list.forEach((f,i)=>{cc.set(pal[Math.floor(f.c*pal.length)]);body.setColorAt(i,cc);cc.setRGB(1,1,1);if(baked)cc.setHSL(.06,.38+f.c*.2,.22+((f.c*7)%1)*.38);head.setColorAt(i,cc);});
    world.add(body);world.add(head);fans={list:list,body:body,head:head};}
}
// spectateur : le personnage animé figé en pose de repos, découpé en vêtements (teintés) et peau
let BAKED=null;
function bakeSpectator(){if(BAKED!==null)return BAKED;BAKED=false;const X=prepXbot();if(!X)return false;
  const inner=THREE.SkeletonUtils.clone(GFX.xbot.scene);const mx=new THREE.AnimationMixer(inner);const idle=GFX.xbot.animations.find(a=>a.name==="idle");if(idle){mx.clipAction(idle).play();mx.update(.6);}
  const k=1.72/X.H;inner.scale.setScalar(k);inner.position.y=-X.minY*k;inner.updateMatrixWorld(true);const cl={p:[],n:[],c:[]},sk={p:[],n:[],c:[]};const v=new THREE.Vector3(),nv=new THREE.Vector3();
  const pants=lin(0x2b3442),shoe=lin(0x3a3a3a),white=new THREE.Color(1,1,1);let mi=0;
  inner.traverse(o=>{if(!o.isSkinnedMesh)return;o.skeleton.update();const reg=X.regions[X.names.indexOf(o.name)]||X.regions[0];const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;
    // index des sommets d'origine pour retrouver la zone de chaque sommet
    const src=o.geometry.index?o.geometry.index.array:null;const p=g.attributes.position;
    for(let t=0;t<p.count;t+=3){let skin=true;const tri=[];for(let q=0;q<3;q++){const vi=t+q;const oi=src?src[vi]:vi;const r=reg[oi];if(r!==0)skin=false;o.boneTransform(oi,v);v.applyMatrix4(o.matrixWorld);tri.push(v.clone(),r);}
      const A=tri[0],B=tri[2],Cc=tri[4];nv.subVectors(B,A).cross(new THREE.Vector3().subVectors(Cc,A)).normalize();const T=skin?sk:cl;
      for(let q=0;q<3;q++){const P=tri[q*2],r=tri[q*2+1];T.p.push(P.x,P.y,P.z);T.n.push(nv.x,nv.y,nv.z);const c=skin?white:(r===2?pants:r>=3?shoe:white);T.c.push(c.r,c.g,c.b);}}mi++;});
  // simplification par regroupement de sommets (grille de 3,5 cm) : ~10 fois moins de triangles
  const simplify=(T,cell)=>{const key=new Map(),rep=[],out={p:[],n:[],c:[]};const id=(i)=>{const x=Math.round(T.p[i*3]/cell),y=Math.round(T.p[i*3+1]/cell),z=Math.round(T.p[i*3+2]/cell);const k=x+","+y+","+z;let r=key.get(k);if(r===undefined){r=rep.length/1;key.set(k,r);rep.push(i);}return r;};
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c2=new THREE.Vector3(),n=new THREE.Vector3();const seen=new Set();
    for(let t=0;t<T.p.length/9;t++){const i0=t*3,k0=id(i0),k1=id(i0+1),k2=id(i0+2);if(k0===k1||k1===k2||k0===k2)continue;const sk=[k0,k1,k2].sort().join("_");if(seen.has(sk))continue;seen.add(sk);
      const R3=[rep[k0],rep[k1],rep[k2]];a.fromArray(T.p,R3[0]*3);b.fromArray(T.p,R3[1]*3);c2.fromArray(T.p,R3[2]*3);n.subVectors(b,a).cross(c2.clone().sub(a)).normalize();
      for(const r of R3){out.p.push(T.p[r*3],T.p[r*3+1],T.p[r*3+2]);out.n.push(n.x,n.y,n.z);out.c.push(T.c[i0*3],T.c[i0*3+1],T.c[i0*3+2]);}}return out;};
  const mk=T0=>{const T=simplify(T0,.035);const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(T.p,3));g.setAttribute("color",new THREE.Float32BufferAttribute(T.c,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(T.n,3));g.rotateY(Math.PI);return g;};
  BAKED={cloth:mk(cl),skin:mk(sk)};BAKED.tris=(BAKED.cloth.attributes.position.count+BAKED.skin.attributes.position.count)/3;return BAKED;}
const _m=new THREE.Matrix4();
function animFans(t,near){const L2=fans.list;for(let i=0;i<L2.length;i++){const f=L2[i];const cheer=near(f)?Math.abs(Math.sin(t*f.sp+f.ph))*.22:0;_m.makeRotationY(f.ph);_m.setPosition(f.x,f.y+cheer,f.z);fans.body.setMatrixAt(i,_m);fans.head.setMatrixAt(i,_m);}fans.body.instanceMatrix.needsUpdate=true;fans.head.instanceMatrix.needsUpdate=true;}
