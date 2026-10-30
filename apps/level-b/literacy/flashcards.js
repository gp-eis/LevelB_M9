(() => {
 const params=new URLSearchParams(location.search),week=['1','2','3','4'].includes(params.get('week'))?params.get('week'):'1';
 const cards=window.ReviewFlashcards[week],level=document.body.dataset.level;
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
 $('.title').textContent=`Level ${level} · Week ${week} Big Book Flashcards`;
 $('.gp-navigation__week').href=`../week-${week}.html#card-literacy`;
 let back=new URL(`week-${week}-page-01.html`,location.href);
 try{const candidate=new URL(params.get('return')||back.href,location.href);const prefix=location.pathname.slice(0,location.pathname.lastIndexOf('/')+1);if(candidate.origin===location.origin&&candidate.pathname.startsWith(prefix)&&new RegExp(`^week-${week}-page-\\d{2}\\.html$`).test(candidate.pathname.slice(prefix.length)))back=candidate;}catch{}
 $('.gp-navigation__section').href=back.href;
 const bookQuestion=document.createElement('p');bookQuestion.className='fc-model';bookQuestion.textContent=cards[0].question;$('.title').after(bookQuestion);
 const byId=id=>cards.find(c=>c.id===id),random=()=>cards[Math.floor(Math.random()*cards.length)];
 function shuffle(input){const out=[...input];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
 let speechId=0,speechTimer;
 function stopSpeech(){speechId++;clearTimeout(speechTimer);window.speechSynthesis?.cancel();}
 function say(text,after){const id=speechId;if(!window.speechSynthesis){$('[data-audio-status]').textContent='Speech is unavailable in this browser.';return;}const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.86;u.pitch=1.08;u.onend=()=>{if(id===speechId&&after)speechTimer=setTimeout(()=>{if(id===speechId)after();},350);};u.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))$('[data-audio-status]').textContent='Tap Listen to try again.';};speechSynthesis.speak(u);}
 function speakCard(c){stopSpeech();say(c.label,()=>say(c.sentence));}
 const image=(c,thumb=false)=>`<img src="${thumb?c.thumbnail:c.image}" alt="${c.label}" draggable="false">`;
 const feature=$('[data-feature-card]'),thumbs=$('[data-card-list]');let current=cards[0],order=[...cards];
 function show(c=current,speak=false){stopSpeech();current=c;feature.innerHTML=image(c);feature.setAttribute('aria-label','Hear '+c.label);$('[data-model-sentence]').textContent=c.sentence;$('[data-card-count]').textContent=`${order.indexOf(c)+1} / ${order.length}`;thumbs.innerHTML=order.map(c=>`<button class="fc-thumb${c===current?' is-active':''}" data-card="${c.id}" aria-label="Show ${c.label}">${image(c,true)}</button>`).join('');thumbs.querySelectorAll('button').forEach(b=>b.onclick=()=>show(byId(b.dataset.card),true));if(speak)speakCard(c);}
 feature.onclick=()=>speakCard(current);$('[data-listen]').onclick=()=>speakCard(current);
 $('[data-prev]').onclick=()=>show(order[(order.indexOf(current)+order.length-1)%order.length],true);$('[data-next]').onclick=()=>show(order[(order.indexOf(current)+1)%order.length],true);$('[data-shuffle]').onclick=()=>{order=shuffle(cards);show(order[0]);};
 let fastTimer,peekTimer,fastCard,spotCard;
 function stopTimers(){clearTimeout(fastTimer);clearTimeout(peekTimer);}
 const fast=$('[data-fast-stage]');
 function cover(){fast.querySelector('.fc-curtain')?.classList.remove('is-hidden');}
 function peek(){stopTimers();fast.querySelector('.fc-curtain').classList.add('is-hidden');fastTimer=setTimeout(cover,300);}
 function newFast(){stopTimers();fastCard=random();fast.innerHTML=image(fastCard)+'<div class="fc-curtain">?</div>';peekTimer=setTimeout(peek,250);}
 $('[data-fast-peek]').onclick=peek;$('[data-fast-show]').onclick=()=>{stopTimers();fast.querySelector('.fc-curtain').classList.add('is-hidden');stopSpeech();say(fastCard.label);};$('[data-fast-new]').onclick=newFast;
 const spot=$('[data-spot-stage]');let spotX=50,spotY=50;
 function setSpot(){spot.style.setProperty('--spot-x',spotX+'%');spot.style.setProperty('--spot-y',spotY+'%');}
 function newSpot(){spotCard=random();spot.classList.remove('is-revealed');spot.innerHTML=image(spotCard);spotX=spotY=50;setSpot();}
 function reveal(){spot.classList.add('is-revealed');stopSpeech();say(spotCard.label);}
 spot.addEventListener('pointermove',e=>{const r=spot.getBoundingClientRect();spotX=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));spotY=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));setSpot();});
 spot.addEventListener('keydown',e=>{const m={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[e.key];if(m){e.preventDefault();spotX=Math.max(0,Math.min(100,spotX+m[0]));spotY=Math.max(0,Math.min(100,spotY+m[1]));setSpot();}else if(['Enter',' '].includes(e.key)){e.preventDefault();reveal();}});
 $('[data-spot-reveal]').onclick=reveal;$('[data-spot-new]').onclick=newSpot;
 const scatter=$('[data-sentence-choices]'),sentence=$('.fc-sentence'),blank=$('[data-sentence-blank]'),status=$('[data-sentence-status]');let ghost=null,gesture=null,suppress=0;
 // Keep each sentence frame visible and stable while children choose a matching card.
 const sentenceGroups=[];
 cards.forEach(c=>{const i=c.sentence.toLowerCase().indexOf(c.phrase.toLowerCase());if(i<0)throw new Error('Missing sentence phrase: '+c.id);const before=c.sentence.slice(0,i),after=c.sentence.slice(i+c.phrase.length);let group=sentenceGroups.find(g=>g.before===before&&g.after===after);if(!group){group={before,after,cards:[]};sentenceGroups.push(group);}group.cards.push(c);});
 let sentenceIndex=0;
 const sentenceNav=document.createElement('div');sentenceNav.className='fc-controls';sentenceNav.hidden=sentenceGroups.length<2;
 sentenceNav.innerHTML='<button class="fc-action" type="button" data-sentence-prev>← Previous Sentence</button><span data-sentence-count aria-live="polite"></span><button class="fc-action" type="button" data-sentence-next>Next Sentence →</button>';
 sentence.before(sentenceNav);
 sentenceNav.querySelector('[data-sentence-prev]').onclick=()=>{sentenceIndex=(sentenceIndex+sentenceGroups.length-1)%sentenceGroups.length;newSentence();};
 sentenceNav.querySelector('[data-sentence-next]').onclick=()=>{sentenceIndex=(sentenceIndex+1)%sentenceGroups.length;newSentence();};
 function place(c){if(!sentenceGroups[sentenceIndex].cards.includes(c))return;blank.textContent=c.phrase;scatter.querySelectorAll('button').forEach(b=>b.classList.toggle('is-used',b.dataset.card===c.id));status.textContent=c.sentence;window.gpFeedbackSounds?.correct();stopSpeech();say(c.sentence);}
 function cleanup(){ghost?.remove();ghost=null;gesture=null;blank.classList.remove('is-over');}
 function newSentence(){cleanup();stopSpeech();const group=sentenceGroups[sentenceIndex];sentence.replaceChildren(document.createTextNode(group.before),blank,document.createTextNode(group.after));blank.textContent='______';sentenceNav.querySelector('[data-sentence-count]').textContent=`${sentenceIndex+1} / ${sentenceGroups.length}`;status.textContent='Drag or tap any card into the blank.';scatter.innerHTML=shuffle(group.cards).map(c=>`<button class="fc-mini" data-card="${c.id}" aria-label="Use ${c.label}">${image(c,true)}</button>`).join('');scatter.querySelectorAll('button').forEach(b=>{
 b.onclick=()=>{if(performance.now()>=suppress)place(byId(b.dataset.card));};
 b.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;cleanup();b.setPointerCapture(e.pointerId);gesture={id:e.pointerId,x:e.clientX,y:e.clientY,button:b};});
 b.addEventListener('pointermove',e=>{if(!gesture||gesture.button!==b||gesture.id!==e.pointerId)return;if(!ghost&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<7)return;e.preventDefault();if(!ghost){ghost=new Image();ghost.src=byId(b.dataset.card).thumbnail;ghost.className='fc-drag-ghost';document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';const r=blank.getBoundingClientRect();blank.classList.toggle('is-over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);});
 b.addEventListener('pointerup',e=>{if(!gesture||gesture.button!==b)return;const moved=!!ghost,r=blank.getBoundingClientRect(),hit=e.clientX>=r.left-12&&e.clientX<=r.right+12&&e.clientY>=r.top-12&&e.clientY<=r.bottom+12;cleanup();if(moved){suppress=performance.now()+400;if(hit)place(byId(b.dataset.card));else status.textContent='Drop in the blank, or tap the picture.';}});
 ['pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,cleanup));});}
 $('[data-sentence-new]').onclick=newSentence;
 all('[data-tab]').forEach(tab=>tab.onclick=()=>{stopTimers();stopSpeech();cleanup();all('[data-tab]').forEach(b=>{const active=b===tab;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});all('[data-panel]').forEach(p=>{p.hidden=p.dataset.panel!==tab.dataset.tab;p.classList.toggle('is-active',!p.hidden);});if(tab.dataset.tab==='fast')newFast();if(tab.dataset.tab==='spot')newSpot();if(tab.dataset.tab==='sentence')newSentence();});
 addEventListener('pagehide',()=>{stopTimers();stopSpeech();cleanup();});show();newSpot();newSentence();
})();
