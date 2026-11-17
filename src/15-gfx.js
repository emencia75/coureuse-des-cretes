/* ================= Rendu réaliste : qualité, ciel, textures, post-traitement ================= */
const QUALITY={
  haute:{label:"Haute",post:true,bloom:true,shadow:2048,grass:16000,trees:1,water:true,pr:2},
  moyenne:{label:"Moyenne",post:true,bloom:false,shadow:1024,grass:8000,trees:.7,water:true,pr:1.5},
  basse:{label:"Basse",post:false,bloom:false,shadow:512,grass:2000,trees:.35,water:false,pr:1},
};
const GFX={steps:[],stepLabel:"",q:"haute",time:{value:0},xbot:null,tex:{},sky:null,envRT:null,composer:null,bloom:null,grade:null,fxaa:null};
// téléphones et Firefox démarrent en qualité basse (Firefox coupe WebGL après une surcharge de la carte graphique)
const TOUCHDEV=(window.matchMedia&&window.matchMedia("(pointer: coarse)").matches)||/Firefox\//.test(navigator.userAgent);
try{const q=localStorage.getItem("cdc-quality");GFX.q=QUALITY[q]?q:(TOUCHDEV?"basse":"moyenne");}catch(e){GFX.q=TOUCHDEV?"basse":"moyenne";}
const QS=()=>QUALITY[GFX.q];

// --- bruit périodique (textures sans couture)
function pnoise(x,y,P){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const m=k=>((k%P)+P)%P;
  const a=hash2(m(xi),m(yi)),b=hash2(m(xi+1),m(yi)),c=hash2(m(xi),m(yi+1)),d=hash2(m(xi+1),m(yi+1));return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function pfbm(x,y,P,oct){let s=0,a=.5,f=1,n=0;for(let i=0;i<oct;i++){s+=pnoise(x*f,y*f,P*f)*a;n+=a;a*=.5;f*=2;}return s/n;}
// carte de normales à partir d'une carte de hauteur (Float32Array size*size)
function normalCanvas(H,size,strength){const cv=document.createElement("canvas");cv.width=cv.height=size;const x=cv.getContext("2d");const img=x.createImageData(size,size);const d=img.data;
  for(let j=0;j<size;j++)for(let i=0;i<size;i++){const l=H[j*size+((i-1+size)%size)],r=H[j*size+((i+1)%size)],u=H[((j-1+size)%size)*size+i],dn=H[((j+1)%size)*size+i];
    let nx=(l-r)*strength,ny=(u-dn)*strength,nz=1;const k=1/Math.hypot(nx,ny,nz);const o=(j*size+i)*4;d[o]=(nx*k*.5+.5)*255;d[o+1]=(ny*k*.5+.5)*255;d[o+2]=(nz*k*.5+.5)*255;d[o+3]=255;}
  x.putImageData(img,0,0);return cv;}
function texOf(cv,srgb){const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=MAXANISO;if(srgb)t.encoding=THREE.sRGBEncoding;return t;}
// roche : strates, fissures et grain
function makeRock(){const S=512,H=new Float32Array(S*S);const cv=document.createElement("canvas");cv.width=cv.height=S;const x=cv.getContext("2d");const img=x.createImageData(S,S),d=img.data;
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=i/S*8,v=j/S*8;const n=pfbm(u,v,8,5);const cr=Math.abs(pfbm(u*1.7+3,v*1.7,13.6,3)-.5);const crack=Math.max(0,1-cr*14);const strata=.5+.5*Math.sin(v*6+n*5);
    const h=n*.8+strata*.15-crack*.35;H[j*S+i]=h;const g=.42+n*.42+strata*.06-crack*.22;const o=(j*S+i)*4;d[o]=g*255*1.02;d[o+1]=g*255;d[o+2]=g*255*.96;d[o+3]=255;}
  x.putImageData(img,0,0);return{map:texOf(cv,true),normal:texOf(normalCanvas(H,S,9),false)};}
