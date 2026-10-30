import * as T from './vendor/three.module.js';

// An articulated toy dog, rendered locally; no tracking or microphone needed.
export function mountDogGame({stage, controls, button, status, step, retry, audioURL}) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.setClearColor('#bdeafa'); renderer.outputColorSpace=T.SRGBColorSpace;
  stage.classList.add('dog-playground');stage.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Animated puppy. Use the Woof button to make the puppy bark.');
  const scene=new T.Scene(), camera=new T.PerspectiveCamera(36,1,.1,50);
  camera.position.set(4,3.1,7);camera.lookAt(0,1.2,0);
  scene.add(new T.HemisphereLight(0xffffff,0x769b62,2.5));
  const light=new T.DirectionalLight(0xfff0d4,3);light.position.set(-3,7,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
  const materials=[], geometries=[];
  function mat(color){const m=new T.MeshStandardMaterial({color,roughness:.72});materials.push(m);return m;}
  const brown=mat('#be7137'),dark=mat('#713b24'),cream=mat('#ffdfab'),black=mat('#231f2b'),white=mat('#ffffff'),pink=mat('#f48c9b'),green=mat('#84c76d'),blue=mat('#64bbdf');
  function shape(parent, material,x,y,z,sx,sy,sz,box=false){const g=box?new T.BoxGeometry(1,1,1):new T.SphereGeometry(1,32,24);geometries.push(g);const mesh=new T.Mesh(g,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  shape(scene,green,0,-.16,0,12,.15,12,true);
  const fence=mat('#fff1ce');for(let i=-7;i<=7;i++){shape(scene,fence,i*.6,.48,-2.6,.12,1,.13,true);}shape(scene,fence,0,.7,-2.65,9,.12,.12,true);
  // Rounded shrubs and flowers give real parallax and depth around the dog.
  for(const x of [-3,3]){shape(scene,mat('#59a866'),x,.45,-1.8,.8,.6,.6);for(let i=0;i<3;i++){shape(scene,pink,x+(i-1)*.3,.85,-1.55,.13,.13,.1);shape(scene,cream,x+(i-1)*.3,.85,-1.44,.05,.05,.04);}}
  const dog=new T.Group();scene.add(dog);
  shape(dog,brown,0,.88,0,.55,.64,.76);shape(dog,cream,0,1,.59,.35,.43,.15);
  const legs=[];for(const x of [-.34,.34])for(const z of [-.38,.4]){const leg=new T.Group();leg.position.set(x,.65,z);dog.add(leg);shape(leg,brown,0,-.22,0,.18,.38,.19);shape(leg,cream,0,-.49,.07,.22,.14,.28);legs.push(leg);}
  const head=new T.Group();head.position.set(0,1.67,.4);dog.add(head);
  shape(head,brown,0,0,0,.66,.59,.55);
  const ears=[];for(const x of [-.61,.61]){const ear=new T.Group();ear.position.set(x,.22,-.06);head.add(ear);shape(ear,dark,0,-.32,0,.2,.43,.24);ears.push(ear);}
  const eyes=[];for(const x of [-.25,.25]){const eye=shape(head,black,x,.12,.49,.115,.145,.065);eyes.push(eye);shape(head,white,x-.025,.16,.547,.035,.04,.018);shape(head,cream,x,.33,.45,.15,.055,.06);}
  shape(head,cream,-.16,-.12,.52,.25,.19,.22);shape(head,cream,.16,-.12,.52,.25,.19,.22);shape(head,black,0,-.03,.73,.14,.105,.08);
  const jaw=new T.Group();jaw.position.set(0,-.24,.38);head.add(jaw);shape(jaw,dark,0,-.02,.2,.24,.08,.2);shape(jaw,pink,0,.04,.27,.12,.025,.11);shape(jaw,cream,0,-.08,.19,.27,.08,.22);
  const collar=shape(dog,blue,0,1.35,.32,.46,.09,.42);shape(dog,mat('#ffc44e'),0,1.25,.75,.09,.11,.035);
  const tail=new T.Group();tail.position.set(0,.95,-.6);dog.add(tail);const tailMesh=shape(tail,brown,0,.3,-.22,.13,.45,.14);tailMesh.rotation.x=-.6;
  const badge=document.createElement('div');badge.className='dog-cue';stage.append(badge);
  const tally=document.createElement('div');tally.className='dog-tally';tally.setAttribute('aria-hidden','true');stage.append(tally);
  let disposed=false,raf=0,round=0,count=0,phase='ready',barkUntil=0,hopUntil=0,puzzledUntil=0,look=0,lastTap=0;
  const patterns=[1,2,3],timers=new Set(),audio=new Audio(audioURL);
  const delay=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn();},ms);timers.add(id);};
  function cue(text){badge.textContent=text;status.textContent=text;}
  function bark(){audio.pause();audio.currentTime=.57;audio.play().catch(()=>{status.textContent='Sound could not play. Tap Listen to try again.';});barkUntil=performance.now()+400;}
  const listen=button('👂 Listen',demo),woof=button('🐾 Woof!',tap),check=button('⭐ My turn is done',checkAnswer);
  const bar=controls(listen,woof,check);
  function buttons(){listen.disabled=phase==='listen'||phase==='happy'||phase==='done';woof.disabled=phase!=='copy';check.disabled=phase!=='copy'||count===0;}
  function dots(){tally.textContent=count?'🐾 '.repeat(count):'Your barks appear here';}
  function demo(){if(phase==='listen'||phase==='done'||phase==='happy')return;phase='listen';puzzledUntil=0;count=0;dots();buttons();cue('Watch and listen!');for(let i=0;i<patterns[round];i++)delay(bark,200+i*800);delay(()=>{phase='copy';cue('Your turn! Tap the puppy to copy.');buttons();},patterns[round]*800+250);}
  function tap(){if(phase!=='copy'||performance.now()-lastTap<450)return;lastTap=performance.now();count=Math.min(5,count+1);bark();dots();buttons();}
  function checkAnswer(){if(phase!=='copy'||!count)return;if(count!==patterns[round]){retry(null,'Let’s listen and try that again!');puzzledUntil=performance.now()+1800;phase='ready';count=0;dots();buttons();cue('Let’s listen and try again!');return;}phase='happy';hopUntil=performance.now()+1300;cue('You did it! Happy puppy!');buttons();round++;if(round===patterns.length){delay(()=>{step();phase='done';buttons();},1250);}else{step();delay(()=>{phase='ready';cue('Ready for another barking pattern?');count=0;dots();buttons();},1500);}}
  const ray=new T.Raycaster(),pointer=new T.Vector2();
  renderer.domElement.onpointermove=e=>{const r=renderer.domElement.getBoundingClientRect();look=((e.clientX-r.left)/r.width-.5)*.6;};
  renderer.domElement.onpointerdown=e=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);if(ray.intersectObject(dog,true).length)tap();};
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(w/h<1.3?3:4,w/h<1.3?3.3:3.1,w/h<1.3?8.5:7);camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(now){if(disposed)return;const t=now/1000,barking=now<barkUntil,happy=now<hopUntil;const puzzled=Math.sin(Math.PI*Math.max(0,Math.min(1,(puzzledUntil-now)/1800)));tail.rotation.z=Math.sin(t*(happy?18:puzzled>.1?2:7))*(.45-.35*puzzled);tail.rotation.x=.55*puzzled;head.rotation.y+=(look-head.rotation.y)*.06;head.rotation.z=Math.sin(t*1.8)*.035+.24*puzzled;dog.position.y=happy&&!reduce?Math.abs(Math.sin(t*10))*.38:Math.sin(t*2)*.018;dog.rotation.y=-.18;dog.scale.y=1+Math.sin(t*2)*.012;jaw.rotation.x=barking?.45+Math.sin(t*32)*.15:.05;head.rotation.x=barking?-.08:.18*puzzled;ears.forEach((e,i)=>e.rotation.z=(i?1:-1)*(.08-.14*puzzled+(barking?.2:Math.sin(t*3)*.025)));eyes.forEach(e=>e.scale.y=(t%4.5<.12?.025:.145));legs.forEach((l,i)=>l.rotation.x=happy&&!reduce?Math.sin(t*10+i)*.2:0);renderer.render(scene,camera);raf=requestAnimationFrame(draw);}
  cue('Tap Listen. Then copy the puppy’s barks!');dots();buttons();raf=requestAnimationFrame(draw);
  return ()=>{disposed=true;cancelAnimationFrame(raf);timers.forEach(clearTimeout);audio.pause();observer.disconnect();renderer.domElement.onpointerdown=renderer.domElement.onpointermove=null;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();badge.remove();tally.remove();bar.remove();};
}
