/* ================= Interface ================= */
const toastEl=$("toast");let toastT=0;const warnEl=$("warn");let warnT=0;
function warn(t){warnEl.textContent=t;warnEl.classList.add("show");warnT=1.8;}
function toast(big,small){toastEl.textContent="";toastEl.append(big);if(small){const s=document.createElement("small");s.textContent=small;toastEl.append(s);}toastEl.classList.add("show");toastT=1.6;}
const trackEl=$("hTrack");let dots=[];
function buildDots(){dots.forEach(d=>d.remove());dots=runners.map(r=>{const d=document.createElement("span");d.className="dot"+(r.isPlayer?" me":"");trackEl.appendChild(d);return d;});}
const pseudoEl=$("pseudo");
function playerName(){const v=pseudoEl.value.trim().replace(/\s+/g," ").slice(0,16);return v||player.name;}
function hexCss(n){return"#"+new THREE.Color(n).getHexString();}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

// --- réglages mémorisés
let cfg={hero:"lina",course:"chamonix",weather:"auto",custom:{}};
try{const s=JSON.parse(localStorage.getItem("cdc-cfg")||"null");if(s&&typeof s==="object")cfg=Object.assign(cfg,s);}catch(e){}
try{pseudoEl.value=localStorage.getItem("cdc-pseudo")||"";}catch(e){}
function saveCfg(){try{localStorage.setItem("cdc-cfg",JSON.stringify(cfg));}catch(e){}}
const heroById=id=>HEROES.find(h=>h.id===id)||HEROES[0];
const courseById=id=>COURSES.find(c=>c.id===id)||COURSES[0];
// météo du jour : la même pour tout le monde, le même jour, sur un parcours donné
function weatherOfDay(c){const d=new Date();const key=d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+c.id;let h=0;for(let i=0;i<key.length;i++)h=(h*31+key.charCodeAt(i))|0;const r=mulberry32(h)();let a=0;for(const k of["beau","pluie","neige","orage"]){a+=c.wx[k];if(r<a)return k;}return"beau";}
function resolvedWeather(){return cfg.weather==="auto"?weatherOfDay(courseById(cfg.course)):cfg.weather;}

// --- onglets
function selectMenuTab(w){[["tabHero","paneHero"],["tabCourse","paneCourse"],["tabBoard","paneBoard"],["tabSponsor","paneSponsor"]].forEach(p=>{const on=p[0]===w;$(p[0]).setAttribute("aria-selected",on);$(p[1]).hidden=!on;});}
$("tabHero").addEventListener("click",()=>selectMenuTab("tabHero"));$("tabCourse").addEventListener("click",()=>selectMenuTab("tabCourse"));$("tabBoard").addEventListener("click",()=>{selectMenuTab("tabBoard");renderBoards();});$("tabSponsor").addEventListener("click",()=>{selectMenuTab("tabSponsor");renderSponsors();});
$("courseCount").textContent=String(COURSES.length);

// --- héros
const STAT_LABELS=[["vit","Vitesse"],["agi","Agilité"],["saut","Saut"],["endu","Endurance"],["robu","Robustesse"]];
function renderHeroGrid(){const g=$("heroGrid");g.textContent="";HEROES.forEach(h=>{const b=el("button","hero");b.type="button";b.setAttribute("aria-pressed",h.id===cfg.hero);b.setAttribute("aria-label",h.name+", "+h.nick);
  const c=(cfg.custom[h.id]&&cfg.custom[h.id].top)||h.look.top;const av=el("span","av",h.name.split(" ").map(w=>w[0]).join(""));av.style.background=hexCss(c);b.append(av,el("span","hn",h.name.split(" ")[0]),el("span","sx",h.sex==="F"?"Femme":"Homme"));
  b.addEventListener("click",()=>selectHero(h.id));g.appendChild(b);});}
