/* Level B (age 4): short, untimed nature adventures with forgiving input. */
(() => {
 'use strict';
 const names={spotlight:'Picture Hunt',mistakes:'Spot the Mistakes',connecting:'Path Finder',coloring:'Color Studio',abc:'ABC Connect',maze:'Maze Explorer',numbers:'Number Connect',puzzle:'Picture Puzzle',pattern:'Pattern Builder',collect:'Count & Collect',arithmetic:'Add & Take Away'};
 const requested=new URLSearchParams(location.search).get('game');
 const game=Object.hasOwn(names,requested)?requested:'spotlight';
 const category=['spotlight','mistakes','connecting','coloring'].includes(game)?'wonder':game==='abc'?'phonics':'puzzle';
 const $=id=>document.getElementById(id),stage=$('stage'),labels={dipper:'Honey dipper',teapot:'Teapot',scale:'Kitchen scale',mitt:'Oven mitt',jar:'Honey jar',apron:'Apron',orange:'Orange'};
 const targets=[{id:'dipper',x:16,y:80,w:30,h:18},{id:'teapot',x:29,y:25,w:16,h:17},{id:'scale',x:48,y:62,w:18,h:26},{id:'mitt',x:57,y:30,w:12,h:33},{id:'jar',x:77,y:31,w:12,h:17},{id:'apron',x:88,y:61,w:12,h:38},{id:'orange',x:69,y:82,w:15,h:23}];
 const preview=t=>{const size=Math.max(t.w,t.h*2/3)*1.12,w=size,h=size*1.5;return `<span class="shop-thumbnail" aria-hidden="true"><img src="assets/honey-shop.png" alt="" style="width:${10000/w}%;height:${10000/h}%;left:${-100*(t.x-w/2)/w}%;top:${-100*(t.y-h/2)/h}%"></span>`;};
 let solved=false,muted=false,dispose=()=>{},timers=[],sounds=[];
 const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t;};
 const voice=window.Month9GameVoice.create({isMuted:()=>muted,onSpeaking:speaking=>sounds.forEach(clip=>{clip.volume=speaking ? .12 : .55;})});
 const say=(text,options)=>voice.say(text,options);
 voice.connect({prompt:$('prompt'),instruction:$('instruction'),listen:$('listen')});
 const tone=(finish=false)=>{if(muted)return;const audio=new Audio('/LevelB_M9/apps/level-a/games/adventures/assets/'+(finish?'round-celebration':'correct-bounce')+'.wav');audio.volume=voice.speaking ? .12 : .55;sounds.push(audio);audio.play().catch(()=>{});audio.onended=()=>{sounds=sounds.filter(x=>x!==audio);};};
 const feedback=text=>{$('feedback').textContent=text;};
 const progress=(n,total)=>{$('progress').textContent=`${n} / ${total}`;};
 function sparkle(target=stage){const star=document.createElement('span');star.className='spark';star.textContent='✨';star.setAttribute('aria-hidden','true');target.append(star);later(()=>star.remove(),750);}
 function finish(text){if(solved)return;solved=true;feedback(text);say(text,{queue:true});tone(true);sparkle();$('celebrate').hidden=false;$('celebrate').focus({preventScroll:true});}
 function setup(title,instruction){$('prompt').textContent=title;$('instruction').textContent=instruction;}
 function listenClick(handler){stage.onclick=e=>{if(!solved)handler(e);};}
 function hunt(){
  setup('Explore the honey shop!','Tap a little picture to hear its name. Then find it in the big picture.');
  const found=new Set();progress(0,7);
  const hit=t=>`<button class="item hunt-hotspot" data-item="${t.id}" aria-label="${labels[t.id]}" style="--x:${t.x}%;--y:${t.y}%;--size:${t.w}%;--height:${t.h}%"></button>`;
  stage.innerHTML=`<div class="play-layout"><div class="scene contextual-hunt">${targets.map(hit).join('')}${hit({id:'jar',x:24,y:58,w:8,h:12})}</div><aside class="side-panel" aria-label="Objects to find"><h3>Find these!</h3>${targets.map(t=>`<div class="check-item" data-check="${t.id}" data-voice-name="${labels[t.id]}" role="button" tabindex="0" aria-label="Hear ${labels[t.id]}">${preview(t)}<span>${labels[t.id]}</span></div>`).join('')}</aside></div>`;
  listenClick(e=>{const b=e.target.closest('[data-item]');if(!b){if(e.target.closest('.contextual-hunt')){feedback('Look for a matching picture on your list. Keep looking!');}return;}const id=b.dataset.item;if(found.has(id))return;found.add(id);b.classList.add('found');stage.querySelectorAll(`[data-item="${id}"]`).forEach(el=>el.disabled=true);stage.querySelector(`[data-check="${id}"]`).classList.add('done');say(labels[id],{queue:true});tone();progress(found.size,7);feedback(`${labels[id]} found!`);if(found.size===7)finish('You found all seven honey-shop discoveries!');});
 }
 let round=0;
 function baseline(){
  voice.newRound();
  stage.classList.add('baseline-stage');
  const options={stage,say,game,round,mode:game==='numbers'?'numbers':'letters',prompt:$('prompt'),instruction:$('instruction'),tone:type=>{if(type!=='wrong')tone(type==='finish');},feedback,reset:()=>{dispose();solved=false;if(game==='arithmetic')round=0;$('celebrate').hidden=true;$('progress').textContent='';baseline();},complete:(_,message)=>{if(['pattern','collect','arithmetic'].includes(game)&&round<2){feedback(message);say(message,{queue:true});tone();$('progress').textContent=`${round+1} / 3 rounds`;$('celebrate').hidden=false;$('celebrate').textContent='Next round →';$('celebrate').onclick=()=>{round++;dispose();$('celebrate').hidden=true;baseline();};}else{if(['pattern','collect','arithmetic'].includes(game))$('progress').textContent='3 / 3 rounds';finish(message);$('celebrate').textContent='Great job! ★';$('celebrate').onclick=()=>{voice.stop();window.showActivityReward();const v=document.querySelector('.reward-modal video');if(v)v.muted=muted;};}}};
  const module=['pattern','collect','arithmetic'].includes(game)?window.Month9MathGames:game==='mistakes'?window.Month9Mistakes:game==='connecting'?window.Month9Connecting:game==='maze'?window.Month9Maze:['abc','numbers'].includes(game)?window.Month9Dots:window.Month9Puzzle;
  const mounted=module.mount(options);dispose=()=>mounted.dispose();
 }
 function start(){dispose();dispose=()=>{};timers.forEach(clearTimeout);timers=[];sounds.forEach(a=>a.pause());sounds=[];voice.newRound();solved=false;stage.onclick=null;stage.innerHTML='';stage.classList.remove('baseline-stage');round=0;$('celebrate').textContent='Great job! ★';$('celebrate').hidden=true;$('progress').textContent='';feedback('Take your time. Let’s play!');if(['pattern','collect','arithmetic','connecting','maze','puzzle','abc','numbers','mistakes'].includes(game)){baseline();return;}({spotlight:hunt,coloring:()=>{const mounted=window.Month9Coloring.mount({stage,say,prompt:$('prompt'),instruction:$('instruction'),tone,feedback,complete:(_,message)=>finish(message)});dispose=()=>mounted.dispose();}})[game]();}
 document.body.dataset.category=category;document.body.dataset.game=game;$('title').textContent=names[game];document.title=names[game]+' · Level B · Week 4';$('back').href=category==='phonics'?'../phonics.html?week=4':`../${category}-week-4.html`;
 $('listen').onclick=()=>voice.readInstructions(true);
 $('restart').onclick=start;$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'♪̸':'♫';$('sound').setAttribute('aria-pressed',String(muted));$('sound').setAttribute('aria-label',muted?'Turn sounds on':'Mute sounds');if(muted){voice.stop();sounds.forEach(a=>a.pause());}};
 $('celebrate').onclick=()=>{voice.stop();window.showActivityReward();const video=document.querySelector('.reward-modal video');if(video)video.muted=muted;};
 addEventListener('pagehide',()=>{dispose();timers.forEach(clearTimeout);sounds.forEach(a=>a.pause());voice.stop();});start();
})();
