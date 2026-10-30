(() => {
  const items=[
 {id:'snail',name:'Snail with a wheel',x:16.5,y:78,w:24,h:26,icon:'🐌',message:'A snail has a spiral shell. This one has a toy wheel!'},
 {id:'nest',name:'Socks in a bird nest',x:20,y:30,w:21,h:20,icon:'🧦',message:'Those are socks in the nest! Socks belong on feet.'},
 {id:'cloud',name:'Rain cloud indoors',x:59,y:11,w:27,h:22,icon:'🌧️',message:'Clouds are outside in the sky. This one is raining inside!'},
 {id:'stool',name:'Upside-down stool',x:84,y:76,w:23,h:29,icon:'🪑',message:'The stool is upside down! Its legs should stand on the floor.'}
 ];
 const normal=[['Watering can',68,60,13,18],['Book',83,52,11,7],['Fern',34,26,15,22],['Plant pots',25,61,15,20]];
  window.Month9Mistakes={mount({stage,prompt,instruction,tone,feedback,complete,say=()=>{}}){
    const found=new Set();let timer,done=false;
    prompt.textContent='Find 4 silly mistakes.';
    instruction.textContent='Look around the glasshouse. Which four things are not quite right?';
    stage.innerHTML=`<div class="picture-hunt"><div class="hunt-scene"><div class="hunt-art-frame"><img class="hunt-photo" src="assets/glasshouse-mistakes-v2.png" alt="A glasshouse discovery corner with four silly mistakes" draggable="false">${items.map(i=>`<button class="mistake-target" data-mistake="${i.id}" aria-label="${i.name}" style="left:${i.x}%;top:${i.y}%;width:${i.w}%;height:${i.h}%"></button>`).join('')}${normal.map(([name,x,y,w,h])=>`<button class="mistake-target" data-normal="${name}" aria-label="${name}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></button>`).join('')}<span class="hunt-wrong-mark" aria-hidden="true">×</span></div><div class="hunt-response" role="status"></div></div><aside class="hunt-list mistakes-list"><h3>My discoveries <span class="hunt-count">0 / 4</span></h3><ul>${items.map((_,i)=>`<li data-slot="${i}"><span class="discovery-icon">?</span><span class="list-name">Mystery ${i+1}</span></li>`).join('')}</ul><p>What looks out of place?</p></aside></div>`;
    const scene=stage.querySelector('.hunt-scene'),frame=stage.querySelector('.hunt-art-frame'),response=stage.querySelector('.hunt-response'),wrong=stage.querySelector('.hunt-wrong-mark');
    const fit=()=>{const width=Math.min(scene.clientWidth,scene.clientHeight*3/2);frame.style.width=width+'px';frame.style.height=width*2/3+'px';};
    const observer=new ResizeObserver(fit);observer.observe(scene);fit();
    function respond(text,kind){clearTimeout(timer);response.textContent=text;response.className='hunt-response visible '+kind;timer=setTimeout(()=>{response.classList.remove('visible');wrong.classList.remove('show');},900);}
    function choose(e){if(done)return;const b=e.target.closest('button');if(!b){feedback('Look closely at what each thing is doing. Can you find something silly?');return;}
      if(b.dataset.normal){const r=frame.getBoundingClientRect(),p=b.getBoundingClientRect();wrong.style.left=p.x+p.width/2-r.x+'px';wrong.style.top=p.y+p.height/2-r.y+'px';wrong.classList.add('show');respond('× This belongs here','try');tone('wrong');feedback(`${b.dataset.normal} belongs in the glasshouse. Keep looking!`);say(`${b.dataset.normal}. This belongs here. Look for something out of place.`);return;}
      const item=items.find(i=>i.id===b.dataset.mistake);if(!item)return;if(found.has(item.id)){respond('✓ Already discovered!','good');say(item.name+'. You already found this one!');return;}
      wrong.classList.remove('show');const slot=stage.querySelector(`[data-slot="${found.size}"]`);found.add(item.id);slot.classList.add('discovered');slot.querySelector('.discovery-icon').textContent=item.icon;slot.querySelector('.list-name').textContent=item.name;
      const check=document.createElement('span');check.className='hunt-found-mark';check.textContent='✓';check.style.left=item.x+'%';check.style.top=item.y+'%';frame.append(check);b.setAttribute('aria-label',item.name+' found');
      stage.querySelector('.hunt-count').textContent=found.size+' / 4';respond('✓ Mistake found!','good');feedback(item.message,'good');tone('good');say(item.name+'. '+item.message);
      if(found.size===4){done=true;complete(b,'You found all four mistakes! Great spotting.');}
    }
    const pointer=e=>{if(e.button===0&&e.isPrimary)choose(e);},keyboard=e=>{if(e.detail===0)choose(e);};
    scene.addEventListener('pointerdown',pointer);scene.addEventListener('click',keyboard);feedback('Look closely! Four things in this glasshouse are not quite right.');
    return {dispose(){clearTimeout(timer);observer.disconnect();scene.removeEventListener('pointerdown',pointer);scene.removeEventListener('click',keyboard);}};
  }};
})();


