const $=id=>document.getElementById(id);
// mode diagnostic (lien terminé par #debug) : journal à l'écran, sans console
const DIAG=(function(){if(location.hash!=="#debug")return null;const box=document.createElement("div");box.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;max-height:45%;overflow:auto;z-index:99;background:rgba(0,0,0,.85);color:#9f9;font:12px/1.4 monospace;padding:8px;border-radius:4px;white-space:pre-wrap;-webkit-user-select:text;user-select:text";
  const t0=performance.now();const log=(k,m)=>{box.textContent+=((performance.now()-t0)/1000).toFixed(1)+"s "+k+" "+m+"\n";box.scrollTop=1e9;};
  const ow=console.warn,oe=console.error;console.warn=function(){log("AVERT",[].map.call(arguments,String).join(" "));ow.apply(console,arguments);};console.error=function(){log("ERREUR",[].map.call(arguments,String).join(" "));oe.apply(console,arguments);};
  window.addEventListener("error",e=>log("ERREUR",(e.message||"")+" @"+(e.filename||"").split("/").pop()+":"+e.lineno));window.addEventListener("unhandledrejection",e=>log("ERREUR",String(e.reason&&e.reason.message||e.reason)));
  const add=()=>document.body.appendChild(box);document.body?add():document.addEventListener("DOMContentLoaded",add);log("INFO",navigator.userAgent);return{log:log};})();
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash2(x,y){const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h);}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return(a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*2-1;}
function fbm(x,y){return vnoise(x,y)*.6+vnoise(x*2.1+3.1,y*2.1)*.28+vnoise(x*4.3,y*4.3+7.7)*.12;}
function fmtTime(t){if(!isFinite(t))return"—";const m=Math.floor(t/60),s=t-m*60;return m+":"+(s<10?"0":"")+s.toFixed(2);}
function fmtInt(n){return Math.round(n).toLocaleString("fr-FR").replace(/ | /g," ");}
function fmtKm(m,dec){return(m/1000).toFixed(dec==null?2:dec).replace(".",",");}
function ord(n){return n===1?"re":"e";}
function lin(hex){return new THREE.Color(hex).convertSRGBToLinear();}

if(!window.THREE){$("loading").textContent="Impossible de charger le moteur 3D";return;}

const canvas=$("c");
// WebGL : essai normal, puis réglages tolérants ; sinon explication claire (WebGL désactivé dans le navigateur)
let renderer=null;
for(const opt of[{antialias:true,powerPreference:"high-performance"},{antialias:false,powerPreference:"default",failIfMajorPerformanceCaveat:false}]){try{renderer=new THREE.WebGLRenderer(Object.assign({canvas:canvas},opt));break;}catch(e){if(DIAG)DIAG.log("AVERT","WebGL refusé avec "+JSON.stringify(opt));}}
if(!renderer){const ld=$("loading");ld.hidden=false;ld.style.cssText+="flex-direction:column;gap:14px;text-align:center;padding:0 24px";ld.textContent="";
  const t=document.createElement("div");t.textContent="La 3D est désactivée dans ce navigateur";ld.appendChild(t);
  const ff=/Firefox/.test(navigator.userAgent);const m=document.createElement("div");m.style.cssText="font:500 15px/1.5 var(--body);color:#f4f1e8;max-width:58ch;-webkit-user-select:text;user-select:text";
  m.textContent=ff?"Firefox n’autorise pas WebGL sur cet appareil. Dans Firefox : Paramètres › Général › Performances, décochez « Utiliser les paramètres de performance recommandés » puis cochez « Utiliser l’accélération graphique si disponible », et redémarrez Firefox. Si ça ne suffit pas, tapez about:config dans la barre d’adresse et vérifiez que webgl.disabled vaut false. Vous pouvez aussi jouer avec Chrome ou Safari."
    :"Ce navigateur n’autorise pas WebGL. Activez l’accélération matérielle dans ses réglages, ou essayez avec Chrome, Safari ou Firefox à jour.";
  ld.appendChild(m);return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
const MAXANISO=renderer.capabilities.getMaxAnisotropy();
if(DIAG){try{const gl=renderer.getContext();const ext=gl.getExtension("WEBGL_debug_renderer_info");DIAG.log("INFO","WebGL"+(renderer.capabilities.isWebGL2?"2":"1")+" · "+(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER))+" · textures max "+gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));}catch(e){DIAG.log("ERREUR",e.message);}}
const scene=new THREE.Scene();
const FOG=new THREE.Color(0xa9c3db);
scene.background=FOG.clone();
scene.fog=new THREE.FogExp2(FOG.clone(),.0016);
const camera=new THREE.PerspectiveCamera(64,1,.1,2600);
const hemi=new THREE.HemisphereLight(0xcfe0f5,0x4a5530,.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe6c0,1.3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const sc=sun.shadow.camera;sc.left=-20;sc.right=20;sc.top=20;sc.bottom=-20;sc.near=1;sc.far=150;sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;
const SUN_DIR=new THREE.Vector3(-.35,.62,-.55).normalize();
scene.add(sun);scene.add(sun.target);

// Ciel (dégradé recoloré selon la météo)
const sky=(function(){const g=new THREE.SphereGeometry(2000,32,16);g.setAttribute("color",new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3),3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));m.renderOrder=-1;scene.add(m);return m;})();
function setSky(top,hor,low){const p=sky.geometry.attributes.position,col=sky.geometry.attributes.color;const T=new THREE.Color(top),H=new THREE.Color(hor),Lo=new THREE.Color(low),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i)/2000;if(y>0)c.copy(H).lerp(T,Math.pow(y,.55));else c.copy(H).lerp(Lo,Math.min(1,-y*4));col.setXYZ(i,c.r,c.g,c.b);}col.needsUpdate=true;}
const sunDisc=(function(){const cv=document.createElement("canvas");cv.width=cv.height=256;const x=cv.getContext("2d");const g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,"rgba(255,252,240,1)");g.addColorStop(.12,"rgba(255,246,220,1)");g.addColorStop(.25,"rgba(255,236,200,.45)");g.addColorStop(1,"rgba(255,230,190,0)");x.fillStyle=g;x.fillRect(0,0,256,256);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));sp.scale.set(420,420,1);sp.renderOrder=-1;scene.add(sp);return sp;})();

