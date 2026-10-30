// Sports-shop activities: fitted equipment and reactive 3D characters.
export function buildWeekFour(api){
 const {type,scene,shape,torus,outline,group,material,animations,add,target,hold,isHeld,isDone,goal,step,retry,say,finish,later,bear,head,arms,legs}=api;
 const white=material('#fff9f1'),pink=material('#ee91bc'),blue=material('#60b9eb'),red=material('#e95b68'),dark=material('#383d58'),yellow=material('#ffcf54'),green=material('#8bd5ab'),metal=material('#b7c8d8');
 bear.position.set(0,0,.3);bear.rotation.y=0;
 shape(scene,material('#c5b4ed'),0,-.04,0,7,.06,4,true);
 shape(scene,material('#9bd7ef'),0,1.5,-2.1,7,3,.12,true);
 for(const x of [-2.5,2.5]){shape(scene,white,x,1,-1.8,1.2,.1,.5,true);for(let i=0;i<3;i++)shape(scene,[pink,yellow,blue][i],x-.35+i*.35,1.25,-1.8,.13,.2,.12);}
 const rod=(parent,mat,a,b,r=.035)=>{const m=shape(parent,mat,0,0,0,r,1,r),v=m.position.clone().set(...b).sub(m.position.clone().set(...a));m.position.set(...a).addScaledVector(v,.5);m.scale.y=v.length()/2;m.quaternion.setFromUnitVectors(v.clone().set(0,1,0),v.normalize());return m;};
 let busy=false,phase=0,n=0,cheer=0;
 const celebrate=(message='Wonderful!')=>{busy=true;cheer=2;say(message);later(finish,1800);};
 function wrong(message){retry(null,message);head.rotation.z=.15;later(()=>head.rotation.z=0,450);}
 function shoe(parent,x,y,z,color){const g=group(parent,x,y,z);shape(g,white,0,-.04,.06,.2,.08,.32);shape(g,color,0,.06,.04,.19,.14,.28);for(let i=0;i<3;i++)rod(g,white,[-.1,.18,-.04+i*.07],[.1,.18,-.04+i*.07],.016);return g;}
 function transfer(obj,to,callback){busy=true;const from=obj.position.clone();let p=0;const fly=(t,dt)=>{p=Math.min(1,p+dt*1.3);obj.position.copy(from).lerp(to,p);obj.position.y+=Math.sin(p*Math.PI)*.4;if(p===1){animations.splice(animations.indexOf(fly),1);busy=false;callback();}};animations.push(fly);}
 if(type==='helmet'){
  goal(3);const helmet=group(scene,-.95,1.3,.3);shape(helmet,yellow,0,0,0,.5,.28,.4);for(let i=-1;i<=1;i++)shape(helmet,dark,i*.2,.21,.05,.035,.05,.2);
  const fitted=group(head,0,.26,0);shape(fitted,yellow,0,0,0,.48,.22,.38);for(let i=-1;i<=1;i++)shape(fitted,dark,i*.19,.18,.03,.03,.035,.18);fitted.visible=false;
  const strap=group(head);rod(strap,dark,[-.38,.1,.05],[-.23,-.35,.3],.025);rod(strap,dark,[.38,.1,.05],[.23,-.35,.3],.025);rod(strap,dark,[-.23,-.35,.3],[.23,-.35,.3],.025);strap.visible=false;
  add('⛑️ Put helmet on',()=>{if(busy||phase)return;transfer(helmet,helmet.position.clone().set(0,1.9,.3),()=>{helmet.visible=false;fitted.visible=true;phase=1;step();say('Now fasten the helmet strap!');});});
  add('🔒 Fasten strap',()=>{if(busy)return;if(phase!==1){wrong('Put the helmet on first!');return;}if(phase!==1)return;strap.visible=true;phase=2;step();say('Strap fastened! Check that the helmet stays on.');});
  add('✅ Check fit',()=>{if(busy)return;if(phase!==2){wrong('Put the helmet on and fasten the strap first!');return;}busy=true;phase=3;later(()=>celebrate('Helmet secure! Teddy is ready to ride.'),1200);});
  animations.push(t=>{if(phase===3&&!cheer&&!isDone())head.rotation.y=Math.sin(t*9)*.3;else if(cheer)head.rotation.y=0;});say('Help teddy get ready to ride: helmet on, strap fastened, check fit!');
 }else if(type==='sneakers'){
  goal(3);const shoes=[shoe(scene,-1.8,.25,.4,red),shoe(scene,1.8,.25,.4,red)];const fitted=legs.map(l=>{const s=shoe(l,0,-.48,.05,red);s.visible=false;return s;});let worn=[false,false];
  ['👟 Left sneaker','Right sneaker 👟'].forEach((label,i)=>add(label,()=>{if(busy||worn[i])return;transfer(shoes[i],shoes[i].position.clone().set(i?.21:-.21,.2,.4),()=>{shoes[i].visible=false;fitted[i].visible=true;worn[i]=true;step();say(worn.every(Boolean)?'Both sneakers are on. Try a stomp!':'Put on the other sneaker!');});}));
  add('🐾 Stomp!',()=>{if(busy)return;if(!worn.every(Boolean)){wrong('Teddy needs both sneakers first!');return;}phase=1;busy=true;later(celebrate,900);});say('Fit both sneakers, then make teddy stomp.');
  animations.push(t=>{if(phase===1&&!isDone())legs.forEach((l,i)=>l.position.y=.65+Math.max(0,Math.sin(t*10+i*Math.PI))*.2);});
 }else if(type==='bicycle'){
  goal(3);bear.position.x=-2;const bike=group(scene,.65,0,.3);const wheels=[];
  for(const x of [-.8,.8]){const wheel=torus(bike,dark,x,.5,0,.46,.055);for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(wheel,white,[0,0,0],[Math.cos(a)*.4,Math.sin(a)*.4,0],.012);}wheel.visible=false;wheels.push(wheel);}
  for(const [a,b] of [[[-.8,.5,0],[-.3,1.05,0]],[[-.3,1.05,0],[0,.5,0]],[[0,.5,0],[-.8,.5,0]],[[0,.5,0],[.6,1.1,0]],[[.6,1.1,0],[-.3,1.05,0]],[[.6,1.1,0],[.8,.5,0]]])rod(bike,green,a,b,.045);
  shape(bike,dark,-.3,1.12,0,.25,.055,.13);rod(bike,metal,[.6,1.1,0],[.6,1.4,0]);rod(bike,dark,[.6,1.4,-.23],[.6,1.4,.23]);let fitted=[false,false];
  // Teddy fetches each wheel, carries it in both hands, then fits it to its axle.
  const loose=wheels.map((w,i)=>{scene.attach(w);w.visible=true;w.position.set(-2.6+i*.9,.5,1.1);return w;});
  let job=null;
  ['🔧 Back wheel','Front wheel 🔧'].forEach((label,i)=>add(label,()=>{if(busy||fitted[i])return;busy=true;job={i,stage:0,p:0,startX:bear.position.x};say('Teddy is picking up the '+(i?'front':'back')+' wheel!');}));
  animations.push((t,dt)=>{if(!job)return;const w=loose[job.i];job.p=Math.min(1,job.p+dt*.8);const q=job.p;
   legs.forEach((l,i)=>l.rotation.x=Math.sin(t*10+i*Math.PI)*.35);
   if(job.stage===0){bear.position.x=job.startX+(-2.6+job.i*.9-job.startX)*q;bear.position.z=1.1;
    if(q===1){bear.attach(w);w.position.set(0,.95,.65);arms.forEach(a=>a.rotation.x=-1.3);job.stage=1;job.p=0;job.startX=bear.position.x;say('Carry the wheel to the bicycle!');}}
   else if(job.stage===1){const end=.65+(job.i?.8:-.8);bear.position.x=job.startX+(end-job.startX)*q;
    if(q===1){job.stage=2;job.p=0;say('Turn toward the bicycle!');}}
   else if(job.stage===2){bear.rotation.y=Math.PI*(q*q*(3-2*q));bear.position.x=.65+(job.i?.8:-.8)-.9*q;legs.forEach((l,i)=>l.rotation.x=Math.sin(t*10+i*Math.PI)*.2);if(q===1){scene.attach(w);job.from=w.position.clone();job.stage=3;job.p=0;say('Fit the wheel onto its axle!');}}
   else{w.position.copy(job.from).lerp(job.from.clone().set(.65+(job.i?.8:-.8),.5,.3),q);
    if(q===1){bike.attach(w);fitted[job.i]=true;job=null;busy=false;arms.forEach(a=>a.rotation.x=0);legs.forEach(l=>l.rotation.x=0);bear.position.x=-2;bear.position.z=.3;bear.rotation.y=0;step();say(fitted.every(Boolean)?'Bicycle built! Hold to spin the wheels.':'One wheel fitted! Fetch the other wheel.');}}
  });
  const spin=add('🚲 Hold to spin',()=>{});hold(spin,()=>{if(!fitted.every(Boolean))wrong('Fit both wheels first!');},()=>{});say('Build the bicycle, then spin its wheels.');
  animations.push((t,dt)=>{if(isHeld()&&fitted.every(Boolean)&&!busy&&!isDone()){wheels.forEach(w=>w.rotation.z-=dt*7);phase+=dt;if(phase>2)celebrate();}});
 }else if(type==='socks'){
  goal(3);bear.position.set(0,0,-.9);const colors=[red,blue,yellow],names=['red','blue','yellow'];let round=0;
  function sock(parent,x,y,z,color){const g=group(parent,x,y,z);shape(g,color,0,.1,0,.14,.27,.11);shape(g,color,.1,-.12,.02,.23,.11,.13);for(const yy of [.22,.3])shape(g,white,0,yy,.01,.145,.025,.115);return g;}
  const stand=shape(scene,yellow,-2.2,.1,1,1.15,.18,.7,true);const sample=sock(scene,-2.35,.62,1,red);const choices=[-.7,.6,1.9].map((x,i)=>sock(scene,x,.62,1,colors[i]));
  const recolor=(g,c)=>g.children.forEach((m,i)=>{if(i<2)m.material=c;});
  const prompt=()=>say('Match the '+names[round]+' striped sock on the yellow stand.');
  ['🧦 Red stripes','🧦 Blue stripes','🧦 Yellow stripes'].forEach((label,i)=>add(label,()=>{if(busy)return;if(i!==round){wrong('Look at the sock on the yellow stand. Match its color and stripes!');return;}
   const chosen=choices[i],home=chosen.position.clone();transfer(chosen,home.clone().set(-1.95,.62,1),()=>{busy=true;say('A matching pair!');later(()=>{round++;if(round===3){celebrate('Three matching pairs!');return;}step();chosen.position.copy(home);recolor(sample,colors[round]);busy=false;prompt();},900);});}));prompt();
 }else if(type==='gloves'){
  goal(3);bear.rotation.y=Math.PI/2;const gloves=arms.map(a=>{const g=group(a,0,-.48,0);shape(g,red,0,0,.06,.22,.24,.22);shape(g,white,0,.17,0,.17,.07,.16);g.visible=false;return g;});
  const bag=group(scene,1.65,1.35,.5);shape(bag,pink,0,0,0,.36,.7,.36);rod(scene,dark,[1.65,2.05,.5],[1.65,2.7,.5],.035);let punch=0,side=0;
  add('🥊 Put gloves on',()=>{if(phase)return;gloves.forEach(g=>g.visible=true);phase=1;say('Gloves on! Left, right, left.');});
  ['🥊 Left punch','Right punch 🥊'].forEach((label,i)=>add(label,()=>{if(busy)return;if(!phase){wrong('Put the boxing gloves on first!');return;}if(i!==side){wrong('Try the other glove!');return;}busy=true;punch=0;side=1-side;phase=2;}));say('Put on gloves, then alternate gentle punches.');
  animations.push((t,dt)=>{if(phase!==2||isDone())return;punch=Math.min(1,punch+dt*1.7);bear.position.x=Math.sin(punch*Math.PI)*.8;arms[1-side].rotation.x=-Math.sin(punch*Math.PI)*1.5;bag.rotation.z=-Math.sin(punch*Math.PI)*.25;if(punch===1){busy=false;n++;if(n===3){phase=3;celebrate();}else{step();phase=1;say(side?'Now use the right glove!':'Now use the left glove!');}}});
 }else if(type==='swimsuit'){
  goal(1);bear.position.set(0,0,-.9);const suit=group(scene,-1.35,.8,1);
  outline(suit,blue,[[-.32,.3],[-.12,.22],[.12,.22],[.32,.3],[.23,-.06],[.3,-.18],[.16,-.25],[.08,-.4],[-.08,-.4],[-.16,-.25],[-.3,-.18],[-.23,-.06]]);for(const x of [-.22,.22])rod(suit,blue,[x,.2,0],[x,.6,0],.065);shape(suit,white,0,-.15,.14,.25,.04,.015,true);
  const coat=group(scene,1.35,.8,1);outline(coat,pink,[[-.2,.45],[-.4,.3],[-.6,-.08],[-.4,-.18],[-.3,.02],[-.3,-.4],[.3,-.4],[.3,.02],[.4,-.18],[.6,-.08],[.4,.3],[.2,.45]]);
  rod(coat,white,[0,.3,.15],[0,-.35,.15],.018);for(const x of [-.17,.17])shape(coat,white,x,-.22,.15,.1,.06,.02,true);
  const ring=torus(scene,yellow,1.35,.07,1,.65,.045);ring.rotation.x=-Math.PI/2;let selected=1;
  const select=i=>{if(busy)return;selected=i;ring.position.x=i?1.35:-1.35;head.rotation.y=i?.45:-.45;say((i?'Winter coat':'Swimsuit')+' selected. Pick what teddy needs for swimming!');};
  add('⬅️ Left',()=>select(0));add('Right ➡️',()=>select(1));add('⭐ Pick!',()=>{if(busy)return;if(selected!==0){wrong('A winter coat keeps us warm. Find the swimsuit for swimming!');return;}arms.forEach(a=>a.rotation.x=-1.2);transfer(suit,suit.position.clone().set(0,1.1,-.25),()=>celebrate('Yes! Teddy needs a swimsuit for swimming.'));});say('Teddy is going swimming. Move left or right, then Pick!');

 }
 animations.push((t,dt)=>{if(cheer>0||isDone()){bear.rotation.y+=(0-bear.rotation.y)*Math.min(1,dt*7);cheer=Math.max(0,cheer-dt);bear.position.y=Math.abs(Math.sin(t*7))*.12;arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*(2.1+Math.sin(t*8)*.15));}});
}
