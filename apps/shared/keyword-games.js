/* Month 9: one small, keyword-focused game for every book-video button. */
(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const asset = name => new URL(name, scriptURL).href;
  const route = location.pathname.match(/level-([ab])\/literacy\/week-(\d)-page-02\.html/);
  if (!route || !document.querySelector('#ees-video') || document.querySelector('.kw-dialog')) return;
  const level = route[1], week = Number(route[2]);
  const video = document.querySelector('#ees-video');
  const choices = [...document.querySelectorAll('.ees-sentence[data-word]')];
  // Different goals and gestures, even where a keyword returns in another week.
  const catalog = {
    a: {
      1: {
        jumping: ['Practice jumping','🏃','Tap Jump to practice jumping.','jump'],
        swinging: ['Swing from the bar','🌳','Hold the hanging bar and swing back and forth.','swing'],
        running: ['Follow the running track','🏃','Hold Run to help teddy reach the finish.','track'],
        climbing: ['Climb the rocky trail','🥾','Choose the next stone to climb up the trail.','climb'],
        lifting: ['Lift the barbell','💪','Hold to help teddy lift the barbell.','lift'],
        swimming: ['Make swimming strokes','🏊','Tap left, then right, to swim.','strokes']
      },
      2: {
        running: ['Ready, steady, run!','🏃','Tap Ready, wait for green, then hold Run.','race'],
        diving: ['Dive into the pool','🤿','Tap Dive to spring from the diving board.','dive'],
        badminton: ['Serve the shuttlecock','🏸','Send a shuttlecock, then hit it when it is close.','serve'],
        cycling: ['Pedal your bicycle','🚴','Hold Pedal to cycle past the flags.','cycle'],
        swimming: ['Swim to the floats','🏊','Choose each float to swim toward it.','swimRoute'],
        skating: ['Glide on the ice','⛸️','Push with alternate skates to glide across the ice.','skate']
      },
      3: {
        tennis: ['Return the tennis ball','🎾','Tap Hit when the tennis ball reaches the racket.','tennis'],
        basketball: ['Shoot a basket','🏀','Hold until green, then release to shoot.','basket'],
        volleyball: ['Bump it over!','🏐','Send the ball, then bump it with both forearms.','volley'],
        soccer: ['Kick into the goal','⚽','Move left or right to line up, then kick.','soccer'],
        golf: ['One careful putt','⛳','Hold until green, then release for one putt.','golf'],
        baseball: ['Swing the baseball bat','⚾','Get ready, then hit the ball off the tee.','baseball']
      },
      4: {
        helmet: ['Get ready to ride!','⛑️','Get ready to ride: put on, fasten, and check the helmet.','helmet'],
        sneakers: ['Sneakers for both feet','👟','Fit both sneakers, then make teddy stomp.','sneakers'],
        bicycle: ['Build the bicycle','🚲','Fit both wheels, then hold to spin them.','bicycle'],
        socks: ['Find the matching socks','🧦','Match the striped sock on the yellow stand.','socks'],
        'boxing-gloves': ['Gloves on both hands','🥊','Put on gloves, then alternate left and right punches.','gloves'],
        swimsuit: ['Choose clothes for swimming','🩱','Move left or right, then Pick the clothes for swimming.','swimsuit']
      }
    },
    b: {
      1: {
        'wind-blowing': ['Make the wind blow','🍃','Hold to blow wind and spin the pinwheel.','wind'],
        'bees-buzzing': ['Buzz from flower to flower','🐝','Tap the glowing flowers to guide the buzzing bee.','buzz'],
        'dog-barking': ['Copy the dog’s barks','🐕','Listen, then tap the puppy to copy its barks.','bark'],
        'baby-crying': ['Rock the crying baby','👶','Listen to the baby crying. Hold to rock gently.','baby'],
        'birds-chirping': ['A little chirping tune','🐦','Tap the bouncing birds to make a chirping tune.','birds'],
        'cat-meowing': ['Where is the meowing cat?','🐈','Listen and find the cat behind the wiggling door.','cat']
      },
      2: {
        sun: ['Bring out the sun','☀️','Hold to raise the sun and brighten Earth.','sun'],
        plants: ['Grow a little plant','🌱','Plant the seed, then water it to grow a plant.','plant'],
        'clean-water': ['Give Earth clean water','💧','Remove litter from the pond to help keep water clean.','cleanWater'],
        flowers: ['Help the flowers bloom','🌸','Guide the bee to each flower bud to help it bloom.','bloom'],
        trees: ['Plant a tiny forest','🌳','Dig a hole, then plant a tree. Make a little forest.','forest'],
        insects: ['Find the garden insects','🐞','Find the three insects hiding among the leaves.','insects'],
        animals: ['Homes for animals','🐘','Match each animal to its home on Earth.','animals'],
        'clean-air': ['Fresh air for Earth','🌬️','Switch off the smoky engine, then hold Breeze.','air']
      },
      3: {
        flowers: ['Bees beside the flowers','🌼','Choose the flower patch. Bring the bees near it.','nearFlowers'],
        sky: ['Bees high in the sky','☁️','Lift the bees up into the blue sky.','sky'],
        plants: ['Find the leafy plants','🪴','Find the green leafy plant each time it moves.','nearPlants'],
        grass: ['Low over the grass','🌿','Guide the bee along the low grassy path.','grass'],
        trees: ['Bees around the trees','🌳','Move left or right to the ring, then visit the branch.','nearTrees'],
        water: ['Hover above the pond','💧','Hold Fly to lift off. Keep holding so the bees stay above water.','water']
      },
      4: {
        'honey-tea': ['Stir honey tea','🍵','Put honey in the tea, then stir three times.','tea'],
        'honey-spread': ['Mix honey spread','🥣','Mix left, then right, to make smooth honey spread.','spread'],
        'honey-toast': ['Spread it on toast','🍞','Hold Spread to cover the toast with honey.','toast'],
        'honey-pancakes': ['Drizzle the pancakes','🥞','Choose a pancake stack, then hold Pour to drizzle honey.','pancakes'],
        'honey-chicken': ['Brush the honey glaze','🍗','Move the brush left or right, then glaze each piece.','chicken'],
        'honey-cookies': ['Fill the cookie tray','🍪','Put each honey cookie in its matching tray space.','cookies']
      }
    }
  };
  const games = catalog[level][week];
  let active = choices.find(b => b.classList.contains('is-active'))?.dataset.word || choices[0].dataset.word;
  let session = 0, disposers = [], sound = null, frame = 0, recording = null;
  const button = (text, fn, cls='') => { const b=document.createElement('button');b.type='button';b.className='kw-btn '+cls;b.textContent=text;b.onclick=fn;return b; };
  let playingVideo = false;
  const dialog=document.createElement('dialog');dialog.className='kw-dialog';dialog.setAttribute('aria-label','Keyword activity');
  dialog.innerHTML='<header class="kw-head"><h2></h2></header><div class="kw-instruction"><p></p></div><div class="kw-stage"></div><footer class="kw-bottom"><div class="kw-progress" aria-label="Activity progress"></div><p class="kw-status" role="status" aria-live="polite"></p><div class="kw-actions"></div></footer><section class="activity-completion-overlay" hidden></section>';
  document.body.append(dialog);
  const stage=dialog.querySelector('.kw-stage'), status=dialog.querySelector('.kw-status'), success=dialog.querySelector('.activity-completion-overlay');
  const title=dialog.querySelector('h2'), instruction=dialog.querySelector('.kw-instruction p'), progress=dialog.querySelector('.kw-progress');
  dialog.querySelector('.kw-head').append(button('↻',()=>open(),'secondary'),button('✕',()=>dialog.close(),'secondary'));
  dialog.querySelector('.kw-head button').setAttribute('aria-label','Start activity again');
  dialog.querySelector('.kw-head button:last-child').setAttribute('aria-label','Close activity');
  dialog.querySelector('.kw-instruction').append(button('🔊',()=>speak(instruction.textContent),'secondary'));
  dialog.querySelector('.kw-instruction button').setAttribute('aria-label','Hear instructions');
  dialog.querySelector('.kw-instruction button').setAttribute('data-no-click-sound','');
  function speak(text){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.95;window.speechSynthesis.speak(u);}
  function cleanup(){session++;cancelAnimationFrame(frame);disposers.splice(0).forEach(f=>f());sound?.pause();window.speechSynthesis?.cancel();recording?.();recording=null;stage.onpointerdown=stage.onpointermove=stage.onpointerup=null;}
  dialog.addEventListener('close',()=>{cleanup();choices.find(b=>b.dataset.word===active)?.focus();});
  window.addEventListener('pagehide',cleanup);
  choices.forEach(b=>b.addEventListener('click',event=>{
    if(playingVideo)return;
    event.preventDefault();event.stopImmediatePropagation();active=b.dataset.word;
    choices.forEach(c=>{c.classList.toggle('is-active',c===b);c.setAttribute('aria-pressed',String(c===b));});
    open();
  },true));
  function watchVideo(){dialog.close();playingVideo=true;try{choices.find(b=>b.dataset.word===active).click();}finally{playingVideo=false;}video.scrollIntoView({block:'center',behavior:'smooth'});}
  const watch=button('▶ Skip to Watch Video',watchVideo,'kw-watch');
  dialog.querySelector('.kw-bottom').append(watch);
  function soundOf(slug){sound?.pause();sound=new Audio(asset('keyword-audio/'+slug+'.mp3'));sound.play().catch(()=>{status.textContent='Tap the sound button to listen.';});return sound;}
  function later(fn,ms){const id=setTimeout(fn,ms);disposers.push(()=>clearTimeout(id));return id;}
  function pos(el,x,y){el.style.left=x+'%';el.style.top=y+'%';}
  const sprites={'🐝':'bee','🏃':'runner','🧒':'child','⭐':'star','🚧':'cone','🥅':'goal','⛑️':'helmet','👟':'shoe','🧦':'sock','🚲':'bicycle-v2','🚴':'cyclist-v2','🩱':'swimsuit','🏐':'volleyball','🏀':'basketball','⚾':'baseball','⚽':'soccer','🍯':'honey','🥄':'spoon','🖌️':'brush','🍵':'tea','🍞':'toast','🥞':'pancakes','🍗':'chicken'};
  const atlas={'🧗':1,'🏊':2,'🐕':4,'🐈':5,'🐈‍⬛':5,'🐦':6,'👶':7,'👨‍🍼':7,'🍃':8,'🍂':8,'🌿':8,'🌸':9,'🌼':9,'🌻':9,'🌷':9,'🌳':10,'🌲':10,'🌴':10,'🪴':11,'🌱':11,'🌍':12,'☀️':13,'☁️':14,'💧':15,'🐞':16,'🦋':17,'🪨':18,'🧺':19,'🛞':20,'🥊':21,'🏸':23,'🏏':25,'⚪':26,'🚩':27,'🏁':27,'⛳':27,'🍪':28,'💛':29,'🚿':31,'👜':32,'🫘':33,'🐟':34,'🐘':35};
  function spriteCell(index){const ys=[0,236,450,660,860,1060,1254],row=Math.floor(index/6),col=index%6;return '<svg class="kw-art kw-atlas" aria-hidden="true" viewBox="'+(col*209)+' '+ys[row]+' 209 '+(ys[row+1]-ys[row])+'"><image href="'+asset('keyword-art/atlas.png')+'" width="1254" height="1254"/></svg>';}
  const extras={'⛸️':0,'🤿':1,'🛟':2,'🤚':3,'✋':3,'👣':4,'🧥':5,'🧣':6,'🛏️':7,'🪟':8,'🪺':9,'🕳️':10,'🥣':11};
  function extraCell(index){const ys=[0,340,632,897,1254],row=Math.floor(index/4),col=index%4;return '<svg class="kw-art kw-atlas" aria-hidden="true" viewBox="'+(col*313.5)+' '+ys[row]+' 313.5 '+(ys[row+1]-ys[row])+'"><image href="'+asset('keyword-art/extra-atlas.png')+'" width="1254" height="1254"/></svg>';}
  function art(icon,label=''){
    if(label==='Left sneaker'||label==='Right sneaker'){const x=label==='Left sneaker'?0:640;return '<svg class="kw-art" aria-hidden="true" viewBox="'+x+' 320 640 850"><image href="'+asset('keyword-art/shoe.png')+'" width="1280" height="1280"/></svg>';}
    if(extras[icon]!==undefined)return extraCell(extras[icon]);
    if(label==='Planting pot')return extraCell(12);

    if(label==='Shuttlecock')return spriteCell(22);
    if(label==='Hoop')return spriteCell(24);
    if(label==='Star cookie')return spriteCell(30);
    if(label==='Swing')return spriteCell(3);
    if(icon==='🎾')return '<i class="kw-tennis-ball" aria-hidden="true"></i>';
    if(icon==='🟤')return '<i class="kw-muddy-drop" aria-hidden="true"></i>';
    if(sprites[icon])return '<img class="kw-art" src="'+asset('keyword-art/'+sprites[icon]+'.png')+'" alt="" draggable="false">';
    if(atlas[icon]!==undefined)return spriteCell(atlas[icon]);
    return icon;
  }
  function dressScene(){
    let bg=level==='a'?'field':'garden';
    if(level==='a'&&['swimRoute','strokes','dive','swimsuit'].includes(games[active][3]))bg='pool';
    if(level==='a'&&active==='volleyball')bg='volleyball-court';
    if(level==='a'&&active==='basketball')bg='basketball-court';
    if(level==='a'&&active==='baseball')bg='baseball-field';
    if(level==='b'&&week===3)bg=active==='water'?'pond':active==='trees'?'forest':active==='grass'?'grass':'garden';
    if(level==='b'&&week===4)bg='kitchen';
    stage.style.backgroundImage='url("'+asset('keyword-art/'+bg+'.png')+'")';
    stage.dataset.game=games[active][3];
  }
  function piece(icon,x,y,label,fn,cls=''){const el=document.createElement('button');el.type='button';el.className='kw-piece '+cls;el.innerHTML=art(icon,label)+(label?'<span>'+label+'</span>':'');el.setAttribute('aria-label',label||title.textContent);pos(el,x,y);el.onclick=fn||(()=>{});stage.append(el);return el;}
  function decor(icon,x,y,size){const el=document.createElement('div');el.className='kw-decor';el.innerHTML=art(icon);pos(el,x,y);if(size)el.style.fontSize=size;stage.append(el);return el;}
  function bubble(text){const el=document.createElement('div');el.className='kw-bubble';el.textContent=text;stage.append(el);return el;}
  function stars(n){progress.innerHTML=Array.from({length:n},()=>'<span>⭐</span>').join('');}
  function sparkle(el){const s=document.createElement('span');s.className='kw-spark';s.textContent='✨';s.style.left=el.style.left||'50%';s.style.top=el.style.top||'40%';stage.append(s);later(()=>s.remove(),700);}
  let earned=0,total=1,won=false;
  function step(el,quiet=false){if(won)return;earned++;progress.children[earned-1]?.classList.add('earned');if(!quiet)window.gpFeedbackSounds?.correct();if(el)sparkle(el);if(earned>=total)win();}
  function retry(el,message='Try again—you can do it!'){status.textContent=message;window.gpFeedbackSounds?.wrong();el?.classList.add('kw-wiggle');later(()=>el?.classList.remove('kw-wiggle'),400);}
  function goal(n){total=n;stars(n);}
  function pointsEvent(e){const r=stage.getBoundingClientRect();return [(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100];}
  function scene(markup){stage.insertAdjacentHTML('afterbegin','<svg class="kw-scene" viewBox="0 0 800 440" preserveAspectRatio="none" aria-hidden="true">'+markup+'</svg>');}
  function controls(...buttons){const el=document.createElement('div');el.className='kw-controlbar';el.append(...buttons);dialog.querySelector('.kw-bottom .kw-actions').append(el);return el;}
  function drag(el,targets,onHit){let moving=false,origin=null,selected=false;el.onclick=()=>{if(el.disabled)return;selected=!selected;el.classList.toggle('selected',selected);status.textContent=selected?'Now tap where it goes.':'';};
    targets.forEach(t=>t.addEventListener('click',()=>{if(selected&&!el.disabled)finish(t); }));
    function finish(t){selected=false;el.classList.remove('selected');if(onHit(t)!==false){pos(el,parseFloat(t.style.left),parseFloat(t.style.top));}else if(origin)pos(el,...origin);}
    el.onpointerdown=e=>{if(el.disabled||won)return;moving=true;origin=[parseFloat(el.style.left),parseFloat(el.style.top)];el.setPointerCapture(e.pointerId);};
    el.onpointermove=e=>{if(!moving)return;const p=pointsEvent(e);pos(el,Math.max(5,Math.min(95,p[0])),Math.max(10,Math.min(90,p[1])));};
    el.onpointerup=e=>{if(!moving)return;moving=false;const p=pointsEvent(e),t=targets.find(t=>Math.hypot((p[0]-parseFloat(t.style.left)),(p[1]-parseFloat(t.style.top))*.7)<15);if(t){finish(t);e.preventDefault();}else{pos(el,...origin);}};
    el.onpointercancel=()=>{moving=false;if(origin)pos(el,...origin);};
  }
  function place(items,targets){goal(items.length);let selected=null;const ts=targets.map(t=>{const el=piece(t.icon,t.x,t.y,t.label,null,'target');el.dataset.match=t.id;return el;});items.forEach(i=>{const el=piece(i.icon,i.x,i.y,i.label);drag(el,ts,t=>{if(t.dataset.match!==i.id||t.classList.contains('done')){retry(el,'Find its matching place.');return false;}el.disabled=true;t.classList.add('done');step(t);return true;});});return ts;}
  function routeGame(icon,pts,theme=''){if(theme)stage.classList.add(theme);goal(pts.length);scene('<polyline points="'+pts.map(p=>`${p[0]*8},${p[1]*4.4}`).join(' ')+'" fill="none" stroke="white" stroke-width="26" stroke-linecap="round"/><polyline points="'+pts.map(p=>`${p[0]*8},${p[1]*4.4}`).join(' ')+'" fill="none" stroke="#b29bd8" stroke-width="5" stroke-dasharray="10 12"/>');const player=piece(icon,pts[0][0]-9,pts[0][1], 'Go!');let next=0;const nodes=pts.map((p,i)=>piece('⭐',...p,String(i+1),()=>visit(i),'target'));function visit(i){if(i!==next){retry(nodes[i],'Follow the glowing star.');return;}nodes[i].disabled=true;nodes[i].classList.add('done');pos(player,...pts[i]);next++;step(nodes[i]);highlight();}function highlight(){nodes.forEach((n,i)=>n.classList.toggle('selected',i===next));}highlight();let drawing=false;stage.onpointerdown=e=>{drawing=true;};stage.onpointermove=e=>{if(!drawing||won)return;const p=pointsEvent(e);if(next<pts.length&&Math.hypot(p[0]-pts[next][0],(p[1]-pts[next][1])*.7)<10)visit(next);};stage.onpointerup=stage.onpointercancel=()=>drawing=false;player.onpointerdown=e=>{drawing=true;stage.setPointerCapture(e.pointerId);};}
  function swipe(action){let start=null;stage.onpointerdown=e=>{start=pointsEvent(e);if(!e.target.closest('button'))stage.setPointerCapture(e.pointerId);};stage.onpointerup=e=>{if(!start||won)return;const end=pointsEvent(e),dx=end[0]-start[0],dy=end[1]-start[1];start=null;if(Math.hypot(dx,dy)>10)action(dx,dy);};stage.onpointercancel=()=>start=null;}
  function animate(fn){const token=session;let last=performance.now(),elapsed=0;function tick(now){if(token!==session||won||!dialog.open)return;elapsed+=(now-last)/1000;last=now;fn(elapsed);frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);}
  function meter(){const box=document.createElement('div');box.className='kw-meter';box.innerHTML='<div class="kw-meter-fill"></div>';stage.append(box);return percent=>box.firstChild.style.width=percent+'%';}
  function timedSport(kind){goal(kind==='dive'?1:3);const icon=kind==='tennis'?'🎾':kind==='baseball'?'⚾':'🛟';const ball=piece(icon,85,45,kind==='dive'?'Ring':'Ball');const athlete=decor('🧒',26,40);athlete.innerHTML=extraCell(kind==='tennis'?13:kind==='baseball'?14:1);const target=piece('✨',28,50,'Here',null,'target');let x=85,cool=false;const hit=()=>{if(cool||won)return;if(Math.abs(x-28)<21){cool=true;ball.classList.add('kw-bounce');step(ball);later(()=>{cool=false;ball.classList.remove('kw-bounce');},500);}else retry(ball,'Wait until it reaches the glowing space.');};controls(button(kind==='dive'?'🤿 Dive!':kind==='baseball'?'🏏 Swing!':'🎾 Hit!',hit));target.onclick=hit;animate(t=>{x=85-(t%3.2)/3.2*70;pos(ball,x,kind==='dive'?56:45);});if(kind==='dive')stage.classList.add('water');}
  function paintGame(kind){stage.classList.add('kitchen');const subject={toast:'🍞',pancakes:'🥞',chicken:'🍗'}[kind];decor(subject,50,48,'clamp(150px,32vw,300px)');goal(kind==='chicken'?3:6);const c=document.createElement('canvas');c.className='kw-paint';c.width=800;c.height=440;c.setAttribute('aria-label','Draw honey on the '+kind);stage.append(c);const ctx=c.getContext('2d');ctx.strokeStyle='#e8a319';ctx.lineWidth=kind==='pancakes'?10:27;ctx.lineCap='round';let down=false,last=null;const cells=new Set();function draw(e){const p=pointsEvent(e);if(p[0]<28||p[0]>72||p[1]<18||p[1]>76)return;const v=[p[0]*8,p[1]*4.4];if(last){ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(...v);ctx.stroke();}last=v;const cell=Math.floor((p[0]-28)/15)+':'+Math.floor((p[1]-18)/20);if(!cells.has(cell)){cells.add(cell);if(kind!=='chicken'||cells.size%2===0)step();}}c.onpointerdown=e=>{down=true;c.setPointerCapture(e.pointerId);draw(e);};c.onpointermove=e=>{if(down)draw(e);};c.onpointerup=c.onpointercancel=()=>{down=false;last=null;};controls(button('🍯 Add a brush stroke',()=>{const x=250+(earned%3)*100,y=140+Math.floor(earned/3)*100;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+65,y+35);ctx.stroke();step();}));}
  function open(){cleanup();earned=0;won=false;stage.innerHTML='';stage.className='kw-stage';stage.removeAttribute('style');dialog.querySelector('.kw-bottom .kw-actions').innerHTML='';status.textContent='';success.hidden=true;success.innerHTML='';dialog.querySelector('.kw-bottom').hidden=false;stage.hidden=false;instruction.textContent=games[active][2];title.textContent=games[active][1]+' '+games[active][0];goal(1);video.pause();if(!dialog.open)dialog.showModal();render(games[active][3]);dressScene();dialog.querySelector('.kw-head button:last-child').focus();}
  function win(){if(won)return;won=true;cancelAnimationFrame(frame);sound?.pause();window.speechSynthesis?.cancel();status.textContent='Great job!';later(()=>{
    success.innerHTML='<div class="activity-completion-frame"><button type="button" class="activity-completion-close" aria-label="Close celebration">×</button><video class="activity-completion-video" playsinline aria-label="Good job celebration"></video><p class="activity-completion-static" hidden>⭐ Great job! 🏆</p><div class="activity-completion-actions"></div></div>';
    success.hidden=false;
    const reward=success.querySelector('video'),fallback=success.querySelector('.activity-completion-static');
    reward.src=new URL('https://pub-aa69c309a877446c857c4f2564279578.r2.dev/month9/20261030/apps/level-b/assets/rewards/good-job.mp4?asset=4d70710ea639',location.href).href;
    const hide=()=>{reward.pause();success.hidden=true;watch.focus();};
    success.querySelector('.activity-completion-close').onclick=hide;
    const actions=success.querySelector('.activity-completion-actions');
    actions.append(button('↻ Try Again',()=>open(),'activity-completion-retry'),button('▶ Watch Video',watchVideo,'activity-completion-retry'));
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){reward.hidden=true;fallback.hidden=false;}else reward.play().catch(()=>{reward.hidden=true;fallback.hidden=false;});
    disposers.push(()=>reward.pause());success.querySelector('button').focus();
  },500);}
  function render(type){
    if((week===1&&((level==='b'&&['wind','buzz','baby','birds','cat'].includes(type))||(level==='a'&&['jump','swing','track','climb','lift','strokes'].includes(type))))||(level==='a'&&[2,3,4].includes(week))||(level==='b'&&[2,3,4].includes(week))){
      const token=session;status.textContent='Your 3D activity is coming…';
      import(asset('sound-world-games.js?v=b4-framing')).then(({mountSoundGame})=>{
        if(token!==session)return;
        disposers.push(mountSoundGame({type,stage,controls,button,status,goal,step,retry,asset}));
      }).catch(()=>{if(token===session)status.textContent='The 3D activity could not load. Please restart or skip to the video.';});
      return;
    }
    if(type==='track')return routeGame('🏃',[[15,70],[32,45],[50,65],[68,35],[85,55]]);
    if(type==='swimRoute')return routeGame('🏊',[[25,65],[50,42],[78,65]],'water');
    if(type==='skate'){decor('🚧',35,73);decor('🚧',65,35);return routeGame('⛸️',[[15,60],[35,40],[60,68],[85,40]]);}
    if(type==='grass'){decor('🌿',25,78);decor('🌿',65,78);return routeGame('🐝',[[18,65],[38,69],[60,63],[83,67]]);}
    if(type==='nearPlants'){decor('🪴',25,57);decor('🪴',55,46);decor('🪴',83,60);return routeGame('🐝',[[20,37],[51,28],[80,40]]);}
    if(type==='buzz'){soundOf('bees-buzzing');decor('🌼',25,60);decor('🌸',52,42);decor('🌻',80,65);return routeGame('🐝',[[25,38],[52,23],[80,43]]);}
    if(type==='water'){stage.classList.add('water');decor('🧒',10,38);return routeGame('🐝',[[28,30],[48,25],[68,32],[85,25]],'water');}
    if(['tennis','baseball','dive'].includes(type))return timedSport(type);
    if(type==='toast')return paintGame(type);
    if(type==='pancakes'){stage.classList.add('kitchen');goal(3);let selected=null,pouring=false,amount=0;const stacks=[22,50,78].map((x,i)=>piece('🥞',x,48,'Stack '+(i+1),()=>{if(stacks[i].disabled)return;selected=stacks[i];stacks.forEach(s=>s.classList.toggle('selected',s===selected));status.textContent='Hold Pour to drizzle honey.';}));const pour=button('🍯 Hold to pour',()=>{});controls(pour);pour.onpointerdown=e=>{if(!selected||won){status.textContent='Choose a pancake stack first.';return;}pouring=true;amount=0;pour.setPointerCapture(e.pointerId);};pour.onpointerup=pour.onpointercancel=()=>pouring=false;pour.onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&selected){e.preventDefault();pouring=true;}};pour.onkeyup=()=>pouring=false;let last=0;animate(t=>{const dt=t-last;last=t;if(!pouring||!selected)return;amount+=dt;selected.style.filter='drop-shadow(0 0 '+Math.min(18,amount*18)+'px #db9900)';if(amount>=1){selected.disabled=true;selected.classList.remove('selected');selected.insertAdjacentHTML('beforeend','<span>🍯 Yummy!</span>');step(selected);selected=null;pouring=false;}});return;}
    if(type==='chicken'){stage.classList.add('kitchen');goal(3);const brush=piece('🖌️',50,20,'Honey brush');const pieces=[22,50,78].map((x,i)=>piece('🍗',x,62,'Chicken '+(i+1),null,'target'));drag(brush,pieces,t=>{if(t.disabled)return false;t.disabled=true;t.classList.add('done');t.style.background='#ffdc83';t.insertAdjacentHTML('beforeend','<span>🍯 Glazed!</span>');step(t);later(()=>pos(brush,50,20),300);return false;});return;}

    if(type==='jump'){goal(3);const p=piece('🏃',20,55,'Runner');const puddle=piece('💧',50,72,'Puddle');controls(button('⬆ Jump!',()=>{if(p.classList.contains('kw-bounce')||won)return;p.classList.add('kw-bounce');pos(p,42+earned*18,55);step(p);later(()=>{p.classList.remove('kw-bounce');pos(puddle,65+earned*8,72);},450);}));decor('🏁',91,45);return;}
    if(type==='swing'){goal(4);const child=piece('🧒',50,50,'Swing');let dir=1;const push=d=>{if(d!==dir)return retry(child,'Now swing the other way.');pos(child,d>0?65:35,45);dir*=-1;step(child);};swipe(dx=>push(dx>0?1:-1));controls(button('⬅',()=>push(-1)),button('➡',()=>push(1)));return;}
    if(type==='climb'){goal(4);const climber=piece('🧗',25,80,'Climber');[[38,70],[48,54],[58,36],[57,17]].forEach((p,i)=>{const hold=piece(i===3?'🚩':'🪨',...p,String(i+1),()=>{if(earned!==i)return retry(hold,'Find the next handhold.');pos(climber,p[0]-9,p[1]);hold.disabled=true;step(hold);},'target');});return;}
    if(type==='lift'){scene('<path d="M450 140H720" stroke="#9c7052" stroke-width="22"/>');decor('🧒',25,65);return place([{id:'basket',icon:'🧺',x:48,y:80,label:'Lift me'}],[{id:'basket',icon:'⬆️',x:68,y:28,label:'Shelf'}]);}
    if(type==='strokes'){stage.classList.add('water');goal(6);const swimmer=piece('🏊',15,48,'Swimmer');let next=0;function stroke(side){if(side!==next)return retry(swimmer,'Use the other hand now.');pos(swimmer,20+earned*12,48);next=1-next;step(swimmer);status.textContent=next?'Now the right hand!':'Now the left hand!';}controls(button('🤚 Left',()=>stroke(0)),button('✋ Right',()=>stroke(1)));decor('🏁',92,30);return;}
    if(type==='race'){goal(4);const runner=piece('🏃',15,50,'Runner'),light=bubble('🔴 Wait…');let ready=false;later(()=>{ready=true;light.textContent='🟢 Run!';},1800);controls(button('🏃 Run!',()=>{if(!ready)return retry(runner,'Wait for green.');pos(runner,30+earned*18,50);step(runner);}));scene('<path d="M40 310H760M40 330H760" stroke="white" stroke-width="5"/>');decor('🏁',90,45);return;}
    if(type==='serve'){decor('🧒',75,62);return place([{id:'serve',icon:'<svg viewBox="0 0 100 100" width="65" height="65" aria-hidden="true"><path d="M35 65L10 12L30 6L50 10L70 6L90 12L65 65Z" fill="white" stroke="#65829f" stroke-width="3"/><path d="M30 10L42 65M50 10V65M70 10L58 65" stroke="#92acc5" stroke-width="3"/><path d="M35 65H65V78A15 15 0 0 1 35 78Z" fill="#e8b582" stroke="#9c704a" stroke-width="3"/></svg>',x:20,y:38,label:'Shuttlecock'}],[{id:'serve',icon:'🏸',x:70,y:40,label:'Serve here'}]);}
    if(type==='cycle'){goal(3);const rider=piece('🚴',30,67,'Cyclist');let round=0;const blocks=[1,0,1],cones=[decor('🚧',70,35),decor('🚧',70,70)];function show(){cones.forEach((c,i)=>c.hidden=i!==blocks[round]);}function steer(lane){if(lane===blocks[round])return retry(rider,'That lane has a cone!');pos(rider,30+round*20,lane?68:35);round++;step(rider);if(!won)show();}show();controls(button('⬆ Upper lane',()=>steer(0)),button('⬇ Lower lane',()=>steer(1)));return;}
    if(type==='basket'){decor('⛹️',20,65);return place([{id:'ball',icon:'🏀',x:30,y:70,label:'Basketball'}],[{id:'ball',icon:'<svg viewBox="0 0 100 100" width="70" height="70" aria-hidden="true"><rect x="10" y="5" width="80" height="50" rx="5" fill="white" stroke="#567" stroke-width="5"/><path d="M25 50L35 90H65L75 50M35 50L45 90M50 50V90M65 50L55 90M30 65H70M33 78H67" fill="none" stroke="#789" stroke-width="3"/><ellipse cx="50" cy="50" rx="27" ry="8" fill="none" stroke="#ed6c35" stroke-width="6"/></svg>',x:75,y:25,label:'Hoop'}]);}
    if(type==='volley'){goal(3);const player=decor('🧒',20,65);player.innerHTML=extraCell(15);scene('<path d="M480 100V350M480 100H760M480 150H760M480 200H760M550 100V220M620 100V220M690 100V220" stroke="white" stroke-width="6"/>');const ball=piece('🏐',30,65,'Volleyball');const bump=()=>{if(won)return;pos(ball,70,24);step(ball);later(()=>{if(!won)pos(ball,30,65);},700);};swipe((dx,dy)=>{if(dy<-10)bump();else retry(ball,'Swipe upward.');});controls(button('🙌 Bump!',bump));return;}
    if(type==='soccer'){const goalEl=piece('🥅',78,38,'Goal',null,'target'),ball=piece('⚽',22,75,'Soccer ball');drag(ball,[goalEl],()=>{step(goalEl);ball.disabled=true;return true;});return;}
    if(type==='golf'){scene('<path d="M160 330L600 140" stroke="white" stroke-width="8" stroke-dasharray="12 12"/>');return place([{id:'golf',icon:'⚪',x:20,y:75,label:'Golf ball'}],[{id:'golf',icon:'⛳',x:75,y:30,label:'Hole'}]);}
    if(type==='helmet'){decor('🚴',55,66,'clamp(100px,20vw,190px)');return place([{id:'head',icon:'⛑️',x:20,y:35,label:'Helmet'}],[{id:'head',icon:'🧒',x:55,y:30,label:'Head'}]);}
    if(type==='sneakers'){decor('🧒',50,35);return place([{id:'left',icon:'👟',x:18,y:40,label:'Left sneaker'},{id:'right',icon:'👟',x:82,y:40,label:'Right sneaker'}],[{id:'left',icon:'👣',x:40,y:72,label:'Left foot'},{id:'right',icon:'👣',x:62,y:72,label:'Right foot'}]);}
    if(type==='bicycle'){decor('🚲',50,45,'clamp(110px,22vw,200px)');return place([{id:'wheel1',icon:'🛞',x:20,y:80,label:'Front wheel'},{id:'wheel2',icon:'🛞',x:80,y:80,label:'Back wheel'}],[{id:'wheel1',icon:'◯',x:35,y:52,label:'Front'},{id:'wheel2',icon:'◯',x:65,y:52,label:'Back'}]);}
    if(type==='socks'){goal(3);let first=null;const colors=['#ff6f91','#61b9ee','#e9b636'];const order=shuffle([0,0,1,1,2,2]);order.forEach((c,i)=>{const el=piece('🧦',20+(i%3)*30,35+Math.floor(i/3)*37,['Pink','Blue','Yellow'][c],()=>{if(el.disabled||first===el)return;if(!first){first=el;el.classList.add('selected');return;}if(first.dataset.color===String(c)){first.disabled=el.disabled=true;first.classList.remove('selected');first.classList.add('done');el.classList.add('done');first=null;step(el);}else{retry(el,'Find the same color.');first.classList.remove('selected');first=null;}});el.dataset.color=c;el.style.background=colors[c];el.style.borderRadius='20px';});return;}
    if(type==='gloves'){decor('🧒',50,52,'clamp(100px,18vw,160px)');return place([{id:'l',icon:'🥊',x:18,y:78,label:'Left glove'},{id:'r',icon:'🥊',x:82,y:78,label:'Right glove'}],[{id:'l',icon:'🤚',x:32,y:45,label:'Left hand'},{id:'r',icon:'✋',x:68,y:45,label:'Right hand'}]);}
    if(type==='swimsuit'){stage.classList.add('water');bubble('A trip to the swimming pool!');const bag=piece('👜',78,65,'Swimming bag',null,'target');[['🧥','Coat'],['🩱','Swimsuit'],['🧣','Scarf']].forEach(([icon,label],i)=>{const el=piece(icon,20+i*25,35,label);if(label==='Swimsuit')drag(el,[bag],()=>{el.disabled=true;step(bag);return true;});else el.onclick=()=>retry(el,'What do we wear for swimming?');});return;}
    if(type==='wind'){goal(4);const leaves=[decor('🍃',20,45),decor('🍂',40,65),decor('🍃',65,30)];decor('🌳',85,55);const blow=()=>{soundOf('wind-blowing');leaves.forEach((l,i)=>pos(l,15+((earned*19+i*23)%70),25+((earned*13+i*20)%45)));step(leaves[0]);};swipe(blow);controls(button('🌬️ Blow the wind',blow));return;}
    if(type==='bark'){
      goal(3);const token=session;status.textContent='Your puppy is coming…';
      import(asset('dog-barking-game.js?v=2')).then(({mountDogGame})=>{
        if(token!==session)return;
        disposers.push(mountDogGame({stage,controls,button,status,step,retry,audioURL:asset('keyword-audio/dog-barking.mp3')}));
      }).catch(()=>{if(token===session)status.textContent='The puppy could not load. Try restarting the activity, or skip to the video.';});
      return;
    }
    if(type==='baby'){const correct=Math.floor(Math.random()*3);soundOf('baby-crying');bubble('Who is crying?');for(let i=0;i<3;i++){const el=piece('🪟',22+i*28,52,'Window '+(i+1),()=>{if(i===correct){el.innerHTML=art('👨‍🍼')+'<span>Baby crying</span>';soundOf('baby-crying');step(el);}else{el.innerHTML=art('🛏️')+'<span>Look again</span>';retry(el,'Listen for the baby.');}});}controls(button('🔊 Hear the cry',()=>soundOf('baby-crying')));return;}
    if(type==='birds'){goal(4);let next=0;const order=[0,2,1,2],birds=[];scene('<path d="M80 260Q400 150 740 210" stroke="#9c704e" stroke-width="20" fill="none"/>');for(let i=0;i<3;i++){const el=piece('🐦',23+i*28,48-i*5,'Bird '+(i+1),()=>{soundOf('birds-chirping');if(i!==order[next])return retry(el,'Tap the glowing bird.');step(el);next++;show();});birds.push(el);}function show(){birds.forEach((b,i)=>b.classList.toggle('selected',!won&&i===order[next]));}show();return;}
    if(type==='cat'){const sounds=shuffle(['cat-meowing','dog-barking','birds-chirping']);let chosen=-1;const cats=sounds.map((s,i)=>piece(['🐈','🐈‍⬛','🐈'][i],22+i*28,45,'Listen '+(i+1),()=>{chosen=i;soundOf(s);cats.forEach((c,k)=>c.classList.toggle('selected',k===i));}));controls(button('🐈 This one meows!',()=>{if(chosen<0){status.textContent='Tap a cat to listen first.';return;}if(sounds[chosen]==='cat-meowing')step(cats[chosen]);else retry(cats[chosen],'That is a different sound. Listen again.');}));return;}
    if(type==='sun'){stage.classList.add('space');decor('🌍',50,65,'clamp(100px,20vw,180px)');const sun=decor('☀️',50,75);const range=document.createElement('input');range.type='range';range.min=0;range.max=100;range.value=0;range.className='kw-range';range.setAttribute('aria-label','Raise the sun');range.oninput=()=>{pos(sun,50,75-range.value*.55);stage.style.filter=`brightness(${.6+Number(range.value)/250})`;if(range.value>90&&!won)step(sun);};stage.append(range);return;}
    if(type==='plant'){const pot=piece('🪴',60,63,'Planting pot',null,'target'),seed=piece('🫘',20,35,'Seed');drag(seed,[pot],()=>{seed.hidden=true;status.textContent='Now water the seed!';const water=piece('🚿',25,38,'Water',()=>{pot.innerHTML=art('🌱')+'<span>A plant!</span>';water.disabled=true;step(pot);});return true;});return;}
    if(type==='cleanWater'){goal(3);decor('🌍',50,78);shuffle([true,false,true,false,true]).forEach((clean,i)=>{const el=piece(clean?'💧':'🟤',15+i*17,35+(i%2)*15,clean?'Clean drop':'Muddy drop',()=>{if(!clean)return retry(el,'Earth needs clean water.');el.disabled=true;pos(el,50,70);step(el);});});return;}
    if(type==='bloom'){goal(4);for(let i=0;i<4;i++){const el=piece('🌱',18+i*21,50+(i%2)*15,'Flower bud',()=>{el.innerHTML=art(['🌸','🌻','🌼','🌷'][i])+'<span>Flower!</span>';el.disabled=true;step(el);});}return;}
    if(type==='forest'){return place([{id:'a',icon:'🌳',x:18,y:30,label:'Leafy tree'},{id:'b',icon:'🌲',x:50,y:30,label:'Pine tree'},{id:'c',icon:'🌴',x:82,y:30,label:'Palm tree'}],[{id:'a',icon:'🕳️',x:18,y:75,label:'Leafy tree here'},{id:'b',icon:'🕳️',x:50,y:75,label:'Pine here'},{id:'c',icon:'🕳️',x:82,y:75,label:'Palm here'}]);}
    if(type==='insects'){goal(3);shuffle(['🐞','🍃','🦋','🌿','🐝','🍂']).forEach((icon,i)=>{const insect=['🐞','🦋','🐝'].includes(icon);const el=piece(icon,20+(i%3)*30,35+Math.floor(i/3)*35,insect?'Insect':'Leaf',()=>{if(!insect)return retry(el,'Look for a little insect.');el.disabled=true;step(el);});});return;}
    if(type==='animals'){return place([{id:'fish',icon:'🐟',x:20,y:28,label:'Fish'},{id:'bird',icon:'🐦',x:50,y:28,label:'Bird'},{id:'elephant',icon:'🐘',x:80,y:28,label:'Elephant'}],[{id:'fish',icon:'🌊',x:20,y:72,label:'Water'},{id:'bird',icon:'🪺',x:50,y:72,label:'Nest'},{id:'elephant',icon:'🌳',x:80,y:72,label:'Land'}]);}
    if(type==='air'){goal(4);decor('🌍',50,55,'clamp(100px,22vw,190px)');const clouds=[];for(let i=0;i<4;i++){const c=piece('☁️',25+i*17,35+(i%2)*25,'Gray cloud',()=>clear(c));c.style.filter='grayscale(1) brightness(.55)';clouds.push(c);}function clear(c){if(c.disabled)return;c.hidden=true;c.disabled=true;step(c);}swipe(()=>{const c=clouds.find(c=>!c.disabled);if(c)clear(c);});return;}
    if(type==='nearFlowers'){const bee=piece('🐝',50,20,'Bee');const targets=[piece('🌼',23,65,'Flowers',null,'target'),piece('🪨',50,65,'Rocks',null,'target'),piece('🌳',77,65,'Tree',null,'target')];drag(bee,targets,t=>{if(t!==targets[0]){retry(bee,'Find the flowers.');return false;}step(t);bee.disabled=true;return true;});return;}
    if(type==='sky'){decor('☁️',20,25);decor('☁️',80,20);return place([{id:'sky',icon:'🐝',x:50,y:78,label:'Lift the bees'}],[{id:'sky',icon:'☁️',x:50,y:25,label:'Sky'}]);}
    if(type==='nearTrees'){decor('🌳',28,56,'clamp(100px,22vw,190px)');decor('🌳',75,56,'clamp(100px,22vw,190px)');return place([{id:'a',icon:'🐝',x:35,y:83,label:'Bee one'},{id:'b',icon:'🐝',x:65,y:83,label:'Bee two'}],[{id:'a',icon:'🌿',x:20,y:30,label:'Branch one'},{id:'b',icon:'🌿',x:78,y:30,label:'Branch two'}]);}
    if(type==='tea'){stage.classList.add('kitchen');goal(4);const tea=piece('🍵',62,50,'Tea',null,'target'),honey=piece('🍯',20,35,'Honey');drag(honey,[tea],()=>{if(honey.disabled)return false;honey.disabled=true;honey.hidden=true;step(tea);status.textContent='Stir your honey tea three times.';controls(button('🥄 Stir',()=>{tea.classList.add('kw-bounce');step(tea);later(()=>tea.classList.remove('kw-bounce'),400);}));return true;});return;}
    if(type==='spread'){stage.classList.add('kitchen');goal(5);decor('🥣',50,50,'clamp(130px,25vw,220px)');const spoon=piece('🥄',60,35,'Mix');const mix=()=>{pos(spoon,50+Math.cos(earned*1.8)*18,48+Math.sin(earned*1.8)*20);step(spoon);};swipe(mix);controls(button('🥄 Stir around',mix));return;}
    if(type==='cookies'){stage.classList.add('kitchen');scene('<defs><linearGradient id="kw-tray" x2="0" y2="1"><stop stop-color="#eef1f8"/><stop offset=".5" stop-color="#b4bac8"/><stop offset="1" stop-color="#80899d"/></linearGradient></defs><rect x="310" y="78" width="430" height="300" rx="30" fill="#586477" opacity=".4"/><rect x="310" y="65" width="430" height="300" rx="30" fill="url(#kw-tray)" stroke="#8994a8" stroke-width="12"/><rect x="327" y="82" width="396" height="266" rx="22" fill="none" stroke="#ffffff88" stroke-width="5"/>');return place([{id:'round',icon:'🍪',x:15,y:25,label:'Round cookie'},{id:'heart',icon:'💛',x:15,y:50,label:'Heart cookie'},{id:'star',icon:'⭐',x:15,y:78,label:'Star cookie'}],[{id:'round',icon:'◯',x:58,y:28,label:'Round space'},{id:'heart',icon:'♡',x:78,y:50,label:'Heart space'},{id:'star',icon:'☆',x:58,y:73,label:'Star space'}]);}
  }
  function shuffle(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
})();