function renderHeroDetail(){const h=heroById(cfg.hero);const d=$("heroDetail");d.textContent="";
  const top=el("div");top.append(el("div","nick",h.nick),el("div","full",h.name+" · "+(h.sex==="F"?"coureuse":"coureur")));d.appendChild(top);d.appendChild(el("p",null,h.bio));
  const ab=el("div","ability");ab.append(el("b",null,h.ab.label),el("span",null,h.ab.desc));d.appendChild(ab);
  for(const s of STAT_LABELS){const row=el("div","statrow");row.appendChild(el("span",null,s[1]));const pips=el("div","pips");pips.setAttribute("role","img");pips.setAttribute("aria-label",s[1]+" "+h.stats[s[0]]+" sur 5");for(let i=1;i<=5;i++)pips.appendChild(el("i",i<=h.stats[s[0]]?"on":""));row.appendChild(pips);d.appendChild(row);}
  const card=$("heroCard");card.textContent="";card.append(el("div","k",h.nick),el("div","n",h.name.split(" ")[0]),el("div","c",h.ab.label+" · "+h.ab.desc));
  const gr=heroGear(h,cfg.custom[h.id]);
  renderSpChips("spTop",SPONSORS,gr.top,false,v=>setCustom("spTop",v));renderSpChips("spShoe",SPONSORS.filter(x=>x.shoe),gr.shoe,false,v=>setCustom("spShoe",v));renderSpChips("spCap",SPONSORS,gr.cap,true,v=>setCustom("spCap",v));
  const cu=cfg.custom[h.id]||{};renderSwatches("swTop",TOP_COLORS,cu.top!=null?cu.top:h.look.top,v=>setCustom("top",v));renderSwatches("swShoe",SHOE_COLORS,cu.shoe!=null?cu.shoe:h.look.shoe,v=>setCustom("shoe",v));}
function renderSwatches(id,list,cur,fn){const box=$(id);box.textContent="";list.forEach(c=>{const b=el("button","sw");b.type="button";b.style.background=hexCss(c);b.setAttribute("aria-pressed",c===cur);b.setAttribute("aria-label","Couleur "+hexCss(c));b.addEventListener("click",()=>fn(c));box.appendChild(b);});}
function renderSpChips(id,list,cur,allowNone,fn){const box=$(id);box.textContent="";const opts=(allowNone?[null]:[]).concat(list.map(x=>x.id));
  opts.forEach(v=>{const sp=v&&sponsorById(v);const b=el("button","chip spc");b.type="button";b.setAttribute("aria-pressed",v===cur);if(sp){const sw=el("i");sw.style.background=sp.bg;b.append(sw,sp.name);}else b.textContent="Sans casquette";b.addEventListener("click",()=>fn(v===null?"":v));box.appendChild(b);});}
function setCustom(k,v){const h=heroById(cfg.hero);cfg.custom[h.id]=Object.assign({},cfg.custom[h.id],{[k]:v});saveCfg();setPlayer(h,cfg.custom[h.id]);placeRunner(player);renderHeroGrid();renderHeroDetail();}
function selectHero(id){cfg.hero=id;saveCfg();const h=heroById(id);setPlayer(h,cfg.custom[h.id]);player.s=-1;placeRunner(player);renderHeroGrid();renderHeroDetail();renderSummary();}

// --- parcours et météo
function profileCanvas(c){const cv=document.createElement("canvas");const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=112*dpr;cv.height=44*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
  const keep=C;C=c;const pts=[];for(let i=0;i<=40;i++)pts.push(cyRaw(c.L*i/40));C=keep;
  // échelle commune à tous les parcours : 0 à 200 m de dénivelé
  const top=pts[0];const yOf=v=>4+(top-v)/200*36;x.beginPath();x.moveTo(0,44);pts.forEach((v,i)=>x.lineTo(i/40*112,yOf(v)));x.lineTo(112,44);x.closePath();x.fillStyle="rgba(242,194,48,.22)";x.fill();
  x.beginPath();pts.forEach((v,i)=>i?x.lineTo(i/40*112,yOf(v)):x.moveTo(0,yOf(v)));x.strokeStyle="#f2c230";x.lineWidth=2;x.stroke();cv.setAttribute("role","img");cv.setAttribute("aria-label","Profil : "+c.drop+" m de dénivelé négatif");return cv;}
