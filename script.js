function goNext() {
  document.getElementById('page1').style.opacity = '0';
  document.getElementById('page1').style.transform = 'translateY(-100%)';

  document.getElementById('page2').style.opacity = '1';
  document.getElementById('page2').style.transform = 'translateY(0)';
}

/* Sparkle Animation */
const canvas = document.getElementById('sparkle');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

class Spark {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 4 + 2;
    this.dx = (Math.random() - 0.5);
    this.dy = (Math.random() - 0.5);
    this.life = 100;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,105,180,0.8)';
    ctx.fill();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life--;
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.push(new Spark());

  particles.forEach((p, i) => {
    p.update();
    p.draw();
    if (p.life <= 0) particles.splice(i, 1);
  });

  requestAnimationFrame(animate);
}

animate();

/* --------- Carousel: Load up to 19 photos from /photos/photo1.jpg ... photo19.jpg ---------- */
(() => {
  const track = document.getElementById('photoTrack');
  if (!track) return;

  const MAX = 19;
  const images = [];
  for (let i = 1; i <= MAX; i++) {
    const src = `photos/photo${i}.jpg`;
    images.push(src);
  }

  // create items and attempt to load images with multiple filename patterns/extensions
  let loadedCount = 0;
  images.forEach((_, idx) => {
    const item = document.createElement('div');
    item.className = 'item inactive';
    const img = document.createElement('img');

    // try common filename patterns (your files are like photos1.jpeg)
    const candidates = [
      `photos/photo${idx+1}.jpg`,
      `photos/photo${idx+1}.jpeg`,
      `photos/photos${idx+1}.jpg`,
      `photos/photos${idx+1}.jpeg`,
      `photos/IMG_${idx+1}.jpg`,
      `photos/IMG_${idx+1}.jpeg`
    ];

    let attempt = 0;
    img.alt = `photo ${idx+1}`;

    img.onload = () => { loadedCount++; };
    img.onerror = () => {
      attempt++;
      if (attempt < candidates.length) {
        img.src = candidates[attempt];
      } else {
        // none matched; remove the placeholder
        item.remove();
      }
    };

    // start with first candidate
    img.src = candidates[0];

    item.appendChild(img);
    track.appendChild(item);
  });

  // navigation + active index
  let active = 0;
  const items = () => Array.from(track.children);

  function update() {
    const nodes = items();
    if (!nodes.length) return;
    if (active < 0) active = 0;
    if (active > nodes.length - 1) active = nodes.length - 1;

    nodes.forEach((n, i) => {
      n.classList.toggle('active', i === active);
      n.classList.toggle('inactive', i !== active);
    });

    // center active item in viewport
    const idx = active;
    const target = nodes[idx];
    const viewport = track.parentElement;
    const viewportWidth = viewport.clientWidth;
    const itemRect = target.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const offset = (itemRect.left - trackRect.left) + (itemRect.width / 2) - (viewportWidth / 2);
    track.style.transform = `translateX(${-offset}px)`;
  }

  // wait a tick for images to load then clamp active to middle
  setTimeout(() => {
    const nodes = items();
    if (!nodes.length) return;
    active = Math.floor(nodes.length / 2);
    update();
  }, 350);

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { active = Math.min(active + 1, items().length - 1); update(); restartAutoplay(); }
    if (e.key === 'ArrowLeft') { active = Math.max(active - 1, 0); update(); restartAutoplay(); }
  });

  // autoplay setup (auto-advance, pause on hover/touch)
  let isPaused = false;
  const viewportEl = track.parentElement;
  if (viewportEl) {
    viewportEl.addEventListener('mouseenter', () => { isPaused = true; });
    viewportEl.addEventListener('mouseleave', () => { isPaused = false; });
  }

  let autoplayDelay = 3000;
  let autoplayTimer = null;
  function startAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      const nodes = items();
      if (!nodes.length || isPaused) return;
      active = (active + 1) % nodes.length;
      update();
    }, autoplayDelay);
  }
  function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  // touch/swipe support (pause while touching, resume after)
  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isPaused = true; });
  track.addEventListener('touchend', (e) => {
    if (startX == null) { isPaused = false; return; }
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if (dx < -40) { active = Math.min(active + 1, items().length - 1); update(); }
    else if (dx > 40) { active = Math.max(active - 1, 0); update(); }
    startX = null;
    isPaused = false;
    restartAutoplay();
  });

  // start autoplay
  startAutoplay();

})();
