const auroraCanvas = document.getElementById('aurora');
const auroraCtx = auroraCanvas.getContext('2d');
let W, H;

const config = {
  particles: {
    number: { stars: 300, nebulas: 6, aurora: 60 },
    size: { starMin: 0.8, starMax: 3.0 },
    opacity: { starMin: 0.6, starMax: 1.0 },
    twinkle: { speedMin: 0.03, speedMax: 0.08 }
  },
  aurora: {
    intensity: 1.5,
    speed: 2.0
  }
};

let stars = [];
let nebulas = [];
let auroraParticles = [];
let time = 0;

function initCanvas() {
  W = auroraCanvas.width = window.innerWidth;
  H = auroraCanvas.height = window.innerHeight;
}
window.addEventListener('resize', initCanvas);
initCanvas();

class Star {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.homeX = this.x;
    this.homeY = this.y;
    this.size = Math.random() * (config.particles.size.starMax - config.particles.size.starMin) + config.particles.size.starMin;
    this.baseAlpha = Math.random() * (config.particles.opacity.starMax - config.particles.opacity.starMin) + config.particles.opacity.starMin;
    this.alpha = this.baseAlpha;
    this.twinkleSpeed = Math.random() * (config.particles.twinkle.speedMax - config.particles.twinkle.speedMin) + config.particles.twinkle.speedMin;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.98;
    this.color = this.getColor();
  }

  getColor() {
    const colors = ['255,255,255', '220,240,255', '255,245,220'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.twinklePhase += this.twinkleSpeed;
    this.pulsePhase += 0.02;
    this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.2;

    this.vx += (this.homeX - this.x) * 0.006;
    this.vy += (this.homeY - this.y) * 0.006;
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) { this.x = 0; this.vx *= -0.5; }
    if (this.x > W) { this.x = W; this.vx *= -0.5; }
    if (this.y < 0) { this.y = 0; this.vy *= -0.5; }
    if (this.y > H) { this.y = H; this.vy *= -0.5; }
  }

  draw() {
    const pulseSize = this.size * (1 + Math.sin(this.pulsePhase) * 0.2);

    auroraCtx.beginPath();
    auroraCtx.arc(this.x, this.y, pulseSize * 1.5, 0, Math.PI * 2);
    auroraCtx.fillStyle = `rgba(${this.color},${this.alpha * 0.25})`;
    auroraCtx.fill();

    auroraCtx.beginPath();
    auroraCtx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    auroraCtx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    auroraCtx.fill();
  }
}

class Nebula {
  constructor() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.radius = Math.random() * 180 + 120;
    this.color = this.getColor();
    this.alpha = Math.random() * 0.15 + 0.06;
    this.driftX = (Math.random() - 0.5) * 0.12;
    this.driftY = (Math.random() - 0.5) * 0.06;
    this.phase = Math.random() * Math.PI * 2;
  }
  
  getColor() {
    const colors = [
      { r: 100, g: 70, b: 200 },
      { r: 70, g: 130, b: 200 },
      { r: 200, g: 70, b: 160 }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  update() {
    this.x += this.driftX;
    this.y += this.driftY;
    this.phase += 0.0015;
    if (this.x < -this.radius) this.x = W + this.radius;
    if (this.x > W + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = H + this.radius;
    if (this.y > H + this.radius) this.y = -this.radius;
  }
  
  draw() {
    const dynamicAlpha = this.alpha * (0.7 + Math.sin(this.phase) * 0.3);
    const gradient = auroraCtx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},${dynamicAlpha})`);
    gradient.addColorStop(0.5, `rgba(${this.color.r},${this.color.g},${this.color.b},${dynamicAlpha * 0.4})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    auroraCtx.fillStyle = gradient;
    auroraCtx.beginPath();
    auroraCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    auroraCtx.fill();
  }
}

class AuroraParticle {
  constructor() { this.reset(); }
  
  reset() {
    this.x = Math.random() * W;
    this.y = H * 0.3 + Math.random() * H * 0.6;
    this.size = Math.random() * 3 + 1;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.1;
    this.alpha = Math.random() * 0.4 + 0.1;
    this.hue = Math.random() > 0.5 ? 150 + Math.random() * 60 : 270 + Math.random() * 60;
    this.life = Math.random() * 200 + 100;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.alpha *= 0.997;
    if (this.life <= 0 || this.alpha < 0.01) this.reset();
  }
  
