/* ================= Parcours ================= */
// g : pente moyenne, v : variation de pente (0 = régulier), vf : longueur d'onde des ruptures de pente (m)
const ALPINE={mA:0x5f7f2e,mB:0x87963c,dry:0xa49a55,forest:0x34502a,rock:0x8a8780,rockD:0x63605b,earth:0x6e5a3a};
const COURSES=[
  {id:"chamonix",name:"Chamonix",region:"Haute-Savoie",from:"Plan de l’Aiguille",to:"Chalet du Grépon",alt0:2310,g:.27,v:.55,vf:240,cx:[30,16,8],
   dirt:"#857058",pal:ALPINE,rockBias:.15,rockRel:26,snowRel:62,trees:{type:"fir",count:1700,maxRel:36},peaks:{h:1.7,snow:.45,col:0x6d7780},
   fauna:{cross:"deer",stand:"ibex",small:true},hz:{rock:.16,log:.08,roots:.06,mud:.03,water:.07,scree:.1,cross:.06,stand:.1,rockfall:.14,small:.12},
   wx:{beau:.5,pluie:.15,neige:.2,orage:.15},tags:["Haute montagne","Chutes de pierres","Bouquetins"],blurb:"Sous l’Aiguille du Midi, un balcon raide et minéral face au Mont-Blanc."},
  {id:"jura",name:"Jura",region:"Ain",from:"Crêt de la Neige",to:"Lélex",alt0:1720,g:.13,v:.6,vf:200,cx:[34,18,9],
   dirt:"#6b5034",pal:{mA:0x4f7a2c,mB:0x6e8c38,dry:0x8a8a48,forest:0x2c4a24,rock:0x9a958a,rockD:0x6f6a60,earth:0x5a4630},rockBias:-.1,rockRel:40,snowRel:999,trees:{type:"mixed",count:2800,maxRel:80},peaks:{h:.45,snow:0,col:0x52693e,round:true},
   fauna:{cross:"boar",stand:"chamois",small:false},hz:{rock:.08,log:.16,roots:.18,mud:.14,water:.12,scree:0,cross:.14,stand:.08,rockfall:0,small:0},
   wx:{beau:.35,pluie:.35,neige:.15,orage:.15},tags:["Forêt","Racines","Sangliers"],blurb:"Sous-bois de sapins et de hêtres, racines, boue et sangliers."},
  {id:"pyrenees",name:"Pyrénées",region:"Haute-Garonne",from:"Lac d’Oô",to:"Granges d’Astau",alt0:1504,g:.22,v:.7,vf:220,cx:[36,17,8],
   dirt:"#7f6a52",pal:ALPINE,rockBias:.05,rockRel:30,snowRel:75,trees:{type:"mixed",count:2000,maxRel:44},peaks:{h:1.3,snow:.5,col:0x6c7378},
   fauna:{cross:"deer",stand:"isard",small:true},hz:{rock:.14,log:.1,roots:.08,mud:.04,water:.12,scree:.06,cross:.08,stand:.12,rockfall:.08,small:.12},
   wx:{beau:.45,pluie:.25,neige:.1,orage:.2},tags:["Cascade","Isards","Marmottes"],blurb:"Du lac glaciaire à la vallée d’Astau, en lacets serrés, au milieu des isards."},
  {id:"auvergne",name:"Auvergne",region:"Puy-de-Dôme",from:"Sommet du Puy de Dôme",to:"Col de Ceyssat",alt0:1465,g:.25,v:.25,vf:300,cx:[42,15,6],
   dirt:"#7a3d2c",pebble:"#3a2622",pal:{mA:0x5f8a33,mB:0x7c9a3c,dry:0x9a8a4a,forest:0x30502a,rock:0x4f4a48,rockD:0x2f2c2b,earth:0x6b3a2a},rockBias:-.05,rockRel:50,snowRel:999,trees:{type:"broad",count:900,maxRel:30},peaks:{h:.5,snow:0,col:0x4c6a3a,round:true,crater:true},
   fauna:{cross:"deer",stand:"cow",small:false},hz:{rock:.1,log:.06,roots:.04,mud:.12,water:.1,scree:.2,cross:.06,stand:.14,rockfall:.04,small:0},
   wx:{beau:.4,pluie:.25,neige:.15,orage:.2},tags:["Volcans","Pouzzolane","Vaches Salers"],blurb:"Le chemin des Muletiers, raide et régulier, sur la pouzzolane rouge des volcans."},
  {id:"champex",name:"Champex",region:"Valais",from:"Champex-Lac",to:"Orsières",alt0:1470,g:.19,v:.5,vf:220,cx:[32,18,8],
   dirt:"#7c6550",pal:ALPINE,rockBias:0,rockRel:36,snowRel:80,trees:{type:"fir",count:2600,maxRel:60},peaks:{h:1.45,snow:.45,col:0x6a747e},water:{kind:"lake",color:0x2e7a8c},
   fauna:{cross:"deer",stand:"ibex",small:true},hz:{rock:.1,log:.14,roots:.14,mud:.06,water:.1,scree:.04,cross:.12,stand:.06,rockfall:.04,small:.1},
   wx:{beau:.5,pluie:.25,neige:.1,orage:.15},tags:["Lac","Forêt d’épicéas","Grand Combin"],blurb:"Le final mythique de l’UTMB : du lac de Champex à Orsières, sous les épicéas."},
  {id:"paysbasque",name:"Pays basque",region:"Pyrénées-Atlantiques",from:"Sommet de la Rhune",to:"Sare",alt0:905,g:.23,v:.6,vf:170,cx:[38,16,8],
   dirt:"#7b583a",pal:{mA:0x4c8a32,mB:0x6aa03c,dry:0x9a6a36,forest:0x2f5a2a,rock:0x8a8478,rockD:0x625d55,earth:0x5d4430},rockBias:-.05,rockRel:44,snowRel:999,trees:{type:"broad",count:800,maxRel:30},peaks:{h:.5,snow:0,col:0x4a7a3c,round:true},
   fauna:{cross:"boar",stand:"pony",small:false},hz:{rock:.14,log:.06,roots:.06,mud:.2,water:.16,scree:.06,cross:.08,stand:.16,rockfall:.02,small:0},
   wx:{beau:.35,pluie:.4,neige:.05,orage:.2},tags:["Fougères","Boue","Pottoks"],blurb:"Collines vertes, fougères rousses et pottoks en liberté, l’océan au loin."},
  {id:"calanques",name:"Calanques",region:"Marseille",from:"Col de Sugiton",to:"Calanque de Sugiton",alt0:330,g:.21,v:.8,vf:150,cx:[30,18,10],
   dirt:"#d2c8b4",pebble:"#f4efe4",pal:{mA:0x7d8a4a,mB:0x9a9660,dry:0xb0a46a,forest:0x4e6a34,rock:0xe2ddd2,rockD:0xbdb6a8,earth:0xbfb39a},rockBias:.35,rockRel:8,snowRel:999,trees:{type:"pine",count:1100,maxRel:40},peaks:{h:.4,snow:0,col:0xd9d3c6},water:{kind:"sea",color:0x1f8fae},
   fauna:{cross:"boar",stand:"goat",small:false},hz:{rock:.22,log:.04,roots:.06,mud:0,water:.04,scree:.2,cross:.08,stand:.14,rockfall:.08,small:0},
   wx:{beau:.7,pluie:.12,neige:.03,orage:.15},tags:["Calcaire","Pins d’Alep","Mer"],blurb:"Calcaire blanc, garrigue et pins d’Alep, jusqu’à l’eau turquoise de la calanque."},
  {id:"ventoux",name:"Mont Ventoux",region:"Vaucluse",from:"Sommet du Ventoux",to:"Chalet Reynard",alt0:1910,g:.16,v:.35,vf:300,cx:[28,14,7],wind:true,
   dirt:"#cfc8ba",pebble:"#f6f2ea",pal:{mA:0x8a8f5a,mB:0xa09f72,dry:0xb8b08a,forest:0x3e5a30,rock:0xe0dcd4,rockD:0xc2bcb2,earth:0xc2b9a6},rockBias:.6,rockRel:-6,snowRel:999,trees:{type:"pine",count:500,maxRel:-25},peaks:{h:.35,snow:.2,col:0xa8a49c},
   fauna:{cross:"boar",stand:"goat",small:false},hz:{rock:.18,log:0,roots:0,mud:0,water:.04,scree:.3,cross:.04,stand:.08,rockfall:.16,small:0},
   wx:{beau:.55,pluie:.1,neige:.2,orage:.15},tags:["Pierrier lunaire","Mistral","Chutes de pierres"],blurb:"Le Géant de Provence : un pierrier blanc balayé par le mistral."},
  {id:"verbier",name:"Verbier Saint-Bernard",region:"Valais",from:"Col des Gentianes",to:"La Chaux",alt0:2894,g:.24,v:.55,vf:230,cx:[34,16,9],
   dirt:"#80705e",pal:ALPINE,rockBias:.2,rockRel:20,snowRel:50,trees:{type:"fir",count:900,maxRel:22},peaks:{h:1.6,snow:.55,col:0x6b747d},
   fauna:{cross:"deer",stand:"ibex",small:true},hz:{rock:.16,log:.04,roots:.04,mud:.02,water:.1,scree:.12,cross:.04,stand:.12,rockfall:.16,small:.14},
   wx:{beau:.4,pluie:.1,neige:.35,orage:.15},tags:["Glacier","Neige","Marmottes"],blurb:"Haute route sous le Mont Fort, entre névés, pierriers et marmottes."},
];
const WEATHERS={
  beau:{label:"Beau temps",note:"Sol sec, bonne adhérence, visibilité maximale.",fog:.0016,fogC:0xa9c3db,sky:[0x3b78c8,0xa9c3db,0x9fb3b4],sun:1.3,hemi:.62,exp:.95,grip:1,speed:1,clouds:0xffffff},
  pluie:{label:"Pluie",note:"Sentier glissant : moins d’adhérence en virage, la boue et les flaques freinent davantage.",fog:.0034,fogC:0x8e9aa4,sky:[0x5b6876,0x8e9aa4,0x7b868e],sun:.4,hemi:.72,exp:.95,grip:.8,speed:.96,rain:1100,clouds:0x9aa3ab},
  neige:{label:"Neige",note:"Sol blanc et flaques gelées : verglas, adhérence faible, visibilité réduite.",fog:.0038,fogC:0xd6dde4,sky:[0x9fb0c2,0xd6dde4,0xc8d0d8],sun:.55,hemi:.85,exp:.9,grip:.68,speed:.92,snow:1600,clouds:0xe8edf2},
  orage:{label:"Orage",note:"Averse, éclairs et tonnerre : sentier détrempé, visibilité coupée par les flashs.",fog:.003,fogC:0x5b636c,sky:[0x262c34,0x5b636c,0x4a5158],sun:.2,hemi:.5,exp:1,grip:.78,speed:.96,rain:1700,storm:true,clouds:0x4a5058},
};
const WEATHER_ORDER=["auto","beau","pluie","neige","orage"];

