/* ================= Météo ================= */
let WX=WEATHERS.beau,WXID="beau";
const RAIN_N=1800,rainPos=new Float32Array(RAIN_N*6),rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute("position",new THREE.BufferAttribute(rainPos,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xb8c6d4,transparent:true,opacity:.45,fog:true}));rain.frustumCulled=false;rain.visible=false;scene.add(rain);
const SNOW_N=1800,snowPos=new Float32Array(SNOW_N*3),snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute("position",new THREE.BufferAttribute(snowPos,3));
const snowPts=new THREE.Points(snowGeo,new THREE.PointsMaterial({color:0xffffff,size:.11,map:dotTex,transparent:true,opacity:.95,depthWrite:false}));snowPts.frustumCulled=false;snowPts.visible=false;scene.add(snowPts);
const rainSeed=[];for(let i=0;i<Math.max(RAIN_N,SNOW_N);i++)rainSeed.push({x:(Math.random()-.5)*44,y:Math.random()*26,z:(Math.random()-.5)*44,ph:Math.random()*6});
const bolt=new THREE.Line(new THREE.BufferGeometry().setFromPoints(new Array(14).fill(0).map(()=>new THREE.Vector3())),new THREE.LineBasicMaterial({color:0xf4f7ff,fog:false}));bolt.visible=false;bolt.frustumCulled=false;scene.add(bolt);
let boltT=0,nextStrike=6,flashT=0;const flashEl=$("flash");

function applyWeather(id){WXID=id;WX=WEATHERS[id];
  scene.fog.color.set(WX.fogC);scene.fog.density=WX.fog;scene.background.set(WX.fogC);setSky(WX.sky[0],WX.sky[1],WX.sky[2]);
  sun.intensity=WX.sun;hemi.intensity=WX.hemi;renderer.toneMappingExposure=WX.exp;sunDisc.visible=id==="beau";
  rain.visible=!!WX.rain;snowPts.visible=!!WX.snow;rainGeo.setDrawRange(0,(WX.rain||0)*2);snowGeo.setDrawRange(0,WX.snow||0);rain.material.opacity=WX.storm?.55:.42;
  if(cloudMat){cloudMat.color.set(WX.clouds);cloudMat.opacity=id==="beau"?.9:.97;}
  const snowy=id==="neige";
  // sol enneigé
  if(terrainMesh){const col=terrainMesh.geometry.attributes.color;const a=col.array;const w=lin(0xf2f5f8);for(let i=0;i<terrainSnowAmt.length;i++){const k=snowy?terrainSnowAmt[i]:0,wet=(id==="pluie"||id==="orage")?.78:1;a[i*3]=lerp(terrainBase[i*3]*wet,w.r,k);a[i*3+1]=lerp(terrainBase[i*3+1]*wet,w.g,k);a[i*3+2]=lerp(terrainBase[i*3+2]*wet,w.b,k);}col.needsUpdate=true;}
  if(trailMesh){const m=trailMesh.material;m.map=snowy?trailMaps.snow:trailMaps.dry;m.bumpMap=m.map;m.roughness=(id==="pluie"||id==="orage")?.45:.95;m.color.setScalar((id==="pluie"||id==="orage")?.72:1);m.needsUpdate=true;}
  if(grassMesh)grassMesh.visible=!snowy;
  for(const tm of treeMeshes){const b=tm.userData.base,cc=new THREE.Color();for(let i=0;i<tm.count;i++){cc.setRGB(b[i*3],b[i*3+1],b[i*3+2]);if(snowy)cc.lerp(new THREE.Color(1.6,1.65,1.7),.45);tm.setColorAt(i,cc);}if(tm.instanceColor)tm.instanceColor.needsUpdate=true;}
  for(const wm of waterMeshes){wm.material.color.set(snowy?0xdfeef7:0x6d8ea6);wm.material.roughness=snowy?.12:.03;wm.material.metalness=snowy?.2:.65;}
  if(valley&&seaFixedY==null)valley.material.color.set(snowy?0xdfe5ea:C.pal.forest);
  nextStrike=3+Math.random()*4;
}
function updWeather(dt,cam){
  if(WX.rain){const n=WX.rain,wind=WX.storm?3.5:1.2,sp=WX.storm?24:18;for(let i=0;i<n;i++){const p=rainSeed[i];p.y-=sp*dt;p.x+=wind*dt;if(p.y<0){p.y+=26;p.x=(Math.random()-.5)*44;p.z=(Math.random()-.5)*44;}if(p.x>22)p.x-=44;
      const x=cam.x+p.x,y=cam.y-8+p.y,z=cam.z+p.z;rainPos[i*6]=x;rainPos[i*6+1]=y;rainPos[i*6+2]=z;rainPos[i*6+3]=x-wind*.03;rainPos[i*6+4]=y+.55;rainPos[i*6+5]=z;}rainGeo.attributes.position.needsUpdate=true;}
  if(WX.snow){const n=WX.snow;for(let i=0;i<n;i++){const p=rainSeed[i];p.y-=1.3*dt;p.ph+=dt;if(p.y<0){p.y+=26;p.x=(Math.random()-.5)*44;p.z=(Math.random()-.5)*44;}snowPos[i*3]=cam.x+p.x+Math.sin(p.ph)*.5;snowPos[i*3+1]=cam.y-8+p.y;snowPos[i*3+2]=cam.z+p.z+Math.cos(p.ph*.8)*.5;}snowGeo.attributes.position.needsUpdate=true;}
  if(WX.storm){nextStrike-=dt;if(nextStrike<=0){nextStrike=4+Math.random()*6;strike(cam);}}
  if(boltT>0){boltT-=dt;if(boltT<=0)bolt.visible=false;}
  if(flashT>0){flashT-=dt;const k=Math.max(0,flashT/.35);flashEl.style.opacity=(k*.55*(Math.sin(flashT*60)>-.3?1:.4)).toFixed(3);hemi.intensity=WX.hemi+k*2.2;if(flashT<=0){flashEl.style.opacity="0";hemi.intensity=WX.hemi;}}
}
function strike(cam){const ang=Math.random()*Math.PI*2,dist=150+Math.random()*450;const bx=cam.x+Math.sin(ang)*dist,bz=cam.z+Math.cos(ang)*dist;const top=cam.y+260,bot=cam.y-40;
  const p=bolt.geometry.attributes.position;let x=bx,z=bz;for(let i=0;i<14;i++){const y=lerp(top,bot,i/13);p.setXYZ(i,x,y,z);x+=(Math.random()-.5)*28;z+=(Math.random()-.5)*28;}p.needsUpdate=true;
  bolt.visible=true;boltT=.16;flashT=.35;sfxThunder(dist/340*.6+.15,dist);if(dist<260){shake=Math.max(shake,.35);if(state==="race")warn("Éclair !");}}
