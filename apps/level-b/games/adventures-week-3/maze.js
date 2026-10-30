(() => {
  // Each pair is one open corridor. No moves may cross the grass between corridors.
  let selectedMaze=0;
  const originalRoute=[0,5,10,11,6,7,12,17,16,21,26,27,22,23,18,19,24,29];
  const branches=[[0,1,2,3,4,9,14,13,8],[10,15,20,25],[27,28]];
  const originalPaths=[originalRoute,...branches];

  const point=n=>[110+(n%5)*95,205+Math.floor(n/5)*100];
  window.Month9Maze={mount({stage,reset,prompt,instruction,tone,feedback,complete,say=()=>{}}){
    const maps=[n=>n,n=>Math.floor(n/5)*5+4-n%5,n=>(5-Math.floor(n/5))*5+n%5];
    const map=maps[selectedMaze],paths=originalPaths.map(path=>path.map(map));
    const edges=paths.flatMap(path=>path.slice(1).map((n,i)=>[path[i],n]));
    const start=map(0),goal=map(29);
    let current=start,trail=[start],done=false,drag=false,timer,lastSpokenHint=0,xScale=1,actorScale=1;const spokenMilestones=new Set();
    const speakHint=text=>{const now=Date.now();if(now-lastSpokenHint>=1800){say(text);lastSpokenHint=now;}};
    prompt.textContent='Help the bee fly home!';
    instruction.textContent='Drag the bee along the paths, or use the arrows. You can go back at a dead end.';
    const line=p=>p.map(n=>{const[x,y]=point(n);return [x*xScale,y].join(',');}).join(' ');
    stage.innerHTML=`<div class="maze-wrap"><div class="golf-game"><div class="golf-board"><svg viewBox="0 0 600 800" aria-label="Bee meadow maze" role="group"><image class="maze-backdrop" href="assets/meadow-garden.png" width="600" height="800" preserveAspectRatio="xMidYMid meet"/><g class="maze-corridors" fill="none" stroke-linecap="round" stroke-linejoin="round">${[ ["#66883c",48],["#fff0bd",35] ].map(([color,width])=>paths.map(p=>`<polyline data-maze-points="${line(p)}" points="${line(p)}" stroke="${color}" stroke-width="${width}"/>`).join('')).join('')}<polyline class="golf-trail" stroke="#f4bc51" stroke-width="10"/></g><g class="maze-hitnodes">${Array.from({length:30},(_,n)=>{const[x,y]=point(n);return `<circle cx="${x}" cy="${y}" r="23" fill="transparent" data-node="${n}"/>`;}).join('')}</g><g class="maze-goal" transform="translate(${point(goal).join(' ')})" pointer-events="none"><image href="assets/meadow-hive.png" x="-43" y="-36" width="86" height="72"/></g><g class="golf-ball" pointer-events="none"><image href="assets/meadow-bee.png" x="-35" y="-35" width="70" height="70"/></g></svg></div><aside class="maze-toolbox"><div class="maze-choice-panel"><p class="maze-panel-label">Choose a maze</p><div class="maze-picker" role="group" aria-label="Choose a maze">${[0,1,2].map(i=>`<button data-maze="${i}" aria-pressed="${selectedMaze===i}">Maze ${i+1}</button>`).join('')}</div></div><div class="maze-direction-panel"><p class="maze-panel-label">Move the bee</p><div class="golf-controls" aria-label="Move the bee"><button data-dir="up" aria-label="Move up">↑</button><button data-dir="left" aria-label="Move left">←</button><span class="golf-status" role="status">🌸</span><button data-dir="right" aria-label="Move right">→</button><button data-dir="down" aria-label="Move down">↓</button></div></div></aside></div></div>`;
    const board=stage.querySelector('.golf-board svg'),ball=stage.querySelector('.golf-ball'),trace=stage.querySelector('.golf-trail'),status=stage.querySelector('.golf-status'),playArea=stage.querySelector('.golf-board');
    const adjacent=n=>edges.some(([a,b])=>(a===current&&b===n)||(b===current&&a===n));
    function paint(){const[x,y]=point(current);ball.setAttribute('transform',`translate(${x*xScale} ${y}) scale(${actorScale})`);trace.setAttribute('points',line(trail));}
    // The entire illustration stays visible. Only path coordinates widen; moving items remain round.
    function fit(){
      const host=playArea.parentElement,wide=matchMedia('(min-width:901px)').matches;
      const portrait=false,ratio=portrait?1122/1402:3/2;
      xScale=800*ratio/600;actorScale=wide||portrait?1:1.25;
      const availableW=Math.max(0,host.clientWidth-(wide?252:16)),availableH=Math.max(0,host.clientHeight-(wide?16:130));
      const width=Math.min(availableW,availableH*ratio);playArea.style.width=width+'px';playArea.style.height=width/ratio+'px';
      board.setAttribute('viewBox',`0 0 ${600*xScale} 800`);
      const backdrop=board.querySelector('.maze-backdrop');backdrop.setAttribute('width',600*xScale);
      backdrop.setAttribute('href','assets/meadow-garden.png');
      board.querySelectorAll('[data-maze-points]').forEach(path=>path.setAttribute('points',path.dataset.mazePoints.split(' ').map(pair=>{const[x,y]=pair.split(',').map(Number);return [x*xScale,y].join(',');}).join(' ')));
      board.querySelectorAll('[data-node]').forEach(node=>node.setAttribute('cx',point(Number(node.dataset.node))[0]*xScale));
      const[gx,gy]=point(goal);board.querySelector('.maze-goal').setAttribute('transform',`translate(${gx*xScale} ${gy}) scale(${actorScale})`);paint();
    }
    const observer=new ResizeObserver(fit);observer.observe(stage);fit();
    function blocked(){clearTimeout(timer);status.textContent='↩';feedback('Follow the garden path. Try another direction.');speakHint('Follow the garden path. Try another direction.');timer=setTimeout(()=>status.textContent='🌸',700);}
    function move(n){if(done||n===current)return;if(!adjacent(n)){blocked();return;}current=n;const previous=trail.indexOf(n);trail=previous<0?[...trail,n]:trail.slice(0,previous+1);paint();tone();status.textContent='🌸';clearTimeout(timer);feedback('Keep going! Follow the path to the beehive.');if(current===goal){done=true;status.textContent='★';tone('good');complete(board,'Your bee reached the beehive! Brilliant path finding.');}else if(edges.filter(e=>e.includes(n)).length===1){feedback('A dead end! Go back and try a different path.');speakHint('A dead end! Go back and try a different path.');}else if(n===map(originalRoute[Math.floor(originalRoute.length/2)])&&!spokenMilestones.has('halfway')){spokenMilestones.add('halfway');say('You are halfway there! Keep following the path.');}}
    function direction(d){const offsets={up:-5,down:5,left:-1,right:1};const n=current+offsets[d];if((d==='left'&&current%5===0)||(d==='right'&&current%5===4))blocked();else move(n);}
    const controls=e=>{const choice=e.target.closest('[data-maze]');if(choice){const next=Number(choice.dataset.maze);if(next!==selectedMaze){selectedMaze=next;reset();}return;}const b=e.target.closest('[data-dir]');if(b)direction(b.dataset.dir);};
    function locate(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(board.getScreenCTM().inverse());p.x/=xScale;return {p,n:Math.round((p.y-205)/100)*5+Math.round((p.x-110)/95)};}
    function down(e){if(e.button!==0)return;const {p,n}=locate(e),[x,y]=point(current);if(Math.hypot(p.x-x,p.y-y)<35){drag=true;board.setPointerCapture(e.pointerId);e.preventDefault();}else{const [nx,ny]=point(n);if(n>=0&&n<30&&Math.hypot(p.x-nx,p.y-ny)<35)move(n);}}
    function motion(e){if(!drag||done)return;const {p}=locate(e);const neighbors=edges.filter(e=>e.includes(current)).map(e=>e[0]===current?e[1]:e[0]);for(const n of neighbors){const[x,y]=point(n);if(Math.hypot(p.x-x,p.y-y)<38){move(n);break;}}}
    const up=()=>drag=false;
    const keys=e=>{if(e.target.closest?.('button,a,input,select,textarea,[contenteditable=true]'))return;const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(d&&!document.querySelector('dialog[open]')){e.preventDefault();direction(d);}};
    stage.addEventListener('click',controls);board.addEventListener('pointerdown',down);board.addEventListener('pointermove',motion);board.addEventListener('pointerup',up);board.addEventListener('pointercancel',up);window.addEventListener('keydown',keys);paint();feedback('Start with the bee. Find a way to the beehive!');
    return {dispose(){observer.disconnect();clearTimeout(timer);stage.removeEventListener('click',controls);window.removeEventListener('keydown',keys);board.removeEventListener('pointerdown',down);board.removeEventListener('pointermove',motion);board.removeEventListener('pointerup',up);board.removeEventListener('pointercancel',up);}};
  }};
})();
