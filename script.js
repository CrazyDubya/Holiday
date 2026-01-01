/**
 * HAPPY NEW YEAR 2026
 * Grenada Tropical Vibes × NYC Urban Energy
 * Advanced Interactive JavaScript Experience
 *
 * Features:
 * - Starfield with twinkling animation
 * - Physics-based fireworks system
 * - Tropical particle effects (hibiscus, sparkles)
 * - Interactive wish system with shooting stars
 * - Ball drop animation with celebration trigger
 * - Scroll-triggered reveal animations
 * - Dynamic audio visualizer simulation
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    stars: {
        count: 200,
        colors: ['#ffffff', '#ffd700', '#00d4aa', '#ff6b9d', '#8338ec'],
        minSize: 1,
        maxSize: 3,
        twinkleSpeed: 0.02
    },
    fireworks: {
        particleCount: 80,
        colors: [
            '#ff006e', '#00d4aa', '#ffd700', '#8338ec',
            '#ff6b9d', '#3a86ff', '#ffbe0b', '#00b4d8'
        ],
        gravity: 0.08,
        friction: 0.98,
        fadeSpeed: 0.015
    },
    particles: {
        count: 25,
        types: ['sparkle', 'hibiscus', 'confetti'],
        colors: ['#00d4aa', '#ff6b9d', '#ffd700', '#8338ec', '#ff006e']
    },
    wishes: {
        starTrailLength: 20,
        starSpeed: 8,
        glowIntensity: 30
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(random(min, max));
const randomChoice = (arr) => arr[randomInt(0, arr.length)];
const lerp = (start, end, t) => start + (end - start) * t;
const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

// ============================================
// STARFIELD SYSTEM
// ============================================
class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = random(0, this.canvas.width);
        this.y = random(0, this.canvas.height * 0.7); // Keep stars in upper portion
        this.size = random(CONFIG.stars.minSize, CONFIG.stars.maxSize);
        this.color = randomChoice(CONFIG.stars.colors);
        this.twinklePhase = random(0, Math.PI * 2);
        this.twinkleSpeed = random(0.01, 0.05);
        this.baseOpacity = random(0.3, 1);
    }

    update(time) {
        this.twinklePhase += this.twinkleSpeed;
        this.opacity = this.baseOpacity * (0.5 + 0.5 * Math.sin(this.twinklePhase));
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '40');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class StarfieldSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.time = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        for (let i = 0; i < CONFIG.stars.count; i++) {
            this.stars.push(new Star(this.canvas));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Redistribute stars on resize
        this.stars.forEach(star => star.reset());
    }

    update() {
        this.time++;
        this.stars.forEach(star => star.update(this.time));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stars.forEach(star => star.draw(this.ctx));
    }
}

// ============================================
// FIREWORKS SYSTEM
// ============================================
class FireworkParticle {
    constructor(x, y, color, velocity, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.size = size;
        this.opacity = 1;
        this.trail = [];
        this.trailLength = 5;
    }

    update() {
        // Store trail
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vy += CONFIG.fireworks.gravity;
        this.vx *= CONFIG.fireworks.friction;
        this.vy *= CONFIG.fireworks.friction;
        this.opacity -= CONFIG.fireworks.fadeSpeed;
        this.size *= 0.98;
    }

    draw(ctx) {
        // Draw trail
        this.trail.forEach((point, i) => {
            const trailOpacity = (i / this.trail.length) * point.opacity * 0.5;
            ctx.save();
            ctx.globalAlpha = trailOpacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw particle
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0;
    }
}

class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.color = randomChoice(CONFIG.fireworks.colors);
        this.explode();
    }

    explode() {
        const particleCount = CONFIG.fireworks.particleCount;
        const angleStep = (Math.PI * 2) / particleCount;

        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i + random(-0.2, 0.2);
            const speed = random(2, 8);
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            const size = random(2, 4);

            this.particles.push(new FireworkParticle(
                this.x, this.y, this.color, velocity, size
            ));
        }

        // Add some extra random particles for variety
        for (let i = 0; i < 20; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(1, 4);
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            const color = randomChoice(CONFIG.fireworks.colors);

            this.particles.push(new FireworkParticle(
                this.x, this.y, color, velocity, random(1, 3)
            ));
        }
    }

    update() {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.isDead());
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    isDead() {
        return this.particles.length === 0;
    }
}

class FireworksSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.autoLaunch = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launch(x, y) {
        this.fireworks.push(new Firework(x, y));
    }

    launchRandom() {
        const x = random(this.canvas.width * 0.2, this.canvas.width * 0.8);
        const y = random(this.canvas.height * 0.1, this.canvas.height * 0.5);
        this.launch(x, y);
    }

    startAutoLaunch() {
        this.autoLaunch = true;
        this.autoLaunchInterval = setInterval(() => {
            if (this.autoLaunch && Math.random() > 0.5) {
                this.launchRandom();
            }
        }, 800);

        // Stop after 10 seconds
        setTimeout(() => this.stopAutoLaunch(), 10000);
    }

    stopAutoLaunch() {
        this.autoLaunch = false;
        if (this.autoLaunchInterval) {
            clearInterval(this.autoLaunchInterval);
        }
    }

    update() {
        this.fireworks.forEach(f => f.update());
        this.fireworks = this.fireworks.filter(f => !f.isDead());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fireworks.forEach(f => f.draw(this.ctx));
    }
}

// ============================================
// AMBIENT PARTICLE SYSTEM
// ============================================
class AmbientParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = random(0, this.canvas.width);
        this.y = random(this.canvas.height, this.canvas.height + 100);
        this.size = random(3, 8);
        this.color = randomChoice(CONFIG.particles.colors);
        this.type = randomChoice(CONFIG.particles.types);
        this.vx = random(-0.5, 0.5);
        this.vy = random(-1, -2);
        this.rotation = random(0, Math.PI * 2);
        this.rotationSpeed = random(-0.05, 0.05);
        this.opacity = random(0.3, 0.8);
        this.wobblePhase = random(0, Math.PI * 2);
        this.wobbleSpeed = random(0.02, 0.05);
    }

    update(time) {
        this.wobblePhase += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobblePhase) * 0.5;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        if (this.y < -50) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        if (this.type === 'sparkle') {
            this.drawSparkle(ctx);
        } else if (this.type === 'hibiscus') {
            this.drawHibiscus(ctx);
        } else {
            this.drawConfetti(ctx);
        }

        ctx.restore();
    }

    drawSparkle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.lineTo(
                Math.cos(angle) * this.size,
                Math.sin(angle) * this.size
            );
            ctx.lineTo(
                Math.cos(angle + Math.PI / 4) * (this.size * 0.4),
                Math.sin(angle + Math.PI / 4) * (this.size * 0.4)
            );
        }
        ctx.closePath();
        ctx.fill();
    }

    drawHibiscus(ctx) {
        ctx.fillStyle = this.color;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const angle = (i * Math.PI * 2) / 5;
            ctx.ellipse(
                Math.cos(angle) * this.size * 0.5,
                Math.sin(angle) * this.size * 0.5,
                this.size * 0.6,
                this.size * 0.3,
                angle,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        // Center
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawConfetti(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    }
}

class AmbientParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.time = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        for (let i = 0; i < CONFIG.particles.count; i++) {
            const particle = new AmbientParticle(this.canvas);
            particle.y = random(0, this.canvas.height);
            this.particles.push(particle);
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update() {
        this.time++;
        this.particles.forEach(p => p.update(this.time));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => p.draw(this.ctx));
    }
}

// ============================================
// SHOOTING STAR WISH SYSTEM
// ============================================
class ShootingStar {
    constructor(canvas, startX, startY, text) {
        this.canvas = canvas;
        this.x = startX;
        this.y = startY;
        this.text = text;
        this.angle = random(-Math.PI / 4, -Math.PI / 6);
        this.speed = CONFIG.wishes.starSpeed;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.trail = [];
        this.trailLength = CONFIG.wishes.starTrailLength;
        this.opacity = 1;
        this.size = random(3, 5);
        this.color = randomChoice(['#ffd700', '#00d4aa', '#ff6b9d', '#ffffff']);
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;

        // Fade as it moves
        if (this.x > this.canvas.width * 0.7 || this.y < this.canvas.height * 0.1) {
            this.opacity -= 0.02;
        }
    }

    draw(ctx) {
        // Draw trail
        this.trail.forEach((point, i) => {
            const trailOpacity = (i / this.trail.length) * point.opacity;
            const trailSize = (i / this.trail.length) * this.size;

            ctx.save();
            ctx.globalAlpha = trailOpacity;

            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, trailSize * 3
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, trailSize * 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // Draw star head
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Glow
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 5
        );
        glowGradient.addColorStop(0, this.color);
        glowGradient.addColorStop(0.5, this.color + '40');
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0 || this.x > this.canvas.width || this.y < 0;
    }
}

class WishesSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.wishCount = 0;

        // Delay initial resize to ensure layout is complete
        requestAnimationFrame(() => {
            this.resize();
        });
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    resize() {
        const section = this.canvas.closest('.wishes-section');
        if (section) {
            // Use clientWidth/Height for more accurate sizing
            const width = section.clientWidth || window.innerWidth;
            const height = section.clientHeight || window.innerHeight;
            this.canvas.width = width;
            this.canvas.height = height;
        } else {
            // Fallback to window size
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Show wish input modal
        const inputContainer = document.getElementById('wish-input');
        if (inputContainer) {
            inputContainer.style.display = 'flex';
            inputContainer.dataset.x = x;
            inputContainer.dataset.y = y;
            document.getElementById('wish-text').focus();
        }
    }

    addWish(text, x, y) {
        this.stars.push(new ShootingStar(this.canvas, x, y, text));
        this.wishCount++;
        document.getElementById('wish-count').textContent = this.wishCount;

        // Create floating wish display
        this.createFloatingWish(text, x, y);
    }

    createFloatingWish(text, x, y) {
        const container = document.getElementById('floating-wishes');
        if (!container) return;

        const wish = document.createElement('div');
        wish.className = 'floating-wish';
        wish.textContent = text;

        const rect = this.canvas.getBoundingClientRect();
        wish.style.left = `${rect.left + x}px`;
        wish.style.top = `${rect.top + y}px`;

        container.appendChild(wish);

        setTimeout(() => wish.remove(), 10000);
    }

    update() {
        this.stars.forEach(s => s.update());
        this.stars = this.stars.filter(s => !s.isDead());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stars.forEach(s => s.draw(this.ctx));
    }
}

// ============================================
// BALL DROP INTERACTION
// ============================================
class BallDrop {
    constructor(fireworksSystem) {
        this.container = document.getElementById('ball-drop');
        if (!this.container) return;

        this.fireworksSystem = fireworksSystem;
        this.hasDropped = false;

        this.container.addEventListener('click', () => this.drop());
    }

    drop() {
        if (this.hasDropped) return;
        this.hasDropped = true;

        this.container.classList.add('dropping');

        // Hide instruction
        const instruction = this.container.querySelector('.ball-instruction');
        if (instruction) {
            instruction.style.opacity = '0';
        }

        // Trigger fireworks after ball drops
        setTimeout(() => {
            if (this.fireworksSystem) {
                this.fireworksSystem.startAutoLaunch();
            }

            // Show celebration message
            this.showCelebration();
        }, 2500);
    }

    showCelebration() {
        const instruction = this.container.querySelector('.ball-instruction');
        if (instruction) {
            instruction.textContent = '🎉 HAPPY NEW YEAR 2026! 🎉';
            instruction.style.opacity = '1';
            instruction.style.color = '#ffd700';
            instruction.style.fontSize = '1.2rem';
        }
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
class ScrollAnimations {
    constructor() {
        // Add js-loaded class to enable JS-dependent animations
        document.documentElement.classList.add('js-loaded');

        this.elements = document.querySelectorAll('.reveal-text, .reveal-scale');

        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, options);

        this.elements.forEach(el => this.observer.observe(el));

        // Immediately reveal elements that are already in view
        this.checkInitialVisibility();
    }

    checkInitialVisibility() {
        this.elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                el.classList.add('revealed');
            }
        });
    }
}

// ============================================
// AUDIO VISUALIZER SIMULATION
// ============================================
class AudioVisualizerSim {
    constructor() {
        this.bars = document.querySelectorAll('.viz-bar');
        if (this.bars.length === 0) return;

        this.animate();
    }

    animate() {
        this.bars.forEach((bar, i) => {
            const height = 20 + Math.sin(Date.now() * 0.003 + i * 0.5) * 30 +
                           Math.sin(Date.now() * 0.007 + i * 0.3) * 20;
            bar.style.height = `${height}px`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// WISH INPUT HANDLER
// ============================================
class WishInputHandler {
    constructor(wishesSystem) {
        this.wishesSystem = wishesSystem;
        this.container = document.getElementById('wish-input');
        if (!this.container) return;

        this.input = document.getElementById('wish-text');
        this.releaseBtn = document.getElementById('release-wish-btn');
        this.closeBtn = document.getElementById('close-wish');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.releaseBtn.addEventListener('click', () => this.releaseWish());
        this.closeBtn.addEventListener('click', () => this.close());

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.releaseWish();
            }
        });

        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });
    }

    releaseWish() {
        const text = this.input.value.trim();
        if (!text) return;

        const x = parseFloat(this.container.dataset.x);
        const y = parseFloat(this.container.dataset.y);

        if (this.wishesSystem) {
            this.wishesSystem.addWish(text, x, y);
        }

        this.input.value = '';
        this.close();
    }

    close() {
        this.container.style.display = 'none';
    }
}

// ============================================
// PARALLAX EFFECT
// ============================================
class ParallaxEffect {
    constructor() {
        this.elements = {
            skyline: document.querySelector('.nyc-skyline'),
            palms: document.querySelector('.tropical-elements'),
            gradientMesh: document.querySelector('.gradient-mesh')
        };

        window.addEventListener('scroll', () => this.update());
        window.addEventListener('mousemove', (e) => this.handleMouse(e));
    }

    update() {
        const scrollY = window.scrollY;

        if (this.elements.skyline) {
            this.elements.skyline.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        if (this.elements.palms) {
            this.elements.palms.style.transform = `translateY(${scrollY * 0.2}px)`;
        }
    }

    handleMouse(e) {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        if (this.elements.gradientMesh) {
            this.elements.gradientMesh.style.transform =
                `translate(${mouseX * 20}px, ${mouseY * 20}px)`;
        }
    }
}

// ============================================
// MAIN APPLICATION
// ============================================
class App {
    constructor() {
        this.init();
    }

    init() {
        // Initialize all systems
        this.starfield = new StarfieldSystem('stars-canvas');
        this.fireworks = new FireworksSystem('fireworks-canvas');
        this.particles = new AmbientParticleSystem('particles-canvas');
        this.wishes = new WishesSystem('wishes-canvas');

        // Initialize interactions
        this.ballDrop = new BallDrop(this.fireworks);
        this.scrollAnimations = new ScrollAnimations();
        this.audioViz = new AudioVisualizerSim();
        this.wishInput = new WishInputHandler(this.wishes);
        this.parallax = new ParallaxEffect();

        // Launch initial fireworks for effect
        setTimeout(() => {
            if (this.fireworks) {
                this.fireworks.launchRandom();
                setTimeout(() => this.fireworks.launchRandom(), 500);
            }
        }, 2000);

        // Start animation loop
        this.animate();
    }

    animate() {
        // Update all systems
        if (this.starfield) {
            this.starfield.update();
            this.starfield.draw();
        }

        if (this.fireworks) {
            this.fireworks.update();
            this.fireworks.draw();
        }

        if (this.particles) {
            this.particles.update();
            this.particles.draw();
        }

        if (this.wishes) {
            this.wishes.update();
            this.wishes.draw();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        CONFIG.stars.count = 50;
        CONFIG.particles.count = 10;
    } else {
        CONFIG.stars.count = 200;
        CONFIG.particles.count = 25;
    }
});

// Respect reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    CONFIG.stars.count = 30;
    CONFIG.particles.count = 5;
    CONFIG.fireworks.particleCount = 30;
}

// ============================================
// EASTER EGG: Konami Code for extra fireworks
// ============================================
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                    'KeyB', 'KeyA'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // Trigger mega fireworks show
            const fireworksCanvas = document.getElementById('fireworks-canvas');
            if (fireworksCanvas) {
                const system = new FireworksSystem('fireworks-canvas');
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => system.launchRandom(), i * 200);
                }
            }
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// ============================================
// Console greeting for developers
// ============================================
console.log(`
%c🌴 Happy New Year 2026! 🗽
%cFrom Grenada with tropical vibes to NYC with urban energy.

Built with love using vanilla HTML, CSS & JavaScript.
No frameworks, just pure web magic.

👋 Hello, fellow developer! Thanks for checking out the code.

%c— Claude
`,
'font-size: 20px; font-weight: bold; color: #00d4aa;',
'font-size: 14px; color: #8338ec;',
'font-size: 12px; font-style: italic; color: #ff6b9d;'
);
