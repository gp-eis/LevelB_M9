import {buildEarthGames} from './earth-world-games.js?v=5';
import {buildWeekFour} from './week-four-world-games.js?v=5';
import {buildWeekThree} from './week-three-world-games.js?v=7';
import {buildWeekTwo} from './week-two-world-games.js?v=3';
// Six movement games share a poseable teddy, but use different actions and goals.
export function buildMovementGame(api){
 const {type,scene,shape,group,material,animations,target,add,hold,isHeld,isDone,goal,step,retry,say,finish,later,meter,reduced}=api;
 const fur=material('#c88951'),muzzle=material('#ffe2b7'),dark=material('#302b39'),white=material('#ffffff'),blue=material('#65bce9'),pink=material('#f6a2b9'),green=material('#79c57a'),yellow=material('#ffcf56');
 const bear=group(scene,-1,0,0);shape(bear,blue,0,.92,0,.36,.45,.27);shape(bear,fur,0,1.58,0,.43,.4,.35);
 for(const x of [-.33,.33]){shape(bear,fur,x,1.9,0,.15,.16,.12);shape(bear,muzzle,x,1.9,.1,.09,.1,.025);shape(bear,dark,x*.44,1.62,.325,.05,.065,.025);shape(bear,white,x*.44-.015,1.64,.346,.014,.018,.01);}
 shape(bear,muzzle,0,1.45,.31,.23,.16,.1);shape(bear,dark,0,1.5,.41,.065,.045,.035);
 const head=group(bear,0,1.58,0);
 for(const part of [...bear.children]){if(part!==head&&part.position.y>1.3){bear.remove(part);part.position.y-=1.58;head.add(part);}}
 const arms=[],legs=[];for(const x of [-.42,.42]){const arm=group(bear,x,1.17,0);shape(arm,fur,0,-.23,0,.11,.29,.12);shape(arm,muzzle,0,-.46,0,.12,.13,.12);arms.push(arm);const leg=group(bear,x*.5,.65,0);shape(leg,fur,0,-.22,0,.14,.28,.15);shape(leg,pink,0,-.48,.08,.17,.11,.22);legs.push(leg);}
 let clock=0,busy=false,cheer=0;const baseTilt=0;
 const good=()=>{cheer=clock+1;};
 function pose(run=false){arms.forEach((a,i)=>a.rotation.x=run?Math.sin(clock*12+i*Math.PI)*.7:Math.sin(clock*2)*.03);legs.forEach((a,i)=>a.rotation.x=run?Math.sin(clock*12-i*Math.PI)*.7:0);}
 animations.push((t)=>{clock=t;if(isDone()){if(!['swing','lift','strokes','cycle','swimRoute','dive'].includes(type)){arms[0].rotation.z=-2.2;arms[1].rotation.z=2.2;}bear.rotation.z=baseTilt+Math.sin(t*4)*.04;}else if(t<cheer){bear.rotation.z=baseTilt+Math.sin(t*8)*.06;}else bear.rotation.z=baseTilt;});
 if(type==='jump'){
  goal(3);let n=0,p=0;bear.position.x=-2.3;bear.rotation.y=1;
  const jump=()=>{if(busy)return;busy=true;p=0;say('Jump up high!');};add('🐾 Jump!',jump);target(bear,jump);say('Tap Jump to practice jumping.');
  animations.push((t,dt)=>{if(!busy||isDone())return;p=Math.min(1,p+dt*.95);bear.position.x=-2.3+n*1.55+p*1.55;bear.position.y=Math.sin(p*Math.PI)*1.1;arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*Math.sin(p*Math.PI));legs.forEach(l=>l.rotation.x=-Math.sin(p*Math.PI)*.5);if(p===1){busy=false;good();n++;if(n===3){say('Three lovely jumps!');finish();}else{step();say('Ready for another jump?');}}});
 }
 if(type==='swing'){
  goal(3);const wood=material('#98623f');const swing=group(scene,0,3.6,0);bear.position.set(0,-2.9,0);swing.add(bear);
  // Both hands and the hanging bar share the same pivot: grips never detach.
  shape(swing,wood,0,-.8,0,.76,.065,.065);
  for(const x of [-.63,.63])shape(swing,muzzle,x,-.4,0,.035,.8,.035,true);
  shape(scene,wood,-1.75,1.7,-.2,.2,1.8,.2);shape(scene,wood,0,3.65,-.2,2.1,.14,.14);
  for(const x of [-1.8,-.8,.3,1.4])shape(scene,green,x,3.9,-.35,.65,.4,.45);
  arms.forEach(a=>{a.position.y=1.3;a.scale.y=1.7;a.rotation.z=Math.PI;});
  let power=0,turns=0,next=0,points=0;const push=()=>{if(clock<next)return;power=Math.min(.5,power+.3);next=clock+.8;say('Hold the bar and swing!');};add('👐 Swing!',push);target(bear,push);say('Help teddy swing while holding the bar!');
  animations.push((t,dt)=>{swing.rotation.x=Math.sin(t*2.6)*power;power=Math.max(0,power-dt*.025);arms.forEach(a=>a.rotation.z=Math.PI);legs.forEach((l,i)=>l.rotation.x=.25+Math.sin(t*2.6+i*.2)*power*.5);if(!isDone()&&power>.15){turns+=dt;if(turns>=2){turns=0;if(++points===3){say('Great swinging!');finish();}else step();}}});
 }
 if(type==='track'){
  goal(3);let distance=0,checkpoint=0;bear.position.x=-2.4;bear.rotation.y=1.2;shape(scene,material('#e7bd87'),0,-.005,0,7,.025,1.6,true);for(const x of [-.8,.8,2.4])shape(scene,yellow,x,.05,.65,.07,.04,.16);
  const run=add('🏃 Hold to run',()=>{});hold(run,()=>say('Run, teddy, run!'),()=>{if(!isDone())say('Take a breath. Hold to run again!');});say('Hold Run to reach the finish flags!');
  animations.push((t,dt)=>{if(isDone())return;pose(isHeld());if(isHeld()){distance=Math.min(4.8,distance+dt*.85);bear.position.x=-2.4+distance;bear.position.y=Math.abs(Math.sin(t*12))*.08;if(distance>=(checkpoint+1)*1.6-.001){checkpoint++;good();if(checkpoint===3){say('You reached the finish!');finish();}else step();}}});
 }
 if(type==='climb'){
  goal(4);bear.position.set(-2,0,0);bear.rotation.y=1.2;
  shape(bear,green,0,.95,-.3,.31,.36,.2);shape(bear,yellow,0,1.2,-.48,.27,.12,.12);
  const stone=material('#aeb6ac'),pole=material('#5e5663');
  arms.forEach(a=>shape(a,pole,0,-.78,.06,.025,.36,.025));
  const points=[[-1.2,.2],[-.4,.4],[.4,.6],[1.2,.8]],holds=[];let n=0,p=0,start={x:0,y:0};
  points.forEach(([x,y],i)=>{shape(scene,green,x,y/2-.04,0,.55,y/2,.6);const rock=shape(scene,stone,x,y-.15,0,.48,.15,.55);holds.push(rock);const go=()=>{if(busy)return;if(i!==n){retry(null,'Choose the next stepping stone!');return;}busy=true;p=0;start={x:bear.position.x,y:bear.position.y};say('Climb up the rocky trail!');};target(rock,go);add('🥾 '+(i+1),go);});say('Choose the next stone to climb up the trail!');
  animations.push((t,dt)=>{holds.forEach((r,i)=>{r.material=stone;r.scale.x=i===n?.48+Math.sin(t*4)*.035:.48;});if(busy&&!isDone()){p=Math.min(1,p+dt);const [x,y]=points[n];bear.position.x=start.x+(x-start.x)*p;bear.position.y=start.y+(y-start.y)*p+Math.sin(p*Math.PI)*.1;arms.forEach((a,i)=>a.rotation.x=Math.sin(p*Math.PI*2+i*Math.PI)*.2);legs.forEach((l,i)=>l.rotation.x=Math.sin(p*Math.PI*2+i*Math.PI)*.5);if(p===1){busy=false;n++;legs.forEach(l=>l.rotation.x=0);arms.forEach(a=>a.rotation.x=0);if(n===4){say('You climbed the rocky trail!');finish();}else{step();say('Choose the next stepping stone!');}}}});
 }
 if(type==='lift'){
  goal(1);meter.hidden=false;let height=0;bear.position.x=0;
  const steel=material('#777d92'),plate=material('#8b67b8');const barbell=group(scene,0,.75,.5);
  shape(barbell,steel,0,0,0,1.15,.045,.045);for(const x of [-.87,.87]){shape(barbell,plate,x,0,0,.14,.32,.32);shape(barbell,dark,x*1.23,0,0,.09,.09,.09);}
  // Bent elbows and forearms end at the bar, so it stays in the hands.
  arms.forEach(a=>a.visible=false);
  const limbs=[-1,1].map(sign=>({sign,upper:shape(bear,fur,0,0,0,.11,.2,.11),fore:shape(bear,fur,0,0,0,.1,.2,.1),hand:shape(bear,muzzle,0,0,0,.12,.1,.1)}));
  function segment(mesh,a,b){const from=mesh.position.clone().set(...a),to=mesh.position.clone().set(...b),delta=to.clone().sub(from);mesh.position.copy(from.add(to).multiplyScalar(.5));mesh.scale.y=delta.length()/2;mesh.quaternion.setFromUnitVectors(delta.clone().set(0,1,0),delta.normalize());}
  const lift=add('💪 Hold to lift the barbell',()=>{});hold(lift,()=>say('Lift the barbell toward your shoulders!'),()=>{if(!isDone())say('Hold to lift the barbell again!');});say('Help teddy lift the barbell!');
  animations.push((t,dt)=>{if(!isDone())height=Math.max(0,Math.min(1,height+dt*(isHeld()?.24:-.3)));barbell.position.y=.75+height*.65;limbs.forEach(({sign,upper,fore,hand})=>{const shoulder=[sign*.38,1.17,0],elbow=[sign*.5,.79,.13],grip=[sign*.46,barbell.position.y,.5];segment(upper,shoulder,elbow);segment(fore,elbow,grip);hand.position.set(...grip);});meter.firstChild.style.width=height*100+'%';if(height===1&&!isDone()){say('You lifted the barbell!');finish();}});
 }
 if(type==='strokes'){
  goal(4);const swimmer=group(scene,0,.68,-.5);swimmer.add(bear);bear.position.set(0,-.2,0);bear.rotation.x=Math.PI/2;
  // The body floats prone; the neck raises and turns the head to breathe.
  head.rotation.x=-Math.PI/2;head.position.z=-.28;arms.forEach(a=>a.rotation.x=Math.PI);shape(scene,blue,0,.25,0,6,.28,5,true);
  const ripples=[];for(let i=0;i<8;i++)ripples.push(shape(scene,white,(i%2?1:-1)*(.65+(i%3)*.18),.405,-1.7+i*.45,.22,.008,.035));
  let expected=0,n=0,p=0,start=-.5,side=0;
  const stroke=i=>{if(busy)return;if(i!==expected){head.rotation.y=i?-.3:.3;retry(null,expected?'Try the right arm!':'Try the left arm!');return;}busy=true;p=0;side=i;start=swimmer.position.z;expected=1-expected;say(i?'Right arm! Turn and breathe.':'Left arm! Turn and breathe.');};
  add('👈 Left arm',()=>stroke(0));add('Right arm 👉',()=>stroke(1));say('Take turns with each arm. Turn your head to breathe!');
  animations.push((t,dt)=>{ripples.forEach((r,i)=>{r.position.x=(i%2?1:-1)*(.65+(i%3)*.18+Math.sin(t*3+i)*.06);});swimmer.position.y=.68+Math.sin(t*3)*.025;
   if(busy&&!isDone()){p=Math.min(1,p+dt*.85);swimmer.position.z=start+p*.2;const wave=Math.sin(p*Math.PI),sign=side?1:-1;arms[side].rotation.x=Math.PI+Math.PI*2*p;arms[side].rotation.z=sign*(.35+wave*.8);head.rotation.y=sign*wave*.65;head.rotation.x=-Math.PI/2+wave*.1;bear.rotation.y=sign*wave*.1;legs.forEach((l,i)=>l.rotation.x=Math.sin(t*12+i*Math.PI)*.25);
    if(p===1){busy=false;arms[side].rotation.x=Math.PI;arms[side].rotation.z=0;head.rotation.y=0;bear.rotation.y=0;n++;if(n===4){say('Wonderful swimming!');finish();}else{step();say(expected?'Now use the right arm!':'Now use the left arm!');}}}
  });
 }
 if(['race','dive','serve','cycle','swimRoute','skate'].includes(type))buildWeekTwo({...api,bear,head,arms,legs});
 if(['tennis','basket','volley','soccer','golf','baseball'].includes(type))buildWeekThree({...api,bear,head,arms,legs});
 if(['helmet','sneakers','bicycle','socks','gloves','swimsuit'].includes(type))buildWeekFour({...api,bear,head,arms,legs});
 if(['sun','plant','cleanWater','bloom','forest','insects','animals','air'].includes(type))buildEarthGames({...api,bear,head,arms,legs});
}