function renderCourses(){const list=$("courseList");list.textContent="";COURSES.forEach(c=>{const b=el("button","course");b.type="button";b.setAttribute("aria-pressed",c.id===cfg.course);
  const t=el("div");t.append(el("div","cn",c.name),el("div","cw",c.from+" → "+c.to+" · "+c.region),el("div","cs",fmtKm(c.L)+" km · D− "+c.drop+" m · pente moy. "+Math.round(c.drop/c.L*100)+" %"));
  const tags=el("div","tags");c.tags.forEach(tg=>tags.appendChild(el("span",null,tg)));t.appendChild(tags);b.append(t,profileCanvas(c));b.title=c.blurb;b.addEventListener("click",()=>selectCourse(c.id));list.appendChild(b);});}
function renderWeather(){const box=$("weatherChips");box.textContent="";WEATHER_ORDER.forEach(k=>{const b=el("button","chip",k==="auto"?"Météo du jour":WEATHERS[k].label);b.type="button";b.setAttribute("aria-pressed",cfg.weather===k);b.addEventListener("click",()=>selectWeather(k));box.appendChild(b);});
  const c=courseById(cfg.course),w=resolvedWeather();$("weatherNote").textContent=(cfg.weather==="auto"?"Aujourd’hui à "+c.name+" : "+WEATHERS[w].label.toLowerCase()+". ":"")+WEATHERS[w].note;}
function renderSummary(){const h=heroById(cfg.hero),c=courseById(cfg.course);const s=$("summary");s.textContent="";const b1=el("b",null,h.name.split(" ")[0]+" « "+h.nick+" »"),b2=el("b",null,c.name);s.append(b1," sur ",b2," · "+WEATHERS[resolvedWeather()].label+" · "+fmtKm(c.L)+" km");}
let builtCourse=null,builtWeather=null;
function ensureWorld(cb){const c=courseById(cfg.course),w=resolvedWeather();
  if(builtCourse===c.id){if(builtWeather!==w){applyWeather(w);builtWeather=w;}cb&&cb();return;}
  const ld=$("loading");ld.textContent="Balisage du sentier · "+c.name+"…";ld.hidden=false;
  setTimeout(()=>{buildWorld(c);buildHazards();applyWeather(w);builtCourse=c.id;builtWeather=w;resetRace();runners.forEach(placeRunner);ld.hidden=true;cb&&cb();},40);}
function selectCourse(id){cfg.course=id;saveCfg();renderCourses();renderWeather();renderSummary();ensureWorld();if(!$("paneBoard").hidden)renderBoards();}
function selectWeather(k){cfg.weather=k;saveCfg();renderWeather();renderSummary();ensureWorld();}

/* ================= Classement partagé ================= */
// un document par personne : scores/<id> = {v:3, name, courses:{<parcours>:{time,place,falls,hero,weather,at}}}
let db=null,uid=null,boardDocs=[],boardMode="local",lastLocal=null;
function localBoard(){try{const a=JSON.parse(localStorage.getItem("cdc-board3")||"[]");return Array.isArray(a)?a:[];}catch(e){return[];}}
function cleanEntry(name,e,id){if(!e||typeof e.time!=="number"||!isFinite(e.time)||e.time<20||e.time>3600)return null;
  return{id:id||"",name:typeof name==="string"?name.slice(0,16):"?",time:e.time,place:typeof e.place==="number"?e.place:0,falls:typeof e.falls==="number"?e.falls:0,hero:typeof e.hero==="string"?e.hero:"",weather:typeof e.weather==="string"&&WEATHERS[e.weather]?e.weather:""};}
function boardRows(cid){
  if(boardMode==="shared")return boardDocs.map(d=>{const o=d.data;if(!o||o.v!==3||!o.courses||typeof o.courses!=="object")return null;return cleanEntry(o.name,o.courses[cid],d.id);}).filter(Boolean).sort((a,b)=>a.time-b.time).slice(0,10);
  return localBoard().filter(r=>r&&r.course===cid).map(r=>cleanEntry(r.name,r)).filter(Boolean).sort((a,b)=>a.time-b.time).slice(0,10);}
