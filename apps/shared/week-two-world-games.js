// Week 2 actions follow the approved book-video clips.
export function buildWeekTwo(api){
 const {type,scene,shape,torus,group,material,animations,target,add,hold,isHeld,isDone,goal,step,retry,say,finish,later,meter,bear,head,arms,legs}=api;
 const white=material('#fff9ed'),blue=material('#56b9ec'),pink=material('#f298b8'),green=material('#83ce83'),yellow=material('#ffce55'),dark=material('#38384b'),metal=material('#b7c4d8'),red=material('#ed7965');
 const strap=(mesh,a,b)=>{const from=mesh.position.clone().set(...a),to=mesh.position.clone().set(...b),delta=to.clone().sub(from);mesh.position.copy(from.add(to).multiplyScalar(.5));mesh.scale.y=delta.length()/2;mesh.quaternion.setFromUnitVectors(delta.clone().set(0,1,0),delta.normalize());};
 function rod(parent,mat,a,b,r=.035){const m=shape(parent,mat,0,0,0,r,.1,r);strap(m,a,b);return m;}
 function circle(parent,mat,x,y,z,r,thick=.035){return torus(parent,mat,x,y,z,r,thick);}
 function runPose(t){arms.forEach((a,i)=>a.rotation.x=Math.sin(t*11+i*Math.PI)*.65);legs.forEach((a,i)=>a.rotation.x=Math.sin(t*11-i*Math.PI)*.65);}
 function pool(){shape(scene,blue,0,.12,0,7,.2,4.8,true);for(const z of [-1.8,1.8])for(let i=0;i<17;i++)shape(scene,i%2?white:blue,-3.2+i*.4,.27,z,.12,.09,.09);}
 if(type==='race'){
  goal(3);let phase='ready',distance=0,checkpoint=0;bear.position.x=-2.5;bear.rotation.y=1.2;
  shape(scene,red,0,-.01,0,7,.025,2.6,true);for(const z of [-.8,.8])shape(scene,white,0,.015,z,7,.015,.035,true);shape(scene,white,2.5,.02,0,.1,.025,1.6,true);
  const light=shape(scene,red,-2.5,2.4,-.5,.15,.15,.15);shape(scene,dark,-2.5,1.3,-.5,.04,1.1,.04);
  add('🚦 Ready!',()=>{if(phase!=='ready')return;phase='wait';say('Ready… wait for green!');later(()=>{phase='go';light.material=green;say('Green! Hold Run!');},1500);});
  const run=add('🏃 Hold Run',()=>{});hold(run,()=>{if(phase!=='go')retry(null,'Wait for the green light!');else say('Run to the finish!');},()=>{if(!isDone()&&phase==='go')say('Hold Run to keep going!');});say('Tap Ready. Wait for green, then hold Run.');
  animations.push((t,dt)=>{if(isDone())return;if(phase==='go'&&isHeld()){distance=Math.min(5,distance+dt*.9);bear.position.x=-2.5+distance;bear.position.y=Math.abs(Math.sin(t*11))*.07;runPose(t);if(distance>=(checkpoint+1)*5/3-.001){checkpoint++;if(checkpoint===3){say('You finished the race!');finish();}else step();}}});
 }
 if(type==='dive'){
  goal(1);pool();
  // Separate heading and forward pitch so the dive cannot become a sideways roll.
  const diver=group(scene,-1.65,3.25,0);diver.rotation.y=Math.PI/2;
  const pitch=group(diver,0,0,0);pitch.add(bear);bear.position.set(0,-.95,0);bear.rotation.set(0,0,0);
  shape(scene,pink,-2.3,2.22,0,1.9,.16,.85,true);
  for(const z of [-.32,.32]){rod(scene,metal,[-3,0,z],[-3,2.22,z],.065);}
  for(let y=.25;y<2.2;y+=.35)rod(scene,white,[-3,y,-.32],[-3,y,.32],.035);
  let phase='ready',p=0;
  const splash=group(scene,1.4,.24,0),drops=[];
  for(let i=0;i<12;i++)drops.push(shape(splash,white,0,0,0,.05,.07,.05));splash.visible=false;
  function streamlined(){arms.forEach((a,i)=>{a.position.set(i?.28:-.28,1.3,0);a.scale.y=1.7;a.rotation.set(0,0,i?2.85:-2.85);});legs.forEach(l=>l.rotation.set(0,0,0));}
  const dive=()=>{if(phase!=='ready')return;phase='prepare';p=0;streamlined();say('Arms up… jump and dive!');};
  add('🤿 Dive!',dive);target(bear,dive);say('Tap Dive to spring from the high diving board.');
  animations.push((t,dt)=>{
   if(phase==='prepare'){p=Math.min(1,p+dt*2);streamlined();diver.position.y=3.25-Math.sin(p*Math.PI)*.15;if(p===1){phase='dive';p=0;}}
   else if(phase==='dive'){
    p=Math.min(1,p+dt*.42);streamlined();
    diver.position.set(-1.65+3.05*Math.sin(p*Math.PI/2),3.25+1.5*p-6.4*p*p,0);
    const turn=Math.min(1,p/.72);pitch.rotation.x=Math.PI*turn*turn*(3-2*turn);
    splash.visible=p>.72;
    drops.forEach((d,i)=>{const a=i/12*Math.PI*2,q=Math.max(0,(p-.72)/.28);d.position.set(Math.cos(a)*q*.7,Math.sin(q*Math.PI)*.7,Math.sin(a)*q*.7);});
    if(p===1){phase='surface';p=0;pitch.rotation.x=0;diver.rotation.y=0;diver.position.y=-1.3;arms.forEach((a,i)=>{a.position.set(i?.42:-.42,1.17,0);a.scale.y=1;a.rotation.set(0,0,0);});}
   }else if(phase==='surface'){p=Math.min(1,p+dt*.8);diver.position.y=-1.3+p*1.4;splash.visible=p<.5;if(p===1){phase='done';say('Splash! Great diving!');finish();}}
  });
 }
 if(type==='serve'){
  goal(3);bear.position.x=-1.7;bear.rotation.y=.65;shape(scene,green,0,0,0,7,.025,3,true);
  for(const z of [-1.2,1.2])rod(scene,white,[.7,0,z],[.7,1.3,z],.035);for(let i=0;i<7;i++)rod(scene,white,[.7,.5+i*.12,-1.2],[.7,.5+i*.12,1.2],.012);for(let i=0;i<13;i++)rod(scene,white,[.7,.5,-1.2+i*.2],[.7,1.3,-1.2+i*.2],.012);
  arms[1].rotation.z=2.35;const racket=group(arms[1],0,-.65,0);rod(racket,dark,[0,.25,0],[0,-.15,0]);circle(racket,pink,0,-.4,0,.28,.035);for(const x of [-.15,0,.15])rod(racket,white,[x,-.6,0],[x,-.2,0],.009);for(const y of [-.55,-.4,-.25])rod(racket,white,[-.2,y,0],[.2,y,0],.009);
  const shuttle=group(scene,2.5,2,0);shape(shuttle,yellow,0,0,0,.075,.09,.075);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const f=shape(shuttle,white,Math.cos(a)*.08,.16,Math.sin(a)*.08,.045,.16,.035);f.rotation.z=-Math.cos(a)*.25;}
  let phase='ready',p=0,n=0,hitX=-.8,hitY=1.6;const send=()=>{if(phase!=='ready')return;phase='incoming';p=0;say('Watch the shuttlecock. Hit when it comes close!');};add('🏸 Send shuttlecock',send);
  add('✨ Hit!',()=>{if(phase!=='incoming'||p<.8){retry(null,'Wait until the shuttlecock is close!');return;}hitX=shuttle.position.x;hitY=shuttle.position.y;phase='return';p=0;say('Hit it over the net!');});say('Send a shuttlecock, then hit it when it is close.');
  animations.push((t,dt)=>{if(phase==='incoming'){p=Math.min(1,p+dt*(p<.8?.35:.04));if(p>=.8)say('Hit now!');shuttle.position.set(2.5-3.3*p,1.6+Math.sin(p*Math.PI)*.6,0);if(p===1){phase='ready';retry(null,'Try again—send another shuttlecock!');say('Send another shuttlecock and try again!');}}else if(phase==='return'){p=Math.min(1,p+dt*.8);arms[1].rotation.x=-Math.sin(p*Math.PI)*2;shuttle.position.set(hitX+(3-hitX)*p,hitY+(1.2-hitY)*p+Math.sin(p*Math.PI)*1.2,0);if(p===1){n++;arms[1].rotation.x=0;phase='ready';if(n===3){phase='done';say('Three great badminton hits!');finish();}else{step();say('Send the next shuttlecock!');}}}});
 }
 if(type==='cycle'){
  goal(3);const bike=group(scene,-2.2,0,0);bike.add(bear);bear.position.set(-.25,.5,0);bear.scale.setScalar(.8);bear.rotation.y=Math.PI/2;
  const wheels=[];for(const x of [-.7,.7]){const w=circle(bike,dark,x,.47,0,.44,.055);circle(w,metal,0,0,0,.34,.014);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;rod(w,white,[0,0,0],[Math.cos(a)*.38,Math.sin(a)*.38,0],.012);}wheels.push(w);}
  for(const [a,b] of [[[ -.7,.47,0],[-.25,.95,0]],[[-.25,.95,0],[.1,.47,0]],[[.1,.47,0],[-.7,.47,0]],[[.1,.47,0],[.55,1.05,0]],[[.55,1.05,0],[-.25,.95,0]],[[.55,1.05,0],[.7,.47,0]]])rod(bike,pink,a,b,.045);
  shape(bike,dark,-.25,1,0,.23,.06,.16);rod(bike,metal,[.55,1.05,0],[.55,1.3,0]);rod(bike,dark,[.55,1.3,-.3],[.55,1.3,.3]);shape(head,pink,0,.27,0,.46,.2,.37);
  arms.forEach(a=>a.visible=false);legs.forEach(l=>l.visible=false);
  const joints=[-1,1].map(sign=>({sign,upper:shape(bike,pink,0,0,0,.09,.2,.09),fore:shape(bike,white,0,0,0,.075,.2,.075),thigh:shape(bike,pink,0,0,0,.1,.2,.1),shin:shape(bike,white,0,0,0,.08,.2,.08),shoe:shape(bike,pink,0,0,0,.16,.08,.1),pedal:shape(bike,dark,0,0,0,.18,.035,.12,true)}));
  shape(scene,material('#c4c2ae'),0,-.005,0,7,.025,3,true);
  let distance=0,n=0,spin=0;const pedal=add('🚴 Hold to pedal',()=>{});hold(pedal,()=>say('Pedal the bicycle!'),()=>{if(!isDone())say('Hold to keep pedaling!');});say('Hold Pedal to cycle past three flags.');
  for(const x of [-.7,.7,2.1]){rod(scene,white,[x,0,-1],[x,1,-1]);shape(scene,yellow,x+.15,.85,-1,.3,.25,.025,true);}
  animations.push((t,dt)=>{joints.forEach(j=>{const s=j.sign,theta=-spin+(s>0?Math.PI:0),foot=[.1+Math.cos(theta)*.2,.47+Math.sin(theta)*.2,s*.23],knee=[.05,.77,s*.23];strap(j.upper,[-.25,1.436,s*.336],[.12,1.2,s*.3]);strap(j.fore,[.12,1.2,s*.3],[.55,1.3,s*.3]);strap(j.thigh,[-.25,1.02,s*.17],knee);strap(j.shin,knee,foot);j.shoe.position.set(foot[0],foot[1]+.07,foot[2]);j.pedal.position.set(...foot);});if(isDone())return;if(isHeld()){spin+=dt*7;distance=Math.min(4.4,distance+dt*.7);bike.position.x=-2.2+distance;wheels.forEach(w=>w.rotation.z=-spin);legs.forEach((l,i)=>l.rotation.x=.9+Math.sin(spin+i*Math.PI)*.6);if(distance>=(n+1)*4.4/3-.001){n++;if(n===3){say('Great cycling!');finish();}else step();}}});
 }
 if(type==='swimRoute'){
  goal(3);pool();const swimmer=group(scene,0,.68,-1);swimmer.add(bear);bear.position.set(0,-.2,0);bear.rotation.x=Math.PI/2;head.rotation.x=-Math.PI/2;head.position.z=-.28;arms.forEach(a=>a.rotation.x=Math.PI);shape(head,dark,0,.26,0,.44,.2,.36);
  const goggles=group(head,0,.04,.36);for(const x of [-.15,.15]){circle(goggles,blue,x,0,0,.1,.025);}rod(goggles,blue,[-.05,0,0],[.05,0,0],.015);
  const floats=[-1,0,1].map((x,i)=>{const f=circle(scene,yellow,x,.28,.1+i*.45,.23,.045);f.rotation.x=-Math.PI/2;return f;});
  let n=0,p=0,busy=false,startX=0,startZ=-1;
  floats.forEach((f,i)=>{const swim=()=>{if(busy)return;if(i!==n){retry(null,'Swim to the next yellow float!');return;}busy=true;p=0;startX=swimmer.position.x;startZ=swimmer.position.z;say('Swim to the float!');};target(f,swim);add('🏊 Float '+(i+1),swim);});say('Choose Float 1, then 2, then 3.');
  animations.push((t,dt)=>{if(isDone())return;floats.forEach((f,i)=>f.position.y=.28+Math.sin(t*3+i)*.015);if(busy){p=Math.min(1,p+dt*.55);const f=floats[n];swimmer.position.x=startX+(f.position.x-startX)*p;swimmer.position.z=startZ+(.1+n*.45-1.2-startZ)*p;arms.forEach((a,i)=>a.rotation.x=Math.PI+t*6+i*Math.PI);head.rotation.y=Math.sin(t*3)*.45;legs.forEach((l,i)=>l.rotation.x=Math.sin(t*10+i*Math.PI)*.2);if(p===1){busy=false;f.visible=false;arms.forEach(a=>a.rotation.x=Math.PI);n++;if(n===3){say('You swam to every float!');finish();}else{step();say('Choose the next float!');}}}});
 }
 if(type==='skate'){
  goal(4);shape(scene,material('#c5e7f5'),0,.015,0,7,.035,4,true);bear.position.x=-2;bear.rotation.y=1.1;
  legs.forEach(l=>{shape(l,white,0,-.5,.08,.18,.14,.24);rod(l,metal,[0,-.67,-.1],[0,-.67,.3],.025);});bear.position.y=.15;
  let expected=0,n=0,busy=false,p=0,start=-2;const glide=i=>{if(busy)return;if(i!==expected){retry(null,expected?'Push with the right skate!':'Push with the left skate!');return;}busy=true;p=0;start=bear.position.x;expected=1-expected;say('Push and glide on the ice!');};add('⛸️ Left skate',()=>glide(0));add('Right skate ⛸️',()=>glide(1));say('Push with left, then right, to glide across the ice.');
  animations.push((t,dt)=>{arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*1.1);if(busy&&!isDone()){p=Math.min(1,p+dt*.85);bear.position.x=start+p;legs[1-expected].rotation.z=(expected?-.4:.4)*Math.sin(p*Math.PI);legs[1-expected].rotation.x=Math.sin(p*Math.PI)*.35;bear.rotation.z=Math.sin(p*Math.PI)*(expected?.09:-.09);if(p===1){busy=false;n++;legs.forEach(l=>{l.rotation.x=0;l.rotation.z=0;});if(n===4){say('Lovely ice skating!');finish();}else{step();say(expected?'Now push with the right skate!':'Now push with the left skate!');}}}});
 }
}
