// Interactive sports with continuous ball paths and attached equipment.
export function buildWeekThree(api){
 const {type,scene,shape,torus,group,material,animations,add,hold,isHeld,isDone,goal,step,retry,say,finish,later,meter,bear,head,arms,legs}=api;
 const white=material('#fff9ee'),dark=material('#354052'),pink=material('#f19db7'),orange=material('#f5a044'),yellow=material('#d7ed58'),blue=material('#62bce7'),green=material('#7fc77b');
 const rod=(parent,mat,a,b,r=.025)=>{const m=shape(parent,mat,0,0,0,r,1,r),v=m.position.clone().set(...b).sub(m.position.clone().set(...a));m.position.set(...a).addScaledVector(v,.5);m.scale.y=v.length()/2;m.quaternion.setFromUnitVectors(v.clone().set(0,1,0),v.normalize());return m;};
 const ball=group(scene,0,.25,0);const radius=type==='golf'?.09:type==='tennis'?.12:type==='baseball'?.14:.21;shape(ball,type==='basket'?orange:type==='tennis'?yellow:white,0,0,0,radius,radius,radius);
 if(['basket','volley','soccer','baseball'].includes(type))for(let i=0;i<3;i++){const seam=torus(ball,type==='soccer'?dark:blue,0,0,0,radius+.002,.009);seam.rotation.set(i*Math.PI/2,0,i===2?Math.PI/2:0);}
 bear.position.set(-1.65,0,0);bear.rotation.y=.65;
 shape(scene,type==='golf'?green:material('#e6c690'),0,-.01,0,7,.025,3.6,true);
 let phase='ready',p=0,n=0,power=0,aim=1,contact=null,hitPoint=null,soccerGoal=null,goalLane=1,selectedLane=1,shotStartX=.6,batRig=null,batArms=[],celebrateTime=0;
 const complete=()=>{n++;if(n===3||type==='golf'){say('Great '+({basket:'basketball',volley:'volleyball'}[type]||type)+'!');if(type==='soccer'){phase='celebrate';celebrateTime=0;later(finish,2200);}else finish();}else{step();phase='ready';say('Great! Try the next one.');}};
 const net=()=>{for(const z of [-1.3,1.3])rod(scene,white,[.8,0,z],[.8,1.7,z],.04);for(let i=0;i<8;i++)rod(scene,white,[.8,.7+i*.14,-1.3],[.8,.7+i*.14,1.3],.012);for(let i=0;i<14;i++)rod(scene,white,[.8,.7,-1.3+i*.2],[.8,1.7,-1.3+i*.2],.012);};
 function launch(){phase='flight';p=0;}
 goal(type==='golf'?1:3);
 if(type==='tennis'){
  net();arms[1].rotation.z=2.3;const racket=group(arms[1],0,-.65,0);rod(racket,dark,[0,.2,0],[0,-.2,0]);torus(racket,pink,0,-.45,0,.3,.035);hitPoint=group(racket,0,-.45,0);for(let i=-2;i<=2;i++){rod(racket,white,[i*.09,-.67,0],[i*.09,-.23,0],.008);rod(racket,white,[-.22,-.45+i*.09,0],[.22,-.45+i*.09,0],.008);}
  ball.position.set(2.6,.3,0);
  add('🎾 Send ball',()=>{if(phase!=='ready')return;phase='incoming';p=0;say('Watch the bounce…');});
  add('✨ Hit!',()=>{if(phase!=='incoming'||p<.78){retry(null,'Wait until the ball is near the racket!');return;}contact=ball.position.clone();launch();say('Return it over the net!');});say('Send a ball, then hit when it is close.');
 }else if(type==='basket'){
  bear.rotation.y=Math.PI/2;arms.forEach((a,i)=>a.position.x=i?.15:-.15);shape(scene,white,2.5,2.5,-.15,1.1,.8,.12,true);rod(scene,dark,[2.5,0,-.4],[2.5,2.7,-.4],.05);const hoop=torus(scene,orange,2.5,2.1,.25,.37,.035);hoop.rotation.x=Math.PI/2;for(let i=0;i<10;i++){const a=i*Math.PI/5;rod(scene,white,[2.5+Math.cos(a)*.36,2.1,.25+Math.sin(a)*.36],[2.5+Math.cos(a)*.2,1.6,.25+Math.sin(a)*.2],.012);}
  meter.hidden=false;const shoot=add('🏀 Hold, then release',()=>{});hold(shoot,()=>{if(phase==='ready'){power=0;say('Fill the bar, then release!');}},()=>{if(phase!=='ready')return;if(power<.55){retry(null,'Hold a little longer to reach the hoop!');return;}launch();say('Up and into the basket!');});say('Hold until the bar is green. Release to shoot.');
 }else if(type==='volley'){
  net();bear.position.x=-1.5;bear.rotation.y=Math.PI/2;arms.forEach((a,i)=>{a.position.x=i?.13:-.13;a.rotation.x=-1.5;a.rotation.z=0;});hitPoint=group(bear,0,1.18,.58);ball.position.set(2.5,2.6,0);
  add('🏐 Send ball',()=>{if(phase!=='ready')return;phase='incoming';p=0;say('Get your arms ready!');});add('👐 Bump!',()=>{if(phase!=='incoming'||p<.78){retry(null,'Wait for the ball to reach your arms!');return;}contact=ball.position.clone();launch();say('Straight arms—bump over the net!');});say('Send the ball. Bump it with both forearms.');
 }else if(type==='soccer'){
  bear.position.set(0,0,2.1);bear.scale.setScalar(.85);bear.rotation.y=Math.PI;ball.position.set(.18,.21,1.42);
  shape(scene,green,0,0,-.6,7,.025,7,true);
  soccerGoal=group(scene,0,0,-2.2);
  for(const x of [-.8,.8]){rod(soccerGoal,white,[x,0,0],[x,1.5,0],.055);rod(soccerGoal,white,[x,1.5,0],[x,0,-.6],.035);}
  rod(soccerGoal,white,[-.8,1.5,0],[.8,1.5,0],.055);
  for(let i=0;i<9;i++)rod(soccerGoal,white,[-.8+i*.2,0,-.6],[-.8+i*.2,1.5,-.6],.012);
  for(let i=0;i<8;i++)rod(soccerGoal,white,[-.8,i*.2,-.6],[.8,i*.2,-.6],.012);
  const lanes=[-2,0,2];goalLane=0;aim=-1;
  [['⬅️ Left',-1],['Right ➡️',1]].forEach(([label,direction])=>add(label,()=>{if(phase!=='ready')return;selectedLane=Math.max(0,Math.min(2,selectedLane+direction));aim=selectedLane;say('Move '+(direction<0?'left':'right')+' to line up with the goal.');}));
  const kickButton=add('⚽ Kick!',()=>{if(phase!=='ready')return;if(Math.abs(bear.position.x-(selectedLane-1)*2)>.03){say('Let teddy reach the spot first!');return;}if(selectedLane!==goalLane){retry(null,'Move left or right to line up with the goal!');return;}aim=selectedLane;shotStartX=ball.position.x;launch();say('Ready… kick!');});kickButton.style.background='linear-gradient(#ffd85b,#f49a16)';kickButton.style.boxShadow='0 5px 0 #bc6609';kickButton.style.color='#573000';say('Move left or right. Line up, then kick!');
 }else if(type==='golf'){
  bear.position.set(-1.3,0,.42);bear.rotation.y=Math.PI/2;ball.position.set(-.7,.09,0);const hole=shape(scene,dark,2.3,.025,0,.18,.018,.18);rod(scene,white,[2.3,0,0],[2.3,1.4,0],.025);shape(scene,pink,2.55,1.23,0,.5,.3,.03,true);
  const club=group(arms[1],0,-.5,0);rod(club,metal(),[0,0,0],[0,-.68,.25],.025);shape(club,dark,0,-.68,.25,.24,.07,.1,true);arms[1].rotation.x=-.3;
  meter.hidden=false;const putt=add('⛳ Hold, then putt',()=>{});hold(putt,()=>{if(phase==='ready'){power=0;say('Fill the bar for one careful putt!');}},()=>{if(phase!=='ready')return;if(power<.55){retry(null,'Hold a little longer, then release.');return;}launch();say('One smooth putt!');});say('Hold until green, then release to putt.');
 }else if(type==='baseball'){
  bear.position.set(-1.5,0,.3);bear.rotation.y=0;legs.forEach((l,i)=>{l.position.x=i?.32:-.32;l.rotation.z=i?-.12:.12;});
  const teeX=.2;rod(scene,dark,[teeX,0,.3],[teeX,1,.3],.055);shape(scene,dark,teeX,.035,.3,.3,.035,.3);ball.position.set(teeX,1.15,.3);
  arms.forEach(a=>a.visible=false);
  batRig=group(scene,-1,1.15,.3);rod(batRig,orange,[.08,0,0],[1.2,0,0],.065);shape(batRig,dark,.05,0,0,.07,.08,.08);
  for(let i=0;i<2;i++){const hand=shape(batRig,white,.1+i*.18,0,0,.1,.1,.1);batArms.push({hand,upper:rod(scene,pink,[0,0,0],[0,1,0],.1),fore:rod(scene,white,[0,0,0],[0,1,0],.085),i});}
  batRig.rotation.y=-1.2;batRig.rotation.z=.7;head.rotation.y=.7;
  add('👣 Get ready',()=>{if(phase!=='ready')return;phase='set';say('Feet apart. Both hands on the bat!');});
  add('⚾ Swing!',()=>{if(phase!=='set'){retry(null,'Get ready before swinging!');return;}launch();say('Turn and swing through the ball!');});say('Get ready. Swing with both hands on the bat.');

 }
 function metal(){return material('#a9bbc9');}
 animations.push((t,dt)=>{
  if(type==='soccer'&&(phase==='celebrate'||isDone())){celebrateTime+=dt;bear.rotation.y=Math.max(0,Math.PI-celebrateTime*6);bear.rotation.z=0;bear.position.y=celebrateTime>.55?Math.abs(Math.sin((celebrateTime-.55)*7))*.15:0;arms.forEach((a,i)=>{a.rotation.x=0;a.rotation.z=(i?1:-1)*(2.3+Math.sin(celebrateTime*10)*.15);});legs.forEach(l=>l.rotation.set(0,0,0));return;}
  if(type==='soccer'){
   soccerGoal.position.x+=((goalLane-1)*2-soccerGoal.position.x)*Math.min(1,dt*6);
   if(phase==='ready'&&!isDone()){
    const dx=(selectedLane-1)*2-bear.position.x,moving=Math.abs(dx)>.01;
    bear.position.x+=Math.sign(dx)*Math.min(Math.abs(dx),dt*2.8);
    bear.position.y=moving?Math.abs(Math.sin(t*13))*.055:0;
    legs.forEach((l,i)=>{l.rotation.x=0;l.rotation.z=moving?Math.sin(t*13+i*Math.PI)*.25:0;});
    arms.forEach((a,i)=>a.rotation.z=moving?Math.sin(t*13+i*Math.PI)*.18:0);
    ball.position.set(bear.position.x+.18,.21,1.42);if(moving)ball.rotation.z-=Math.sign(dx)*dt*6;
   }
  }
  if(type==='baseball'){
   scene.updateMatrixWorld(true);
   batArms.forEach(({hand,upper,fore,i})=>{const a=ball.position.clone().set(-1.5+(i?.38:-.38),1.17,.3),b=hand.getWorldPosition(ball.position.clone()),elbow=a.clone().lerp(b,.5);elbow.y-=.2;elbow.z+=.15;
    for(const [mesh,start,end] of [[upper,a,elbow],[fore,elbow,b]]){const v=end.clone().sub(start);mesh.position.copy(start).addScaledVector(v,.5);mesh.scale.y=v.length()/2;mesh.quaternion.setFromUnitVectors(v.clone().set(0,1,0),v.normalize());}
   });
  }
  if(isDone())return;
  if((type==='basket'||type==='golf')&&phase==='ready'){if(isHeld())power=Math.min(1,power+dt*.65);meter.firstChild.style.width=power*100+'%';meter.firstChild.style.background=power>=.55?'#6dc864':'#ffca53';if(type==='basket'){ball.position.set(-1.05,1.17,0);arms.forEach(a=>a.rotation.x=-1.57);}}
  if(phase==='incoming'){p=Math.min(1,p+dt*(p<.78?.4:.055));scene.updateMatrixWorld(true);const end=hitPoint.getWorldPosition(ball.position.clone()),q=Math.min(1,p/.78);ball.position.set(2.6+(end.x-2.6)*q,type==='tennis'?(q<.58?2.4-.2*q/.58:q<.82?2.2+(radius-2.2)*(q-.58)/.24:radius+(end.y-radius)*(q-.82)/.18):2.6+(end.y-2.6)*q,end.z*q);if(p>=.78)say(type==='tennis'?'Hit now!':'Bump now!');if(p===1){phase='ready';retry(null,'Try again. Send another ball!');say('Send another ball and try again.');}}
  if(phase!=='flight')return;p=Math.min(1,p+dt*.65);
  if(type==='tennis'||type==='volley'){ball.position.set(contact.x+(3-contact.x)*p,contact.y+(radius-contact.y)*p+Math.sin(p*Math.PI)*2,contact.z*(1-p));arms.forEach((a,i)=>a.rotation.x=type==='volley'?-1.3-Math.sin(p*Math.PI)*.5:i===1?-Math.sin(p*Math.PI)*1.8:0);}
  if(type==='basket'){ball.position.set(-1.05+3.55*Math.min(1,p/.8),p<.8?1.17+.93*p/.8+Math.sin(p/.8*Math.PI)*1.8:2.1-(p-.8)*6,.25*Math.min(1,p/.8));arms.forEach(a=>a.rotation.x=-Math.PI+Math.sin(p*Math.PI)*.3);}
  if(type==='soccer'){
   // Wind up, make contact, then release the ball. The planted leg stays still.
   const contactTime=.28,q=Math.max(0,(p-contactTime)/(1-contactTime));
   legs[0].rotation.x=p<.1?.45*p/.1:p<contactTime?.45-1.5*(p-.1)/(.18):-1.05*(1-Math.min(1,q*2));
   legs[0].rotation.z=0;legs[1].rotation.set(0,0,0);
   arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*Math.sin(p*Math.PI)*.25);
   ball.position.set(shotStartX+((aim-1)*2-shotStartX)*q,.21+Math.sin(q*Math.PI)*.12,1.42-3.92*q);
   ball.rotation.x=-q*12;
  }
  if(type==='golf'){ball.position.set(-.7+3*p,.09-Math.max(0,p-.93)*2,0);arms[1].rotation.x=-.3-Math.sin(p*Math.PI)*.55;}
  if(type==='baseball'){const q=Math.max(0,(p-.25)/.75);ball.position.set(.2+3.5*q,1.15+Math.sin(q*Math.PI)*1.5-q,.3-1.2*q);batRig.rotation.y=p<.25?-1.2+1.2*p/.25:q*1.5;batRig.rotation.z=p<.25?.7*(1-p/.25):q*.35;}
  if(p===1){complete();if(!isDone()&&phase!=='celebrate'){if(type==='baseball'){ball.position.set(.2,1.15,.3);batRig.rotation.y=-1.2;batRig.rotation.z=.7;head.rotation.y=.7;}if(type==='soccer'){ball.position.set(bear.position.x+.18,.21,1.42);goalLane=[0,2,1][n];aim=-1;say('The goal moved! Use left or right to line up.');}power=0;}}
 });
}