/* ================= Héros ================= */
// stats sur 5 : vit (vitesse), agi (agilité), saut, endu (endurance), robu (robustesse)
const HEROES=[
  {id:"lina",name:"Lina Moreau",nick:"La Chamois",sex:"F",bio:"Guide à Chamonix, elle court les pierriers comme d’autres prennent l’escalier.",
   stats:{vit:3,agi:5,saut:4,endu:3,robu:2},ab:{id:"surefoot",label:"Pied sûr",desc:"Ne glisse ni dans les pierriers ni sur le verglas."},
   look:{skin:0xe8b896,hair:0x6b3b1f,style:"pony",top:0xf2c230,shorts:0x16201c,vest:0xd6392b,band:0xd6392b,shoe:0x2c9c6a}},
  {id:"marco",name:"Marco Bianchi",nick:"Le Bûcheron",sex:"M",bio:"Ancien bûcheron du Jura, large d’épaules, rien ne l’arrête en sous-bois.",
   stats:{vit:3,agi:2,saut:3,endu:4,robu:5},ab:{id:"roots",label:"Tronc d’acier",desc:"Ne trébuche jamais sur les racines et se relève vite."},
   look:{skin:0xd9a27a,hair:0x2a1a10,style:"short",beard:0x2a1a10,top:0xb3362c,shorts:0x22262a,vest:0x3a3f45,band:0x3a3f45,shoe:0x6b4b2e,build:1.14}},
  {id:"ines",name:"Inès Benali",nick:"La Fusée",sex:"F",bio:"Pistarde reconvertie au trail, elle a le meilleur finish du peloton.",
   stats:{vit:5,agi:3,saut:3,endu:2,robu:2},ab:{id:"turbo",label:"Turbo",desc:"Son sprint donne nettement plus de vitesse."},
   look:{skin:0xa8714f,hair:0x120c08,style:"bun",top:0xd6392b,shorts:0x111111,vest:0xf4f1e8,band:0xf2c230,shoe:0xf2c230}},
  {id:"hugo",name:"Hugo Lefèvre",nick:"Le Métronome",sex:"M",bio:"Ultra-traileur, il gère son effort à la pulsation près.",
   stats:{vit:3,agi:3,saut:3,endu:5,robu:3},ab:{id:"diesel",label:"Diesel",desc:"Le sprint consomme 40 % d’énergie en moins."},
   look:{skin:0xf0c4a2,hair:0x8a5a2b,style:"cap",hat:0x2d6fb8,top:0x2d6fb8,shorts:0x1b2436,vest:0x15181c,band:0xffffff,shoe:0xff5a36}},
  {id:"maia",name:"Maïa Etxeberria",nick:"La Basque",sex:"F",bio:"Née à Sare, elle a appris à courir dans la boue des collines basques.",
   stats:{vit:3,agi:3,saut:3,endu:4,robu:4},ab:{id:"mud",label:"Reine de la boue",desc:"La boue et les flaques ne la ralentissent presque pas."},
   look:{skin:0xf0c4a2,hair:0x3a2416,style:"braid",top:0x2c9c6a,shorts:0xd6392b,vest:0xf4f1e8,band:0xd6392b,shoe:0xffffff}},
  {id:"yanis",name:"Yanis Garnier",nick:"Le Yéti",sex:"M",bio:"Skieur-alpiniste l’hiver, il ne sent ni le froid ni le verglas.",
   stats:{vit:3,agi:3,saut:2,endu:5,robu:4},ab:{id:"crampons",label:"Crampons",desc:"Garde toute son adhérence sous la pluie et dans la neige."},
   look:{skin:0xeab994,hair:0x5a3a22,style:"beanie",hat:0x8a4fb8,beard:0x5a3a22,top:0xf4f1e8,shorts:0x16324f,vest:0x8a4fb8,band:0x8a4fb8,shoe:0x8a4fb8,build:1.08}},
  {id:"chloe",name:"Chloé Martin",nick:"L’Écureuil",sex:"F",bio:"Gymnaste dans une autre vie, elle saute les obstacles sans casser son rythme.",
   stats:{vit:3,agi:4,saut:5,endu:3,robu:2},ab:{id:"spring",label:"Ressort",desc:"Saute plus haut et plus loin que tout le monde."},
   look:{skin:0xf2cbb0,hair:0xc9a15a,style:"bob",top:0xff8a3d,shorts:0x2b2b2b,vest:0x2d6fb8,band:0xffffff,shoe:0x8a4fb8,height:.95}},
  {id:"baptiste",name:"Baptiste Roux",nick:"Le Kamikaze",sex:"M",bio:"Descendeur sans frein, il prend tous les risques… et parfois la gamelle.",
   stats:{vit:5,agi:4,saut:3,endu:2,robu:1},ab:{id:"kamikaze",label:"Tout schuss",desc:"Encore plus rapide dans les pentes raides, mais ses chutes durent plus longtemps."},
   look:{skin:0xe2b08c,hair:0x5a3a22,style:"long",top:0x1f2f4a,shorts:0x0f0f12,vest:0xf2c230,band:0xff5a36,shoe:0xd6392b}},
  {id:"awa",name:"Awa Diallo",nick:"La Panthère",sex:"F",bio:"Explosive et régulière, elle relance après chaque obstacle comme personne.",
   stats:{vit:4,agi:4,saut:3,endu:3,robu:3},ab:{id:"relaunch",label:"Relance",desc:"Accélère deux fois plus vite après un ralentissement."},
   look:{skin:0x8d5a3b,hair:0x0d0907,style:"braids",top:0x8a4fb8,shorts:0x1a1a26,vest:0xf2c230,band:0xf2c230,shoe:0xffffff}},
  {id:"theo",name:"Théo Blanc",nick:"Le Renard",sex:"M",bio:"Il lit le terrain comme une carte et repère chaque piège avant les autres.",
   stats:{vit:3,agi:3,saut:3,endu:3,robu:3},ab:{id:"flair",label:"Flair",desc:"Voit venir les dangers deux fois plus tôt et récupère plus d’énergie aux ravitos."},
   look:{skin:0xf2cbb0,hair:0xb5522a,style:"short",beard:0xb5522a,top:0xc8452c,shorts:0x2b3442,vest:0x2c9c6a,band:0x2c9c6a,shoe:0x2c9c6a}},
];
const TOP_COLORS=[0xf2c230,0xd6392b,0x2d6fb8,0x2c9c6a,0x8a4fb8,0xff8a3d,0xf4f1e8,0x1f2f4a];
const SHOE_COLORS=[0x2c9c6a,0xff5a36,0xf2c230,0xffffff,0x8a4fb8,0x1a1a1a];
// effets des caractéristiques sur la course
function heroParams(h){const s=h.stats,ab=h.ab.id;return{
  vMul:.955+s.vit*.012, lat:2.9+s.agi*.22, jumpV:4.15+s.saut*.13+(ab==="spring"?.55:0),
  drain:(26-s.endu*2.2)*(ab==="diesel"?.6:1), regen:5+s.endu*.7, fallT:2.15-s.robu*.12+(ab==="kamikaze"?.6:0),
  sprint:ab==="turbo"?1.15:.8, mudF:ab==="mud"?.88:.5, waterF:ab==="mud"?.9:.55, weatherProof:ab==="crampons", slipProof:ab==="surefoot",
  rootsProof:ab==="roots", steepBonus:ab==="kamikaze"?.05:0, hintDist:ab==="flair"?20:10, pick:ab==="flair"?60:40, acc:ab==="relaunch"?2:1};}