function mergeColored(parts){const pos=[],nor=[],col=[];const c=new THREE.Color();
  for(const p of parts){let g=p.geo.index?p.geo.toNonIndexed():p.geo;const pa=g.attributes.position.array,na=g.attributes.normal.array;c.set(p.color).convertSRGBToLinear();
    for(let i=0;i<pa.length;i++){pos.push(pa[i]);nor.push(na[i]);}for(let i=0;i<pa.length/3;i++)col.push(c.r,c.g,c.b);}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(nor,3));g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));return g;}
function canvasTex(size,draw,srgb){const cv=document.createElement("canvas");cv.width=cv.height=size;draw(cv.getContext("2d"),size);const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=MAXANISO;if(srgb!==false)t.encoding=THREE.sRGBEncoding;return t;}
function textTex(w,h,draw){const cv=document.createElement("canvas");cv.width=w;cv.height=h;draw(cv.getContext("2d"),w,h);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
const FONT="'Big Shoulders Display','Arial Narrow',Impact,sans-serif";
const dotTex=(function(){const cv=document.createElement("canvas");cv.width=cv.height=64;const x=cv.getContext("2d");const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.6,"rgba(255,255,255,.5)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv);})();
// libère tout ce qu'un groupe contient (géométries, matériaux, textures)
function disposeTree(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();const ms=n.material?(Array.isArray(n.material)?n.material:[n.material]):[];for(const m of ms){for(const k of["map","bumpMap","alphaMap"])if(m[k]&&m[k]!==dotTex&&m[k]!==grassDetail)m[k].dispose();m.dispose();}});}
const grassDetail=canvasTex(512,(x,n)=>{x.fillStyle="#d8d8d8";x.fillRect(0,0,n,n);const R=mulberry32(11);
  for(let i=0;i<9000;i++){const v=150+R()*105|0;x.strokeStyle="rgba("+v+","+v+","+v+","+(.35+R()*.4)+")";x.lineWidth=1+R()*1.4;const px=R()*n,py=R()*n,l=3+R()*7,a=-Math.PI/2+(R()-.5)*.9;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}
  for(let i=0;i<260;i++){const v=110+R()*60|0;x.fillStyle="rgba("+v+","+v+","+v+",.35)";x.beginPath();x.arc(R()*n,R()*n,2+R()*7,0,7);x.fill();}});
// marque en toutes lettres sur un aplat (texture d'emplacement sponsor)
function drawWord(x,sp,X,Y,w,h,pad){x.fillStyle=sp.bg;x.fillRect(X,Y,w,h);x.fillStyle=sp.fg;x.textAlign="center";x.textBaseline="middle";
  const fam=sp.italic?"Georgia,'Times New Roman',serif":FONT,wt=sp.italic?"italic 700 ":(sp.lower?"800 ":"900 ");let fs=h*.72;x.font=wt+fs+"px "+fam;while(x.measureText(sp.word).width>w-(pad||h*.4)&&fs>6){fs-=1;x.font=wt+fs+"px "+fam;}x.fillText(sp.word,X+w/2,Y+h/2+fs*.04);}
function wordTex(sp,w,h){return textTex(w,h,(x)=>drawWord(x,sp,0,0,w,h));}