function renderBoard(box,cid){box.textContent="";const rows=boardRows(cid);
  if(!rows.length){box.appendChild(el("div","empty",boardMode==="shared"?"Personne n’a encore franchi l’arche sur ce parcours. Le premier chrono posé ici sera la référence à battre.":"Aucun chrono sur ce parcours pour l’instant. Termine une descente pour inscrire ton temps."));return;}
  const t=el("table");t.innerHTML="<thead><tr><th>#</th><th>Coureur</th><th class=\"r\">Temps</th><th class=\"r\">Place</th><th class=\"r\">Chutes</th></tr></thead>";const tb=el("tbody");
  rows.forEach((r,i)=>{const tr=el("tr");if((boardMode==="shared"&&uid&&r.id===uid)||(boardMode!=="shared"&&lastLocal===r.time))tr.className="me";
    tr.appendChild(el("td","rk",String(i+1)));const nm=el("td","nm",r.name);const hh=HEROES.find(h=>h.id===r.hero);if(hh||r.weather)nm.appendChild(el("small",null,[hh?hh.name.split(" ")[0]+" « "+hh.nick+" »":"",r.weather?WEATHERS[r.weather].label:""].filter(Boolean).join(" · ")));tr.appendChild(nm);
    tr.appendChild(el("td","r num",fmtTime(r.time)));tr.appendChild(el("td","r",r.place?r.place+ord(r.place):"—"));tr.appendChild(el("td","r",String(r.falls)));tb.appendChild(tr);});
  t.appendChild(tb);box.appendChild(t);}
function renderBoards(){const c=courseById(cfg.course);$("boardTitle").textContent="Classement · "+c.name;renderBoard($("boardMenu"),c.id);renderBoard($("boardEnd"),c.id);
  $("boardSrc").textContent=boardMode==="shared"?"Classement partagé avec toutes les personnes qui ouvrent ce jeu. Un meilleur temps par personne et par parcours.":"Classement enregistré dans ce navigateur uniquement.";}
(async function connect(){try{if(!window.claude||typeof window.claude.use!=="function")return;const res=await Promise.all([window.claude.use("db"),window.claude.use("user")]);db=res[0];const u=res[1];
  if(u){try{uid=await u.id();}catch(e){uid=null;}}if(!db)return;boardMode="shared";renderBoards();
  db.collection("scores").limit(500).onSnapshot(snap=>{boardDocs=snap.docs.map(d=>({id:d.id,data:d.data()}));renderBoards();},err=>{boardMode="local";renderBoards();});}catch(e){}})();
async function saveScore(rec){
  const loc=localBoard();const prevLocal=loc.filter(r=>r&&r.course===rec.course).reduce((m,r)=>Math.min(m,r.time||Infinity),Infinity);loc.push(rec);loc.sort((a,b)=>a.time-b.time);try{localStorage.setItem("cdc-board3",JSON.stringify(loc.slice(0,120)));}catch(e){}lastLocal=rec.time;
  if(boardMode==="shared"&&db&&uid){try{const ref=db.doc("scores/"+uid);const snap=await ref.get();const old=snap.exists?snap.data():null;
      const doc=old&&old.v===3&&old.courses&&typeof old.courses==="object"?{v:3,name:old.name,courses:Object.assign({},old.courses)}:{v:3,name:rec.name,courses:{}};
      const prev=cleanEntry(doc.name,doc.courses[rec.course]);const better=!prev||rec.time<prev.time;
      if(better)doc.courses[rec.course]={time:rec.time,place:rec.place,falls:rec.falls,hero:rec.hero,weather:rec.weather,at:Date.now()};
      if(better||doc.name!==rec.name){doc.name=rec.name;await ref.set(doc);}
      return{improved:better,prev:prev?prev.time:null};}catch(e){/* écriture refusée : classement local */}}
  renderBoards();return{improved:rec.time<prevLocal,prev:isFinite(prevLocal)?prevLocal:null};}

