/*
  Interactions:
  - Eyes track the cursor (pupils constrained inside the eyes)
  - Pix floats and is draggable; follows pointer with slight spring
*/
(function(){
  const scene = document.getElementById('scene');
  const lulu = document.getElementById('lulu');
  const luluHit = document.getElementById('lulu-hit');
  const pix = document.getElementById('pix');
  // Birthday card modal
  const cardModal = document.getElementById('card-modal');
  const cardClose = document.getElementById('card-close');

  // Eye tracking removed

  // Pix drag with lightweight spring follow
  let dragging = false;
  let target = { x: pix.offsetLeft, y: pix.offsetTop };
  let pos = { x: target.x, y: target.y };
  let dragOffset = { x: 0, y: 0 };

  const setPixPosition = () => {
    pix.style.left = pos.x + 'px';
    pix.style.top = pos.y + 'px';
  };
  setPixPosition();

  const step = () => {
    const k = dragging ? 0.25 : 0.08; // spring factor
    pos.x += (target.x - pos.x) * k;
    pos.y += (target.y - pos.y) * k;
    setPixPosition();
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  const pointerToTarget = (clientX, clientY) => {
    const s = scene.getBoundingClientRect();
    const half = pix.getBoundingClientRect();
    target.x = Math.max(0, Math.min(s.width - half.width, clientX - s.left - dragOffset.x));
    target.y = Math.max(0, Math.min(s.height - half.height, clientY - s.top - dragOffset.y));
  };

  const startDrag = (e) => {
    dragging = true;
    pix.classList.add('dragging');
    const p = e.touches ? e.touches[0] : e;
  // compute offset from top-left of Pix where user grabbed
  const r = pix.getBoundingClientRect();
  dragOffset.x = p.clientX - r.left;
  dragOffset.y = p.clientY - r.top;
    pointerToTarget(p.clientX, p.clientY);
  };
  const moveDrag = (e) => {
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    pointerToTarget(p.clientX, p.clientY);
  };
  const endDrag = () => { dragging = false; pix.classList.remove('dragging'); };

  pix.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', endDrag);

  pix.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', moveDrag, { passive: true });
  window.addEventListener('touchend', endDrag);

  // Pix click counter for birthday modal
  let pixClicks = 0;
  const showBirthdayCard = () => {
    pixClicks += 1;
    if (pixClicks === 8) {
      cardModal.hidden = false;
    }
  };
  pix.addEventListener('click', showBirthdayCard);

  // Close modal
  if (cardClose) {
    cardClose.addEventListener('click', () => {
      cardModal.hidden = true;
      pixClicks = 0; // Reset counter
    });
  }

  // Typing animation for the letter
  const message = `To the love of my life,
My future wife,
My bebucakes,
Happiest birthday!!! 

It's already been almost a year since we've become together hehehe. 
And within that year, nakatatlong airbnb na tayo, one for my birthday,
and this time for your birthday celeb naman!!! It's just crazy na it's only 
been a year pero we've created so much memories already.

I have always been grateful to have you by my side.
For being my comfort, my safe space, my source of energy.
Someone I never get tired of choosing.

To my baby, my bebucakes, my love,
Thank you for going through life with me. 
Thank you for trusting me, for choosing me, 
and for loving me in ways I've never experience before.

I love you so much my love!!!
Let's get married soon hihi`;

  let isTyping = false;
  let hasTyped = false;
  
  // Start typing animation when card flips to back
  function startTyping() {
    if (isTyping || hasTyped) return;
    isTyping = true;
    
    const typingElement = document.getElementById('typing-text');
    const photoElement = document.getElementById('love-photo');
    
    if (!typingElement) return;
    
    typingElement.innerHTML = '';
    let i = 0;
    
    function typeWriter() {
      if (i < message.length) {
        if (message.charAt(i) === '\n') {
          typingElement.innerHTML += '<br>';
        } else {
          typingElement.innerHTML += message.charAt(i);
        }
        i++;
        setTimeout(typeWriter, 50); // Typing speed
      } else {
        // Remove cursor and show photo after typing completes
        typingElement.style.setProperty('--cursor', 'none');
        hasTyped = true;
        isTyping = false;
        
        // Show photo after a short delay
        setTimeout(() => {
          if (photoElement) {
            photoElement.style.opacity = '1';
          }
        }, 500);
      }
    }
    
    typeWriter();
  }

  // Listen for flip container hover/touch to start typing
  const flipContainer = document.querySelector('.flip-container');
  if (flipContainer) {
    flipContainer.addEventListener('mouseenter', startTyping);
    flipContainer.addEventListener('touchstart', startTyping);
  }

  // Lulu click: play a random Lulu voice line at 70% volume
  const voiceFiles = [
    'lulu sounds/Lulu laugh!.mp3',
    'lulu sounds/lulu dust em pix.mp3',
    'lulu sounds/lulu just a pinch.mp3',
    'lulu sounds/lulu lets dance.mp3',
    'lulu sounds/lulu nosey drop.mp3',
    'lulu sounds/lulu not gonna like.mp3',
    'lulu sounds/lulu pleased.mp3',
    'lulu sounds/lulu recommend skip.mp3',
    'lulu sounds/lulu solid giggle.mp3',
    'lulu sounds/lulu tasted purple.mp3',
    'lulu sounds/lulu that squirrel.mp3',
    'lulu sounds/lulu too tall.mp3'
  ];
  let lastIndex = -1;
  const pickRandomIndex = () => {
    if (voiceFiles.length <= 1) return 0;
    let i;
    do { i = Math.floor(Math.random() * voiceFiles.length); } while (i === lastIndex);
    lastIndex = i;
    return i;
  };
  let currentAudio = null;
  const playRandomVoice = () => {
    const idx = pickRandomIndex();
    const src = voiceFiles[idx];
    try {
      if (currentAudio) { currentAudio.pause(); }
      currentAudio = new Audio(src);
      currentAudio.volume = 0.7;
      currentAudio.play();
    } catch (e) {
      // ignore
    }
  };
  luluHit.setAttribute('tabindex', '0');
  luluHit.setAttribute('role', 'button');
  luluHit.addEventListener('click', playRandomVoice);
  luluHit.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playRandomVoice();
    }
  });
})();
