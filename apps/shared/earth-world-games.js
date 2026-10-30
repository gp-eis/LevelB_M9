// Level B Week 2: eight different ways to help a living 3D world.
export function buildEarthGames(api){
 const {type,scene,shape,torus,outline,group,material,animations,target,add,hold,isHeld,isDone,goal,step,retry,say,finish,later,meter,bear,head,arms,legs}=api;
 const green=material('#70bd67'),leaf=material('#92d374'),blue=material('#60c5ec'),white=material('#fff9e8'),pink=material('#f19abb'),yellow=material('#ffd357'),brown=material('#916943'),dark=material('#343d52'),gray=material('#a2a5b0'),orange=material('#f3aa60');
 bear.position.set(-2.6,0,.5);bear.scale.setScalar(.72);bear.rotation.y=.3;
 bear.visible=['cleanWater','forest'].includes(type);
 if(bear.visible){bear.scale.setScalar(.95);bear.position.set(-1.8,0,1.4);}
 let busy=false,cheering=false,winTime=0;
 const globe=group(scene,2.65,1.9,-1);shape(globe,blue,0,0,0,.44,.44,.44);shape(globe,green,-.16,.12,.36,.19,.23,.065);shape(globe,green,.19,-.15,.36,.17,.13,.075);
 for(const x of [-.13,.13])shape(globe,dark,x,.04,.435,.032,.045,.02);const smile=torus(globe,dark,0,-.12,.43,.09,.014);smile.scale.y=.5;
 globe.visible=false;
 // Every working action is sequenced: walk, reach, carry, then release.
 function animate(seconds,frame,callback){busy=true;let p=0;const fn=(t,dt)=>{p=Math.min(1,p+dt/seconds);frame(p,t);if(p===1){animations.splice(animations.indexOf(fn),1);callback();}};animations.push(fn);}
 function walk(x,z,callback){const start=bear.position.clone(),dx=x-start.x,dz=z-start.z;bear.rotation.y=Math.atan2(dx,dz);animate(Math.max(.6,Math.hypot(dx,dz)/1.8),(p,t)=>{bear.position.set(start.x+dx*p,Math.abs(Math.sin(p*Math.PI*6))*.035,start.z+dz*p);legs.forEach((l,i)=>l.rotation.x=Math.sin(t*12+i*Math.PI)*.6);},()=>{legs.forEach(l=>l.rotation.x=0);bear.position.y=0;callback();});}
 function reach(callback){bear.rotation.y=Math.PI;animate(.55,p=>{head.rotation.x=.3*Math.sin(p*Math.PI);arms.forEach(a=>a.rotation.x=-1.1*Math.sin(p*Math.PI/2));},callback);}
 function carry(obj){bear.attach(obj);obj.position.set(0,.85,.62);obj.rotation.set(0,0,0);arms.forEach(a=>a.rotation.x=-1.1);}
 function releasePose(){arms.forEach(a=>a.rotation.x=0);head.rotation.x=0;busy=false;}
 const done=message=>{if(cheering)return;cheering=true;winTime=0;busy=true;say(message);later(finish,1500);};
 const nope=message=>{retry(null,message);head.rotation.z=.14;later(()=>head.rotation.z=0,400);};
 function travel(obj,to,seconds,callback){busy=true;const from=obj.position.clone();let p=0;const fn=(t,dt)=>{p=Math.min(1,p+dt/seconds);obj.position.copy(from).lerp(to,p);obj.position.y+=Math.sin(p*Math.PI)*.35;if(p===1){animations.splice(animations.indexOf(fn),1);busy=false;callback();}};animations.push(fn);}
 function tree(x,z,scale=1){const g=group(scene,x,0,z);shape(g,brown,0,.6,0,.12,.65,.12);for(const [xx,yy] of [[0,1.5],[-.3,1.25],[.3,1.25]])shape(g,leaf,xx,yy,0,.48,.48,.4);g.scale.setScalar(scale);return g;}
 function flower(x,z,color=pink){const g=group(scene,x,0,z);shape(g,green,0,.45,0,.035,.5,.035);shape(g,leaf,-.15,.3,0,.2,.08,.08);const petals=group(g,0,.95,0);for(let i=0;i<6;i++){const a=i*Math.PI/3;shape(petals,color,Math.cos(a)*.2,Math.sin(a)*.2,0,.16,.16,.075);}shape(petals,yellow,0,0,.08,.11,.11,.075);return {g,petals};}
 function bug(kind,parent=scene){const g=group(parent);if(kind==='butterfly'){shape(g,dark,0,0,0,.055,.22,.055);for(const s of [-1,1]){const wing=shape(g,pink,s*.2,0,0,.22,.28,.06);wing.userData.side=s;g.userData.wings=(g.userData.wings||[]).concat(wing);}}
 else{shape(g,kind==='bee'?yellow:pink,0,0,0,.22,.16,.24);for(const x of [-.09,.09])shape(g,dark,x,.07,.22,.025,.035,.015);if(kind==='bee'){for(const z of [-.1,.05])shape(g,dark,0,0,z,.225,.165,.025);g.userData.wings=[shape(g,white,-.2,.17,0,.2,.035,.17),shape(g,white,.2,.17,0,.2,.035,.17)];}else{for(const x of [-.1,.1])for(const z of [-.1,.05])shape(g,dark,x,.145,z,.04,.02,.04);}}
 return g;}
 animations.push((t,dt)=>{globe.rotation.y=Math.sin(t*.7)*.12;if(cheering||isDone()){winTime+=dt;bear.rotation.y+=(0-bear.rotation.y)*Math.min(1,dt*6);bear.position.y=Math.abs(Math.sin(winTime*7))*.1;arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*2.1);globe.scale.setScalar(1+Math.sin(winTime*5)*.06);}});
 if(type==='sun'){
  goal(1);const sun=group(scene,.3,.5,-.6);shape(sun,yellow,0,0,0,.5,.5,.14);const rays=[];for(let i=0;i<10;i++){const a=i*Math.PI/5;const r=shape(sun,yellow,Math.cos(a)*.7,Math.sin(a)*.7,0,.09,.23,.06);r.rotation.z=a-Math.PI/2;rays.push(r);}for(const x of [-.15,.15])shape(sun,dark,x,.06,.15,.035,.05,.02);
  const skyMat=material('#59698b');scene.background=skyMat.color;const f=flower(.4,.7);f.petals.scale.setScalar(.1);let light=0;meter.hidden=false;
  const raise=add('☀️ Hold to raise sun',()=>{});hold(raise,()=>say('The sun gives Earth light!'),()=>{});say('Hold to bring sunshine to Earth.');
  animations.push((t,dt)=>{if(cheering||isDone())return;if(isHeld())light=Math.min(1,light+dt/3.5);sun.position.y=.5+light*1.6;skyMat.color.setRGB(.35+light*.38,.41+light*.42,.55+light*.4);f.petals.scale.setScalar(.1+light*.9);meter.firstChild.style.width=light*100+'%';if(light===1)done('Earth needs the sun!');});
 }else if(type==='plant'){
  goal(3);shape(scene,brown,.4,.1,.3,.8,.15,.6);const seed=shape(scene,material('#ffe39b'),1.6,.3,.5,.2,.14,.14);const sprout=group(scene,.4,.15,.3);shape(sprout,green,0,.45,0,.04,.45,.04);for(const s of [-1,1]){const l=shape(sprout,leaf,s*.18,.55,0,.25,.1,.1);l.rotation.z=s*.5;}sprout.scale.setScalar(.01);
  const can=group(scene,1.5,.8,.5);shape(can,blue,0,0,0,.25,.3,.22);shape(can,blue,-.3,.05,0,.3,.06,.07);torus(can,white,.25,.1,0,.18,.035);can.visible=false;const drops=Array.from({length:7},()=>shape(scene,blue,0,0,0,.035,.07,.035));drops.forEach(d=>d.visible=false);let planted=false,water=0;
  add('🌱 Plant seed',()=>{if(busy||planted)return;travel(seed,seed.position.clone().set(.4,.1,.3),.8,()=>{seed.visible=false;planted=true;step();say('Seed planted! Hold Water to help it grow.');});});
  const pour=add('💧 Hold to water',()=>{});hold(pour,()=>{if(!planted)nope('Plant the seed first!');},()=>{can.visible=false;drops.forEach(d=>d.visible=false);});say('Plant a seed, then water it to grow a plant.');
  animations.push((t,dt)=>{if(cheering||isDone())return;const pouring=planted&&isHeld()&&!busy;can.visible=pouring;drops.forEach((d,i)=>{d.visible=pouring;d.position.set(.65,.8-((t*1.5+i*.1)% .65),.3);});if(pouring){can.rotation.z=.3;const before=water;water=Math.min(1,water+dt/4);sprout.scale.setScalar(.05+water);if(before<.5&&water>=.5){step();say('A sprout! Keep watering gently.');}if(water===1){can.visible=false;drops.forEach(d=>d.visible=false);done('Earth needs plants!');}}});
 }else if(type==='cleanWater'){
  goal(3);const waterMat=material('#40bce8');shape(scene,waterMat,.5,.08,.3,1.9,.1,1.1);const fish=group(scene,.5,.25,.3);shape(fish,orange,0,0,0,.22,.1,.1);shape(fish,orange,-.23,0,0,.12,.15,.04);shape(fish,dark,.14,.03,.09,.025,.025,.015);const bin=group(scene,2.65,0,1.3);
  // Hollow rectangular plastic bin: four walls, dark opening, rim and handles.
  shape(bin,blue,0,.38,-.27,.65,.76,.07,true);shape(bin,blue,0,.38,.27,.65,.76,.07,true);
  for(const x of [-.3,.3]){shape(bin,blue,x,.38,0,.07,.76,.54,true);shape(bin,dark,x,.8,0,.08,.06,.25,true);}
  shape(bin,dark,0,.68,0,.52,.04,.45,true);shape(bin,white,0,.4,.315,.35,.3,.018,true);
  for(const x of [-.09,0,.09])shape(bin,blue,x,.4,.33,.025,.18,.02,true);
  shape(bin,blue,0,.52,.33,.26,.035,.02,true);let collected=0;
  const rubbish=[['🥤 Cup',-.6],['🧴 Bottle',.5],['🛍️ Bag',1.6]].map(([label,x],i)=>{
   const g=group(scene,x,.38,.5);
   if(i===0){
    const cup=outline(g,pink,[[-.15,-.23],[.15,-.23],[.23,.23],[-.23,.23]],.28);cup.position.z=-.14;
    const rim=torus(g,white,0,.24,0,.21,.035);rim.rotation.x=Math.PI/2;rim.scale.y=.72;
    shape(g,dark,0,.245,0,.18,.018,.115);const straw=shape(g,white,.08,.4,0,.035,.34,.035,true);straw.rotation.z=-.2;
    shape(g,white,0,-.02,.16,.3,.09,.025,true);
   }else if(i===1){
    shape(g,material('#a6e4ef'),0,-.03,0,.2,.3,.15);shape(g,blue,0,.29,0,.085,.13,.085);
    shape(g,material('#397ed2'),0,.4,0,.11,.06,.1,true);shape(g,white,0,-.04,.145,.3,.19,.025,true);
    shape(g,blue,0,-.04,.17,.1,.07,.015,true);
   }else{
    shape(g,yellow,0,-.04,0,.48,.45,.22,true);
    for(const z of [-.08,.08]){const handle=torus(g,yellow,0,.27,z,.14,.035);handle.scale.y=1.2;}
    shape(g,white,0,-.04,.12,.22,.22,.018,true);
   }
   return {g,label};
  });
  rubbish.forEach(({g,label})=>{let choice;const pick=()=>{if(busy||!g.visible)return;
   say('Let’s pick up the litter!');walk(g.position.x,1.25,()=>reach(()=>{
    scene.updateMatrixWorld(true);carry(g);say('Carry it to the trash bin.');
    walk(1.85,1.4,()=>{bear.rotation.y=Math.PI/2;scene.updateMatrixWorld(true);scene.attach(g);
     travel(g,g.position.clone().set(2.65,.9,1.3),.5,()=>travel(g,g.position.clone().set(2.65,.45,1.3),.35,()=>{
      g.visible=false;releasePose();collected++;choice.disabled=true;choice.textContent='✓ '+label;choice.style.opacity='.45';choice.style.filter='grayscale(1)';choice.style.cursor='default';
      if(collected===3)done('Clean water for Earth!');else{step();say('Pick up another piece of litter.');}
     }));
    });
   }));};choice=add(label,pick);target(g,pick);});say('Pick up the litter and put it in the blue trash bin.');animations.push(t=>{fish.position.x=.5+Math.sin(t)*.7;fish.position.z=.2+Math.cos(t)*.3;fish.rotation.y=Math.cos(t)>0?0:Math.PI;});
 }else if(type==='bloom'){
  goal(3);const flowers=[-.8,.6,2].map((x,i)=>flower(x,.3,[pink,yellow,orange][i]));flowers.forEach(f=>f.petals.scale.setScalar(.35));const bee=bug('bee');bee.position.set(-1.2,1.25,.7);let bloomed=new Set();
  flowers.forEach((f,i)=>{const visit=()=>{if(busy||bloomed.has(i))return;say('Carry pollen to the flower!');travel(bee,bee.position.clone().set(f.g.position.x,1.15,.5),1,()=>{bloomed.add(i);if(bloomed.size===3)done('Earth needs flowers!');else{step();say('Visit another flower bud!');}});};add(['🌸 Pink bud','🌼 Yellow bud','🌺 Orange bud'][i],visit);target(f.g,visit);});say('Guide the bee to each bud and watch the flowers open.');animations.push((t,dt)=>{bee.userData.wings.forEach((w,i)=>w.rotation.z=Math.sin(t*35)*(i?1:-1)*.6);flowers.forEach((f,i)=>{if(bloomed.has(i)){const s=Math.min(1,f.petals.scale.x+dt*2);f.petals.scale.setScalar(s);}});});
 }else if(type==='forest'){
  goal(3);const holes=[-.9,.5,1.9].map(x=>shape(scene,brown,x,.02,.1,.12,.025,.12));let next=0,planted=false;const saplings=[];
  const shovel=group(arms[1],0,-.45,.12);shape(shovel,brown,0,-.26,0,.035,.35,.035);shape(shovel,gray,0,-.65,0,.14,.2,.045);shovel.visible=false;
  add('🪏 Dig a hole',()=>{if(busy||next===3)return;if(planted){nope('Plant the tree in this hole first!');return;}
   say('Bear is digging a hole.');walk(holes[next].position.x-.65,1.05,()=>{bear.rotation.y=2.54;shovel.visible=true;
    animate(1.4,p=>{arms[1].rotation.x=-.45-Math.sin(p*Math.PI*4)*.45;head.rotation.x=.2;holes[next].scale.set(.12+p*.25,.035,.12+p*.25);},()=>{shovel.visible=false;planted=true;releasePose();say('Hole ready! Plant a tree.');});
   });
  });
  add('🌳 Plant tree',()=>{if(busy||next===3)return;if(!planted){nope('Dig a hole first!');return;}busy=true;
   const tr=tree(0,0,.27);saplings.push(tr);carry(tr);say('Lower the little tree into the hole.');
   bear.rotation.y=2.54;scene.updateMatrixWorld(true);scene.attach(tr);tr.rotation.set(0,0,0);
   travel(tr,tr.position.clone().set(holes[next].position.x,0,.1),.9,()=>{releasePose();busy=true;
    walk(bear.position.x-.65,1.25,()=>{animate(1,p=>tr.scale.setScalar(.27+.48*p),()=>{next++;planted=false;releasePose();if(next===3)done('A little forest for Earth!');else{step();say('Dig the next hole for another tree.');}});});
   });
  });say('Dig, then plant. Grow three trees for Earth.');animations.push(t=>saplings.forEach(tr=>{if(tr.parent===scene)tr.rotation.set(0,0,Math.sin(t*2)*.025);}));
 }else if(type==='insects'){
  goal(3);const kinds=['bee','butterfly','ladybird'],bugs=[],covers=[];let found=0;
  [-.8,.6,2].forEach((x,i)=>{const b=bug(kinds[i]);b.position.set(x,.55,.4);b.visible=false;bugs.push(b);const cover=group(scene,x,.25,.65);shape(cover,leaf,0,.35,0,.45,.6,.07);cover.rotation.z=.25;covers.push(cover);const reveal=()=>{if(busy||b.userData.found)return;b.userData.found=true;busy=true;say('You found a '+kinds[i]+'!');later(()=>{busy=false;found++;if(found===3)done('Earth needs insects!');else step();},900);};add(['🍃 Left leaf','🍃 Middle leaf','🍃 Right leaf'][i],reveal);target(cover,reveal);});say('Look under the leaves. Find three garden insects!');animations.push((t,dt)=>{bugs.forEach((b,i)=>{const revealed=b.userData.found;covers[i].position.y+=((revealed?1.7:.25)-covers[i].position.y)*Math.min(1,dt*6);covers[i].scale.setScalar(revealed?Math.max(.01,covers[i].scale.x-dt*2):1);if(revealed&&covers[i].scale.x<.05){covers[i].visible=false;b.visible=true;b.position.y=.8+Math.sin(t*5)*.1;b.userData.wings?.forEach((w,j)=>w.rotation.z=Math.sin(t*25)*(j?1:-1)*.6);}});});
 }else if(type==='animals'){
  goal(3);const pond=shape(scene,blue,2,.05,.4,.7,.08,.55);tree(.5,-.4,.8);const burrow=shape(scene,brown,-1.05,.3,.2,.5,.3,.25);shape(scene,dark,-1.05,.3,.42,.25,.23,.025);
  const rabbit=group(scene,0,.35,1.3);shape(rabbit,white,0,0,0,.25,.25,.22);shape(rabbit,white,0,.3,0,.2,.19,.18);for(const x of [-.1,.1]){shape(rabbit,white,x,.6,0,.055,.22,.06);shape(rabbit,dark,x,.33,.17,.025,.03,.01);}
  const bird=group(scene,0,.65,1.3);shape(bird,blue,0,0,0,.24,.26,.2);shape(bird,yellow,0,.05,.22,.07,.04,.1);for(const x of [-.09,.09])shape(bird,dark,x,.12,.18,.025,.03,.015);const wings=[shape(bird,blue,-.25,0,0,.12,.23,.15),shape(bird,blue,.25,0,0,.12,.23,.15)];
  const fish=group(scene,0,.35,1.3);shape(fish,orange,0,0,0,.25,.13,.1);shape(fish,orange,-.25,0,0,.1,.16,.04);shape(fish,dark,.12,.035,.095,.025,.025,.012);bird.visible=false;fish.visible=false;
  const animals=[rabbit,bird,fish],homes=[[-1.05,.5,.7],[.5,1.4,-.3],[2,.2,.4]],names=['rabbit','bird','fish'];let current=0;
  ['🐇 Burrow','🐦 Tree','🐟 Pond'].forEach((label,i)=>add(label,()=>{if(busy)return;if(i!==current){nope('Find a home for the '+names[current]+'!');return;}travel(animals[current],animals[current].position.clone().set(...homes[i]),1.2,()=>{current++;if(current===3)done('Homes for Earth’s animals!');else{step();animals[current].visible=true;say('Where does the '+names[current]+' live?');}});}));say('Where does the rabbit live? Choose its home.');animations.push(t=>{wings.forEach((w,i)=>w.rotation.z=Math.sin(t*12)*(i?1:-1)*.4);if(current===3){fish.position.x=2+Math.sin(t)*.2;}});
 }else if(type==='air'){
  goal(2);const machine=group(scene,1.7,0,-.2);shape(machine,gray,0,.3,0,.75,.6,.5,true);shape(machine,dark,0,.85,0,.12,.4,.12);const puffs=Array.from({length:8},(_,i)=>shape(scene,gray,1.7+(i%3)*.3,1+i*.17,-.2,.27,.22,.2));const f=flower(.1,.5);f.g.rotation.z=.2;let stopped=false,clear=0;const switchMat=material('#ed6666');shape(machine,switchMat,.23,.44,.27,.13,.13,.03,true);const fan=group(machine,-.15,.32,.27);torus(fan,dark,0,0,0,.19,.025);for(let i=0;i<3;i++){const blade=shape(fan,white,0,0,.02,.04,.16,.025);blade.rotation.z=i*Math.PI/3;}
  add('🛑 Switch engine off',()=>{if(stopped)return;stopped=true;switchMat.color.set('#74d48a');step();say('Smoke stopped. Hold Breeze to clear the air.');});const breeze=add('🌬️ Hold Breeze',()=>{});hold(breeze,()=>{if(!stopped)nope('Switch off the smoky engine first!');},()=>{});say('Stop the smoke, then help fresh air flow.');
  meter.hidden=false;
  animations.push((t,dt)=>{if(cheering||isDone())return;if(!stopped)fan.rotation.z=t*10;if(stopped&&isHeld())clear=Math.min(1,clear+dt/3);meter.firstChild.style.width=(clear*100)+'%';puffs.forEach((p,i)=>{p.position.x=1.7+(i%3)*.3+clear*.35;p.position.y=1+i*.17+Math.sin(t+i)*.05;p.scale.setScalar(.25*(1-clear*.7));});f.g.rotation.z=.2*(1-clear)+Math.sin(t*3)*clear*.05;if(clear>=1){puffs.forEach(p=>p.visible=false);cheering=true;busy=true;say('Clean air for Earth!');finish();}});
 }
}