// terre du sentier : sol tassé et cailloux
function makeDirt(base,pebble){const S=512,H=new Float32Array(S*S);const cv=document.createElement("canvas");cv.width=cv.height=S;const x=cv.getContext("2d");const img=x.createImageData(S,S),d=img.data;const bc=new THREE.Color(base),pc=new THREE.Color(pebble||"#9a948a");
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=i/S*6,v=j/S*6;const n=pfbm(u,v,6,5);const f=pfbm(u*4,v*4,24,2);H[j*S+i]=n*.3+f*.15;const k=.72+n*.45+f*.12;const o=(j*S+i)*4;d[o]=Math.min(255,bc.r*255*k);d[o+1]=Math.min(255,bc.g*255*k);d[o+2]=Math.min(255,bc.b*255*k);d[o+3]=255;}
  const R=mulberry32(77);
  for(let s=0;s<900;s++){const cx0=R()*S,cy0=R()*S,r=1+Math.pow(R(),2.6)*6,k=.55+R()*.35,ang=R()*3;
    for(let j=-r-1;j<=r+1;j++)for(let i=-r*1.3-1;i<=r*1.3+1;i++){const rx=(i*Math.cos(ang)+j*Math.sin(ang))/1.3,ry=-i*Math.sin(ang)+j*Math.cos(ang);const q=(rx*rx+ry*ry)/(r*r);if(q>1)continue;
      const px=((Math.round(cx0+i))%S+S)%S,py=((Math.round(cy0+j))%S+S)%S;const hh=Math.sqrt(1-q);const id=py*S+px;H[id]=Math.max(H[id],.35+hh*.5*(r/8));const o=id*4;const sh=.75+.3*(1-(rx+ry)/(r*2));
      d[o]=pc.r*255*k*sh;d[o+1]=pc.g*255*k*sh;d[o+2]=pc.b*255*k*sh;}}
  x.putImageData(img,0,0);return{map:texOf(cv,true),normal:texOf(normalCanvas(H,S,7),false)};}
// carte de rameaux d'aiguilles (cartes de feuillage des sapins)
function makeNeedles(){return textTex(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);const R=mulberry32(9);
  const twig=(x0,y0,ang,len,th,depth)=>{const x1=x0+Math.cos(ang)*len,y1=y0+Math.sin(ang)*len;
    const pw=Math.max(3,len*.09);x.fillStyle="rgba(30,58,30,.92)";x.beginPath();x.moveTo(x0,y0);x.lineTo(x0+Math.cos(ang+1.4)*pw,y0+Math.sin(ang+1.4)*pw);x.lineTo(x1,y1);x.lineTo(x0+Math.cos(ang-1.4)*pw,y0+Math.sin(ang-1.4)*pw);x.closePath();x.fill();x.strokeStyle="rgba(58,40,26,.95)";x.lineWidth=th;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();
    const n=Math.floor(len/2.2);for(let i=0;i<n;i++){const t=i/n,px=x0+(x1-x0)*t,py=y0+(y1-y0)*t;const nl=(4+R()*5)*(1-t*.45)*(depth?1:1.2);for(const sd of[-1,1]){const a=ang+sd*(1.05+R()*.4);const g=R();
      x.strokeStyle="rgba("+(28+g*30|0)+","+(62+g*60|0)+","+(30+g*22|0)+","+(.8+R()*.2)+")";x.lineWidth=.9+R()*.8;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*nl,py+Math.sin(a)*nl);x.stroke();}}
    if(depth>0)for(let t=.15;t<.9;t+=.13+R()*.08){const px=x0+(x1-x0)*t,py=y0+(y1-y0)*t;const sd=R()<.5?-1:1;twig(px,py,ang+sd*(.55+R()*.35),len*(1-t)*(.45+R()*.25),th*.55,depth-1);}};
  twig(0,h*.5,.06,w*.98,4,2);twig(w*.05,h*.42,-.18,w*.6,2.4,1);twig(w*.05,h*.58,.28,w*.62,2.4,1);});}
function makeLeaves(){return textTex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);const R=mulberry32(21);for(let i=0;i<380;i++){const a=R()*6.28,r=Math.sqrt(R())*w*.45;const px=w/2+Math.cos(a)*r,py=h/2+Math.sin(a)*r*.85;const g=70+R()*90|0;
  x.fillStyle="rgba("+(g*.55|0)+","+(g+30)+","+(g*.35|0)+",.95)";x.beginPath();x.ellipse(px,py,5+R()*5,3+R()*3,R()*3,0,7);x.fill();}});}