  draw() {
    auroraCtx.beginPath();
    auroraCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    auroraCtx.fillStyle = `hsla(${this.hue},80%,60%,${this.alpha})`;
    auroraCtx.fill();
  }
}

function initParticles() {
  stars = [];
  nebulas = [];
  auroraParticles = [];

  for (let i = 0; i < config.particles.number.stars; i++) stars.push(new Star());
  for (let i = 0; i < config.particles.number.nebulas; i++) nebulas.push(new Nebula());
  for (let i = 0; i < config.particles.number.aurora; i++) auroraParticles.push(new AuroraParticle());
}

function drawBackground() {
  const bgGradient = auroraCtx.createLinearGradient(0, 0, 0, H);
  bgGradient.addColorStop(0, '#080410');
  bgGradient.addColorStop(0.3, '#120620');
  bgGradient.addColorStop(0.6, '#0a0415');
  bgGradient.addColorStop(1, '#030108');
  auroraCtx.fillStyle = bgGradient;
  auroraCtx.fillRect(0, 0, W, H);
}

function drawAuroraWaves() {
  const intensity = config.aurora.intensity;
  const speedMult = config.aurora.speed;
  for (let layer = 0; layer < 5; layer++) {
    auroraCtx.beginPath();
    const layerY = H * (0.38 + layer * 0.12);
    const amplitude = (35 + layer * 18) * intensity;
    const frequency = 0.002 + layer * 0.0006;
    const speed = time * (0.5 + layer * 0.2) * speedMult;
    auroraCtx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) {
      const y = layerY + Math.sin(x * frequency + speed) * amplitude +
        Math.sin(x * frequency * 2 + speed * 1.5) * (amplitude * 0.5);
      auroraCtx.lineTo(x, y);
    }
    auroraCtx.lineTo(W, H);
    auroraCtx.lineTo(0, H);
    const hue1 = 150 + layer * 20 + Math.sin(time) * 15;
    const hue2 = 270 + layer * 15 + Math.cos(time * 0.8) * 25;
    const gradient = auroraCtx.createLinearGradient(0, layerY - amplitude, 0, H);
    gradient.addColorStop(0, `hsla(${hue1},90%,70%,0)`);
    gradient.addColorStop(0.3, `hsla(${hue1},80%,60%,${(0.1 - layer * 0.01) * intensity})`);
    gradient.addColorStop(0.5, `hsla(${(hue1 + hue2) / 2},70%,50%,${(0.15 - layer * 0.015) * intensity})`);
    gradient.addColorStop(0.7, `hsla(${hue2},80%,55%,${(0.1 - layer * 0.01) * intensity})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    auroraCtx.fillStyle = gradient;
    auroraCtx.fill();
  }
}

function drawShootingStar() {
  if (Math.random() < 0.02) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.35;
    const length = 70 + Math.random() * 100;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.35;
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    const gradient = auroraCtx.createLinearGradient(x, y, endX, endY);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(200,220,255,0)');
    auroraCtx.beginPath();
    auroraCtx.moveTo(x, y);
    auroraCtx.lineTo(endX, endY);
    auroraCtx.strokeStyle = gradient;
    auroraCtx.lineWidth = 2;
    auroraCtx.stroke();
  }
}

function animate() {
  time += 0.006 * config.aurora.speed;
  drawBackground();

  nebulas.forEach(n => { n.update(); n.draw(); });
  stars.forEach(s => { s.update(); s.draw(); });
  auroraParticles.forEach(p => { p.update(); p.draw(); });

  drawAuroraWaves();
  drawShootingStar();

  requestAnimationFrame(animate);
}

window.AuroraConfig = {
  setStarsCount: function(count) {
    config.particles.number.stars = count;
    initParticles();
  },
  setStarsSize: function(min, max) {
    config.particles.size.starMin = min;
    config.particles.size.starMax = max;
    stars.forEach(s => {
      s.size = Math.random() * (max - min) + min;
    });
  },
  setStarsOpacity: function(min, max) {
    config.particles.opacity.starMin = min;
    config.particles.opacity.starMax = max;
    stars.forEach(s => {
      s.baseAlpha = Math.random() * (max - min) + min;
    });
  },
  setAuroraIntensity: function(val) {
    config.aurora.intensity = val;
  },
  setAuroraSpeed: function(val) {
    config.aurora.speed = val;
  }
};

initParticles();
animate();
