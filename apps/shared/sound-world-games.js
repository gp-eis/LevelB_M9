import {buildBeeKitchen,beeKitchenTypes} from './bee-kitchen-games.js?v=5';
import {buildMovementGame} from './movement-world-games.js?v=23';
import * as T from './vendor/three.module.js';

export function mountSoundGame({type,stage,controls,button,status,goal,step,retry,asset}) {
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#bdeafa');renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 stage.classList.add('sound-playground');stage.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,60);camera.position.set(0,3.2,9);camera.lookAt(0,1.1,0);
 scene.add(new T.HemisphereLight(0xffffff,0x7c9a74,2.5));const sun=new T.DirectionalLight(0xffeed2,3);sun.position.set(-3,7,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;scene.add(sun);
 const materials=[],geometries=[],animations=[],targets=[],timers=new Set(),audios=[];
 let disposed=false,raf=0,done=false,locked=false,held=false,elapsed=0,last=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function material(c){const m=new T.MeshStandardMaterial({color:c,roughness:.65});materials.push(m);return m;}
 const cream=material('#fff0cd'),dark=material('#343044'),white=material('#ffffff'),pink=material('#ff9ab4'),green=material('#76c66a'),yellow=material('#ffd15c'),blue=material('#5bbcf2'),orange=material('#ed9955'),purple=material('#ad8ae6');
 function shape(p,m,x,y,z,sx,sy,sz,box=false){const g=box?new T.BoxGeometry(1,1,1):new T.SphereGeometry(1,24,16);geometries.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
 function outline(parent,mat,points,depth=.12){const path=new T.Shape();points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();const g=new T.ExtrudeGeometry(path,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1});geometries.push(g);const m=new T.Mesh(g,mat);m.castShadow=true;parent.add(m);return m;}
 function torus(parent,mat,x,y,z,r,tube){const g=new T.TorusGeometry(r,tube,10,40);geometries.push(g);const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
 function group(p=scene,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function eyes(p,y,z,spread=.16){for(const x of [-spread,spread]){shape(p,dark,x,y,z,.055,.075,.035);shape(p,white,x-.015,y+.025,z+.025,.018,.02,.012);}}
 shape(scene,green,0,-.18,0,15,.3,12,true);
 if(!['tea','spread','toast','pancakes','chicken','cookies'].includes(type))for(const x of [-3.7,3.7]){shape(scene,green,x,.4,-2,1,.7,.6);shape(scene,pink,x,.9,-1.8,.15,.15,.15);}
 const cue=document.createElement('div');cue.className='dog-cue';stage.append(cue);if(type==='helmet'){cue.style.top='auto';cue.style.bottom='8px';}
 const meter=document.createElement('div');meter.className='sound-meter';meter.innerHTML='<span></span>';stage.append(meter);meter.hidden=true;
 const say=t=>{cue.textContent=t;status.textContent=t;};
 function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn();},ms);timers.add(id);}
 function sound(slug,loop=false){audios.forEach(a=>a.pause());const a=new Audio(asset('keyword-audio/'+slug+'.mp3'));a.loop=loop;audios.push(a);a.play().catch(error=>{if(!disposed&&!done&&error.name!=='AbortError')status.textContent='Tap Listen to enable the sound.';});return a;}
 function finish(){if(done)return;done=true;held=false;audios.forEach(a=>a.pause());buttons.forEach(b=>b.disabled=true);step();}
 function target(obj,fn){targets.push({obj,fn});}
 const ray=new T.Raycaster(),point=new T.Vector2();renderer.domElement.onpointerdown=e=>{if(done||locked)return;const r=renderer.domElement.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(point,camera);const hits=targets.map(t=>({...t,hit:ray.intersectObject(t.obj,true)[0]})).filter(t=>t.hit).sort((a,b)=>a.hit.distance-b.hit.distance);hits[0]?.fn();};
 const buttons=[];function add(text,fn){const b=button(text,()=>{if(!done&&!locked)fn();});if(/Hold to|Visit branch|Brush glaze|Add honey|Stir|Plant tree|Switch engine|Hold Breeze|Stomp|Fasten|Check fit|Hold to spin|Pick!|Hit!|Bump!|Swing!|Dive!|Kick!|Hold, then|punch/i.test(text)){b.style.background='linear-gradient(#ffd85b,#f49a16)';b.style.boxShadow='0 5px 0 #bc6609';b.style.color='#573000';}buttons.push(b);return b;}
 function hold(b,start,stop){b.onclick=null;b.onpointerdown=e=>{if(done)return;held=true;b.setPointerCapture(e.pointerId);start();};b.onpointerup=b.onpointercancel=()=>{held=false;stop();};b.onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat&&!done){e.preventDefault();held=true;start();}};b.onkeyup=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();held=false;stop();}};b.onblur=()=>{held=false;stop();};}
 if(type==='wind'){
  goal(3);let charge=0,round=0,angle=0;meter.hidden=false;
  const cloud=group(scene,-2,2.5,-.5);for(let i=0;i<3;i++)shape(cloud,white,i*.35,Math.sin(i)*.14,0,.36,.3,.3);eyes(cloud,.05,.29);
  const spinner=group(scene,1,1.6,0);shape(scene,cream,1,.7,0,.1,1.4,.1,true);for(let i=0;i<4;i++){const blade=group(spinner);blade.rotation.z=i*Math.PI/2;shape(blade,[pink,blue,yellow,purple][i],0,.42,0,.21,.48,.08);}shape(spinner,yellow,0,0,.15,.16,.16,.1);
  const leaves=Array.from({length:7},(_,i)=>shape(scene,i%2?yellow:green,-3+i*.8,.7+(i%3)*.6,.6,.18,.07,.08));
  const b=add('🌬️ Hold to blow',()=>{});hold(b,()=>{sound('wind-blowing',true);say('The wind is blowing!');},()=>audios.forEach(a=>a.pause()));
  say('Hold to blow wind and spin the pinwheel!');animations.push((t,dt)=>{angle+=(held?8:1)*dt;spinner.rotation.z=-angle;cloud.position.y=2.5+Math.sin(t)*.05;cloud.scale.setScalar(held?1.08+Math.sin(t*9)*.025:1);leaves.forEach((l,i)=>{if(held){l.position.x+=dt*(2+i*.1);if(l.position.x>3.5)l.position.x=-3.5;l.rotation.z+=dt*3;}});if(held&&!done){charge+=dt;meter.firstChild.style.width=Math.min(100,charge/2*100)+'%';if(charge>=2){charge=0;round++;if(round===3){say('Wonderful wind!');finish();}else{step();say('Keep the wind blowing!');}}}});
 }
 if(type==='buzz'){
  goal(3);let next=0,travel=0,from=new T.Vector3(),destination=new T.Vector3(),flying=false;const flowers=[];
  const bee=group(scene,0,2,0);shape(bee,yellow,0,0,0,.35,.28,.48);for(const z of [-.22,.05,.25])shape(bee,dark,0,0,z,.355,.285,.06);shape(bee,yellow,0,0,.4,.28,.25,.23);eyes(bee,.06,.6,.11);const wings=[shape(bee,white,-.33,.25,0,.3,.055,.35),shape(bee,white,.33,.25,0,.3,.055,.35)];
  [-2,0,2].forEach((x,i)=>{const f=group(scene,x,.8,0);shape(f,green,0,-.4,0,.06,.5,.06);for(let j=0;j<6;j++){const a=j*Math.PI/3;shape(f,[pink,purple,blue][i],Math.cos(a)*.3,Math.sin(a)*.3,0,.22,.22,.1);}shape(f,yellow,0,0,.12,.2,.2,.13);flowers.push(f);const visit=()=>{if(i!==next){retry(null,'Find the glowing flower!');f.rotation.z=.2;later(()=>f.rotation.z=0,500);return;}flying=true;locked=true;travel=0;from.copy(bee.position);destination.set(x,1.15,.5);sound('bees-buzzing',true);say('Buzz, buzz! The bee is flying!');};target(f,visit);add(['🌸 Pink flower','💜 Purple flower','💙 Blue flower'][i],visit);});
  say('Tap the glowing flower. Help the bee collect pollen!');animations.push((t,dt)=>{wings.forEach((w,i)=>w.rotation.z=Math.sin(t*45)*(i?1:-1)*.6);flowers.forEach((f,i)=>f.scale.setScalar(i===next?1.08+Math.sin(t*4)*.06:1));if(flying){travel=Math.min(1,travel+dt*.8);bee.position.lerpVectors(from,destination,travel);bee.position.y+=Math.sin(travel*Math.PI)*.7;if(travel===1){flying=false;locked=false;audios.forEach(a=>a.pause());next++;if(next===3){say('Happy buzzing bee!');finish();}else{step();say('Find the next glowing flower!');}}}else bee.position.y+=Math.sin(t*5)*dt*.08;});
 }
 if(type==='baby'){
  goal(1);meter.hidden=false;let calm=0,cry=null;const cradle=group(scene,0,.85,0);cradle.scale.setScalar(1.6);shape(cradle,purple,0,-.3,0,2.3,.35,1.3,true);for(const x of [-1.1,1.1])shape(cradle,cream,x,.05,0,.15,.8,1.3,true);
  shape(cradle,white,0,-.06,.25,.8,.1,.48);for(const x of [-.95,.95])for(const z of [-.45,.45])shape(cradle,cream,x,.08,z,.04,.45,.04);
  const skin=material('#ffd0ab'),blush=material('#f5a2a2'),hair=material('#966342');
  const baby=group(cradle,0,.05,0);shape(baby,pink,0,.02,-.12,.45,.25,.63);
  const head=group(baby,0,.5,.28);shape(head,skin,0,0,0,.43,.41,.37);
  for(const x of [-.43,.43])shape(head,skin,x,-.025,0,.09,.13,.095);
  for(const x of [-.15,.15]){shape(head,dark,x,.035,.35,.065,.083,.035);shape(head,white,x-.018,.063,.38,.022,.025,.012);shape(head,blush,x*1.6,-.12,.295,.09,.045,.025);}
  shape(head,skin,0,-.075,.385,.065,.05,.055);shape(head,hair,.035,.385,-.005,.075,.08,.07);
  const mouth=shape(head,dark,0,-.205,.325,.058,.065,.02);
  const tears=[shape(head,blue,-.24,-.08,.325,.025,.055,.018),shape(head,blue,.24,-.08,.325,.025,.055,.018)];
  for(const x of [-.4,.4])shape(baby,skin,x,.12,.28,.1,.1,.12);
  shape(baby,white,0,.16,.42,.13,.04,.04);

  const listen=add('👂 Hear the baby',()=>{cry=sound('baby-crying',true);say('The baby is crying. Rock gently.');});const rock=add('🤲 Hold to rock gently',()=>{});hold(rock,()=>{if(!cry)cry=sound('baby-crying',true);say('Gently rocking…');},()=>{});say('Hear the baby crying. Hold to rock the cradle.');
  animations.push((t,dt)=>{cradle.rotation.z=held&&!reduced?Math.sin(t*3)*.12:Math.sin(t)*.015;tears.forEach((tear,i)=>{tear.visible=!done;tear.position.y=-.08-(t*.65+i*.5)%1*.12;});mouth.scale.y=done?.018:.055+Math.sin(t*5)*.008;if(held&&!done){calm=Math.min(1,calm+dt/5);meter.firstChild.style.width=calm*100+'%';if(cry)cry.volume=1-calm*.85;if(calm===1){say('The baby feels better!');finish();}}});
 }
 if(type==='birds'){
  goal(4);const order=[0,2,1,0],birds=[];let next=0,singing=-1,until=0;
  shape(scene,orange,0,.6,0,6,.15,.2,true);
  [-2,0,2].forEach((x,i)=>{const bird=group(scene,x,1.1,0);shape(bird,[blue,pink,yellow][i],0,0,0,.4,.48,.35);shape(bird,[blue,pink,yellow][i],0,.45,.08,.3,.3,.28);eyes(bird,.5,.33,.1);const beak=shape(bird,orange,0,.38,.4,.1,.06,.12);const wings=[shape(bird,[blue,pink,yellow][i],-.36,.05,0,.12,.3,.26),shape(bird,[blue,pink,yellow][i],.36,.05,0,.12,.3,.26)];birds.push({bird,beak,wings});const sing=()=>{singing=i;until=performance.now()+1500;locked=true;later(()=>{if(!done)locked=false;},1600);sound('birds-three-chirps-cc0');if(i!==order[next]){retry(null,'Look for the bouncing bird!');return;}next++;if(next===4){say('What a lovely chirping song!');locked=true;later(finish,1600);}else{step(null,true);say('Now tap the next bouncing bird!');}};target(bird,sing);add(['🐦 Blue bird','🐦 Pink bird','🐦 Yellow bird'][i],sing);});
  say('Tap the bouncing bird to make a chirping song!');animations.push(t=>birds.forEach(({bird,beak,wings},i)=>{const active=!done&&i===order[next],song=i===singing&&performance.now()<until;bird.position.y=1.1+(active?Math.abs(Math.sin(t*4))*.22:0);beak.scale.y=song?.06+Math.abs(Math.sin(t*25))*.09:.06;wings.forEach((w,k)=>w.rotation.z=(k?1:-1)*(song?Math.sin(t*20)*.6:.1));}));
 }
 if(type==='cat'){
  goal(3);let round=0,answer=Math.floor(Math.random()*3),revealed=-1;const doors=[],cats=[];
  [-2,0,2].forEach((x,i)=>{const house=group(scene,x,0,0);shape(house,[blue,pink,purple][i],0,.85,-.9,1.5,1.7,.4,true);const pivot=group(house,-.65,0,.05);shape(pivot,cream,.65,.8,0,1.3,1.6,.12,true);shape(pivot,yellow,1.1,.8,.13,.07,.07,.06);doors.push(pivot);
   const cat=group(house,0,.55,-.4);shape(cat,orange,0,0,0,.3,.4,.28);shape(cat,orange,0,.43,.04,.36,.29,.25);for(const xx of [-.24,.24]){const e=shape(cat,orange,xx,.68,.02,.11,.22,.12);e.rotation.z=xx>0?-.3:.3;}eyes(cat,.46,.27,.12);shape(cat,pink,0,.36,.3,.05,.04,.025);const mouth=shape(cat,dark,0,.28,.28,.055,.025,.02);const tail=shape(cat,orange,.3,-.05,-.15,.08,.3,.08);cat.userData.mouth=mouth;cat.userData.tail=tail;cats.push(cat);
   const open=()=>{if(revealed>=0)return;revealed=i;locked=true;if(i===answer){sound('cat-meowing');say('You found the meowing cat!');round++;later(()=>{if(round===3){finish();return;}step();answer=(answer+1+Math.floor(Math.random()*2))%3;revealed=-1;locked=false;say('Where is the cat now? Listen and look!');},1300);}else{retry(null,'An empty door! Try another one.');later(()=>{revealed=-1;locked=false;say('Listen and look for the wiggling door!');},1000);}};target(pivot,open);add(['🚪 Blue door','🚪 Pink door','🚪 Purple door'][i],open);});
  add('👂 Listen for meow',()=>sound('cat-meowing'));say('Find the meowing cat behind the wiggling door!');animations.push((t,dt)=>{doors.forEach((d,i)=>{const desired=revealed===i?-1.8:0;d.rotation.y+=(desired-d.rotation.y)*Math.min(1,dt*8);if(revealed<0&&i===answer)d.rotation.y=Math.sin(t*6)*.065;});cats.forEach((c,i)=>{c.visible=i===answer;c.position.y=.55+(revealed===i?Math.abs(Math.sin(t*5))*.08:0);c.userData.mouth.scale.y=revealed===i?.025+Math.abs(Math.sin(t*12))*.055:.025;c.userData.tail.rotation.z=Math.sin(t*6)*.35;});});
 }
 if(['jump','swing','track','climb','lift','strokes','race','dive','serve','cycle','swimRoute','skate','tennis','basket','volley','soccer','golf','baseball','helmet','sneakers','bicycle','socks','gloves','swimsuit','sun','plant','cleanWater','bloom','forest','insects','animals','air'].includes(type))buildMovementGame({type,scene,shape,torus,outline,group,material,animations,target,add,hold,isHeld:()=>held,isDone:()=>done,goal,step,retry,say,finish,later,meter,reduced});
 if(beeKitchenTypes.includes(type))buildBeeKitchen({type,scene,shape,torus,outline,group,material,animations,target,add,hold,isHeld:()=>held,isDone:()=>done,goal,step,retry,say,finish,later,meter});
 const bar=controls(...buttons);const blur=()=>{held=false;audios.forEach(a=>a.pause());};window.addEventListener('blur',blur);
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w/h<1.3?10:7.5;camera.position.x=['strokes','swimRoute','serve','tennis','volley'].includes(type)?3:0;if(type==='soccer'){camera.position.set(0,5,w/h<1.3?11:8.5);}if(type==='dive'){camera.position.set(0,4.2,w/h<1.3?12.5:10.5);}camera.lookAt(0,type==='dive'?2:type==='swing'?1.7:1.1,0);if(type==='helmet'){camera.position.set(0,1.9,w/h<1.3?3.8:3.3);camera.lookAt(0,1.55,.3);}if(['sun','plant','cleanWater','bloom','forest','insects','animals','air'].includes(type)){
 const wide=['cleanWater','forest'].includes(type);const cx=type==='air'?1.1:wide?.4:.6;
 camera.position.set(cx,wide?3.5:2.7,wide?(w/h<1.3?8.7:7):(w/h<1.3?6.8:5.4));
 camera.lookAt(cx,type==='air'?1.1:type==='sun'?1.2:.65,.3);
 }if(beeKitchenTypes.includes(type)){const kitchen=['tea','spread','toast','pancakes','chicken','cookies'].includes(type);const close=['tea','spread'].includes(type);camera.position.set(0,kitchen?(close?2.45:2.9):3,close?(w/h<1.3?3.5:2.7):(w/h<1.3?(kitchen?5.4:6.5):kitchen?3.3:5.8));camera.lookAt(0,type==='sky'?1.2:type==='pancakes'?.85:kitchen?.4:.7,0);}camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 function draw(now){if(disposed)return;const dt=Math.min(.05,(now-last)/1000||0);last=now;elapsed+=dt;animations.forEach(fn=>fn(elapsed,dt));renderer.render(scene,camera);raf=requestAnimationFrame(draw);}raf=requestAnimationFrame(draw);
 return ()=>{disposed=true;window.removeEventListener('blur',blur);cancelAnimationFrame(raf);timers.forEach(clearTimeout);audios.forEach(a=>a.pause());observer.disconnect();buttons.forEach(b=>{b.onpointerdown=b.onpointerup=b.onpointercancel=b.onkeydown=b.onkeyup=b.onblur=null;});renderer.domElement.onpointerdown=null;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();cue.remove();meter.remove();bar.remove();};
}