function makeCloud(){return textTex(256,256,(x,w,h)=>{const img=x.createImageData(w,h),d=img.data;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(i-w/2)/(w/2),dy=(j-h/2)/(h/2);const r=Math.sqrt(dx*dx*.8+dy*dy*1.6);
  const n=pfbm(i/w*4,j/h*4,4,5);const a=Math.max(0,Math.min(1,(1-r)*1.6+(n-.55)*1.8));const o=(j*w+i)*4;const sh=225+n*30;d[o]=sh;d[o+1]=sh;d[o+2]=Math.min(255,sh+6);d[o+3]=a*a*255;}x.putImageData(img,0,0);});}

// --- ciel atmosphérique (Preetham) qui suit la caméra et éclaire la scène
function setupSky(){if(!THREE.Sky)return;const s=new THREE.Sky();s.material.fragmentShader=s.material.fragmentShader.replace("normalize( vWorldPosition - cameraPos )","normalize( vWorldPosition - cameraPosition )");
  s.scale.setScalar(1800);s.material.depthWrite=false;s.renderOrder=-2;scene.add(s);GFX.sky=s;sky.visible=false;GFX.pmrem=new THREE.PMREMGenerator(renderer);}
function skyParams(o){const s=GFX.sky;if(!s)return;const u=s.material.uniforms;u.turbidity.value=o.turb;u.rayleigh.value=o.ray;u.mieCoefficient.value=o.mie;u.mieDirectionalG.value=.8;
  const phi=THREE.MathUtils.degToRad(90-o.elev),th=THREE.MathUtils.degToRad(o.az);SUN_DIR.setFromSphericalCoords(1,phi,th);u.sunPosition.value.copy(SUN_DIR);
  // éclairage d'ambiance : capture du ciel en carte d'environnement
  const sc=new THREE.Scene();const s2=new THREE.Sky();s2.scale.setScalar(1000);s2.material.uniforms=THREE.UniformsUtils.clone(u);sc.add(s2);
  if(GFX.envRT)GFX.envRT.dispose();const tm=renderer.toneMapping;renderer.toneMapping=THREE.NoToneMapping;GFX.envRT=GFX.pmrem.fromScene(sc);renderer.toneMapping=tm;scene.environment=GFX.envRT.texture;s2.geometry.dispose();s2.material.dispose();}

// --- post-traitement : halo, étalonnage cinéma, vignette, anti-crénelage
const GradeShader={uniforms:{tDiffuse:{value:null},exposure:{value:1},saturation:{value:1.08},contrast:{value:1.06},vignette:{value:.22},tint:{value:new THREE.Color(1,1,1)}},
  vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader:["uniform sampler2D tDiffuse;uniform float exposure,saturation,contrast,vignette;uniform vec3 tint;varying vec2 vUv;",
   "vec3 aces(vec3 v){v*=exposure*.48;return clamp((v*(2.51*v+.03))/(v*(2.43*v+.59)+.14),0.,1.);}",
   "void main(){vec3 c=aces(texture2D(tDiffuse,vUv).rgb)*tint;c=pow(c,vec3(1./2.2));float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,saturation);c=(c-.5)*contrast+.5;",
   "float r=length((vUv-.5)*vec2(1.15,1.));c*=1.-vignette*smoothstep(.35,.85,r);gl_FragColor=vec4(clamp(c,0.,1.),1.);}"].join("\n")};
function setupPost(){try{setupPostInner();}catch(e){console.warn(e);GFX.composer=null;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputEncoding=THREE.sRGBEncoding;}}
function setupPostInner(){if(GFX.composer){GFX.composer.dispose&&GFX.composer.dispose();GFX.composer=null;}GFX.bloom=GFX.grade=GFX.fxaa=null;const q=QS();
  const can=q.post&&THREE.EffectComposer&&THREE.RenderPass&&THREE.ShaderPass;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,q.pr));renderer.shadowMap.enabled=true;sun.shadow.mapSize.set(q.shadow,q.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
  if(!can){renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputEncoding=THREE.sRGBEncoding;return;}
  renderer.toneMapping=THREE.NoToneMapping;renderer.outputEncoding=THREE.LinearEncoding;
  const w=window.innerWidth,h=window.innerHeight,pr=renderer.getPixelRatio();const rt=new THREE.WebGLRenderTarget(w*pr,h*pr,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,encoding:THREE.LinearEncoding});
  const c=new THREE.EffectComposer(renderer,rt);c.addPass(new THREE.RenderPass(scene,camera));
  if(q.bloom&&THREE.UnrealBloomPass){GFX.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(w,h),.35,.6,.92);c.addPass(GFX.bloom);}
  GFX.grade=new THREE.ShaderPass(GradeShader);c.addPass(GFX.grade);
  if(THREE.FXAAShader){GFX.fxaa=new THREE.ShaderPass(THREE.FXAAShader);GFX.fxaa.uniforms.resolution.value.set(1/(w*pr),1/(h*pr));c.addPass(GFX.fxaa);}
  GFX.composer=c;}