/* ================= Sponsors : emplacements et vues ================= */
// un document par personne : impressions/<id> = {v:1, races, counts:{<marque>:n}}
let impDocs=[];
function localImp(){try{const o=JSON.parse(localStorage.getItem("cdc-imp")||"null");return o&&typeof o==="object"&&o.counts?o:{races:0,counts:{}};}catch(e){return{races:0,counts:{}};}}
function impTotals(){const tot={},n={races:0};const add=o=>{if(!o||o.v!==1||!o.counts||typeof o.counts!=="object")return;n.races+=typeof o.races==="number"?o.races:0;for(const sp of SPONSORS){const v=o.counts[sp.id];if(typeof v==="number"&&isFinite(v)&&v>0)tot[sp.id]=(tot[sp.id]||0)+Math.min(v,1e7);}};
  if(boardMode==="shared")impDocs.forEach(d=>add(d.data));else add(Object.assign({v:1},localImp()));return{tot:tot,races:n.races};}
function placementsOf(id){const arches=Object.values(ARCH_SPONSORS).reduce((a,p)=>a+p.filter(x=>x===id).length,0);const heroes=HEROES.filter(h=>(HERO_SPONSORS[h.id]||[]).includes(id)).map(h=>h.name.split(" ")[0]);
  const out=[];if(arches)out.push(arches+" arche"+(arches>1?"s":""));out.push("panneaux");if(heroes.length)out.push("équipe "+heroes.join(", "));if(id==="coca")out.push("canettes au ravito");if(id==="naak")out.push("barres au ravito");return out.join(" · ");}
function renderSponsors(){const box=$("sponsorTable");box.textContent="";const T=impTotals();const t=el("table");t.innerHTML="<thead><tr><th>Marque</th><th>Emplacements</th><th class=\"r\">Vues</th></tr></thead>";const tb=el("tbody");
  SPONSORS.slice().sort((a,b)=>(T.tot[b.id]||0)-(T.tot[a.id]||0)).forEach(sp=>{const tr=el("tr");const td=el("td");const wm=el("span","wm",sp.word);wm.style.background=sp.bg;wm.style.color=sp.fg;if(sp.italic)wm.style.fontStyle="italic";td.appendChild(wm);tr.appendChild(td);
    tr.appendChild(el("td","nm",placementsOf(sp.id)));tr.appendChild(el("td","r num",fmtInt(T.tot[sp.id]||0)));tb.appendChild(tr);});t.appendChild(tb);box.appendChild(t);
  $("sponsorSrc").textContent=(boardMode==="shared"?"Vues cumulées de tous les joueurs":"Vues enregistrées dans ce navigateur")+" · "+fmtInt(T.races)+" course"+(T.races>1?"s":"")+" terminée"+(T.races>1?"s":"")+".";}
(async function connectImp(){try{if(!window.claude||typeof window.claude.use!=="function")return;const d=await window.claude.use("db");if(!d)return;
  d.collection("impressions").limit(1000).onSnapshot(snap=>{impDocs=snap.docs.map(x=>({id:x.id,data:x.data()}));if(!$("paneSponsor").hidden)renderSponsors();},()=>{});}catch(e){}})();
async function saveImpressions(counts){
  const lo=localImp();lo.races=(lo.races||0)+1;for(const k in counts)lo.counts[k]=(lo.counts[k]||0)+counts[k];try{localStorage.setItem("cdc-imp",JSON.stringify(lo));}catch(e){}
  if(boardMode==="shared"&&db&&uid){try{const ref=db.doc("impressions/"+uid);const snap=await ref.get();const old=snap.exists?snap.data():null;
    const doc=old&&old.v===1&&old.counts&&typeof old.counts==="object"?{v:1,races:(old.races|0)+1,counts:Object.assign({},old.counts)}:{v:1,races:1,counts:{}};
    for(const k in counts)if(sponsorById(k))doc.counts[k]=((typeof doc.counts[k]==="number"?doc.counts[k]:0)+counts[k]);doc.at=Date.now();await ref.set(doc);}catch(e){}}}