function renderFrame(){if(GFX.composer){try{GFX.composer.render();return;}catch(e){console.warn(e);GFX.composer=null;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputEncoding=THREE.sRGBEncoding;}}renderer.render(scene,camera);}
function resizePost(){if(!GFX.composer)return;const w=window.innerWidth,h=window.innerHeight,pr=renderer.getPixelRatio();GFX.composer.setSize(w,h);if(GFX.fxaa)GFX.fxaa.uniforms.resolution.value.set(1/(w*pr),1/(h*pr));}

// --- ressources (modèle animé, photos d'herbe, eau) : facultatives, le jeu marche sans
function loadTex(url,srgb){return new Promise(res=>{new THREE.TextureLoader().load(url,t=>{if(DIAG)DIAG.log("OK",url);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=MAXANISO;if(srgb)t.encoding=THREE.sRGBEncoding;res(t);},undefined,()=>{if(DIAG)DIAG.log("ÉCHEC",url);res(null);});});}
// chaque ressource a 15 s pour arriver ; sinon le jeu continue sans elle
const inTime=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(r,ms||15000))]);
function loadAssets(onStep){const jobs=[];
  if(THREE.GLTFLoader)jobs.push(new Promise(res=>new THREE.GLTFLoader().load("assets/xbot.json",g=>{GFX.xbot=g;if(DIAG)DIAG.log("OK","personnage 3D");res();},undefined,e=>{if(DIAG)DIAG.log("ÉCHEC","personnage 3D "+(e&&e.message||""));res();})));
  GFX.tex.photo={};
  for(const n of["auvergne","calcaire"])jobs.push(Promise.all([loadTex("assets/sol-"+n+".jpg",true),loadTex("assets/sol-"+n+"_n.jpg",false)]).then(r=>{if(r[0]&&r[1])GFX.tex.photo["sol-"+n]={map:r[0],normal:r[1]};}));
  jobs.push(Promise.all([loadTex("assets/roche-granite.jpg",true),loadTex("assets/roche-granite_n.jpg",false)]).then(r=>{if(r[0]&&r[1])GFX.tex.photo["roche-granite"]={map:r[0],normal:r[1]};}));
  jobs.push(loadTex("assets/pano-montblanc.webp",true).then(t=>{if(t){t.wrapS=THREE.MirroredRepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;GFX.tex.pano={montblanc:t};}}));
  jobs.push(loadTex("assets/sapin.webp",true).then(t=>{if(t){t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;GFX.tex.spruce=t;}}));
  jobs.push(loadTex("assets/grass.jpg",true).then(t=>GFX.tex.grass=t));jobs.push(loadTex("assets/grass_n.jpg",false).then(t=>GFX.tex.grassN=t));jobs.push(loadTex("assets/waternormals.jpg",false).then(t=>GFX.tex.water=t));
  let n=0;const timed=jobs.map(j=>inTime(j).catch(()=>{}));timed.forEach(j=>j.then(()=>onStep&&onStep(++n,timed.length)));
  return Promise.all(timed).then(()=>{const L=document.getElementById("loading");if(L)L.textContent="Préparation des textures…";
    return new Promise(r=>setTimeout(()=>{GFX.tex.rock=makeRock();GFX.tex.needles=makeNeedles();GFX.tex.leaves=makeLeaves();GFX.tex.cloud=makeCloud();r();},20));});}

// textures du parcours : photo si disponible, sinon procédurale
function soilOf(c){const p=PHOTO[c.id];return(p&&p.soil&&GFX.tex.photo&&GFX.tex.photo["sol-"+p.soil])||null;}
function rockOf(c){const p=PHOTO[c.id]||{};const ph=GFX.tex.photo||{};if(p.rock==="calcaire"&&ph["sol-calcaire"])return{set:ph["sol-calcaire"],photo:true,tint:1};
  if(ph["roche-granite"])return{set:ph["roche-granite"],photo:true,tint:p.rockTint||1};return{set:GFX.tex.rock,photo:false,tint:1};}
