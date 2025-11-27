/**
 * HARVEST OF GRATITUDE - Interactive Thanksgiving Experience
 * State-of-the-Art JavaScript Implementation
 *
 * Features:
 * - Physics-based leaf particle system with wind simulation
 * - Ember/firefly ambient particles
 * - Interactive procedural gratitude tree
 * - Dynamic time-based theming
 * - Scroll-triggered animations
 * - Generative background patterns
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    leaves: {
        count: 50,
        colors: ['#c4703c', '#d4a574', '#a0522d', '#c0392b', '#e8c547', '#8B4513'],
        minSize: 15,
        maxSize: 35,
        windStrength: 0.5,
        gravity: 0.3,
        turbulence: 0.02
    },
    embers: {
        count: 30,
        color: 'rgba(232, 197, 71, ',
        minSize: 2,
        maxSize: 5
    },
    tree: {
        trunkColor: '#5D4037',
        leafColors: ['#c4703c', '#d4a574', '#a0522d', '#c0392b', '#e8c547', '#8B4513', '#CD853F'],
        branchAngle: Math.PI / 6,
        branchLength: 0.7
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(random(min, max));
const lerp = (start, end, t) => start + (end - start) * t;
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// ============================================
// TIME-BASED THEMING
// ============================================
class TimeTheme {
    constructor() {
        this.update();
        setInterval(() => this.update(), 60000); // Update every minute
    }

    update() {
        const hour = new Date().getHours();
        let hueShift = 0;
        let ambientOpacity = 0.1;

        if (hour >= 5 && hour < 8) {
            // Dawn - golden pink
            hueShift = -10;
            ambientOpacity = 0.15;
        } else if (hour >= 8 && hour < 17) {
            // Day - warm yellow
            hueShift = 0;
            ambientOpacity = 0.1;
        } else if (hour >= 17 && hour < 20) {
            // Sunset - deep orange
            hueShift = 15;
            ambientOpacity = 0.2;
        } else {
            // Night - deep warm
            hueShift = 25;
            ambientOpacity = 0.05;
        }

        document.documentElement.style.setProperty('--time-hue-shift', `${hueShift}deg`);
        document.documentElement.style.setProperty('--ambient-glow', `rgba(232, 197, 71, ${ambientOpacity})`);
    }
}

// ============================================
// LEAF PARTICLE SYSTEM
// ============================================
class Leaf {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.reset();
    }

    reset() {
        this.x = random(-50, this.canvas.width + 50);
        this.y = random(-100, -50);
        this.size = random(CONFIG.leaves.minSize, CONFIG.leaves.maxSize);
        this.color = CONFIG.leaves.colors[randomInt(0, CONFIG.leaves.colors.length)];
        this.rotation = random(0, Math.PI * 2);
        this.rotationSpeed = random(-0.05, 0.05);
        this.vx = random(-1, 1);
        this.vy = random(1, 3);
        this.windPhase = random(0, Math.PI * 2);
        this.windFrequency = random(0.01, 0.03);
        this.opacity = random(0.6, 1);
        this.depth = random(0.5, 1); // Parallax depth
    }

    update(time, wind) {
        // Wind effect with turbulence
        const windEffect = Math.sin(time * this.windFrequency + this.windPhase) * CONFIG.leaves.windStrength;
        const turbulence = Math.sin(time * CONFIG.leaves.turbulence * this.windPhase) * 0.5;

        this.x += (this.vx + windEffect + wind + turbulence) * this.depth;
        this.y += (this.vy + CONFIG.leaves.gravity) * this.depth;
        this.rotation += this.rotationSpeed;

        // Reset when off screen
        if (this.y > this.canvas.height + 50 || this.x < -100 || this.x > this.canvas.width + 100) {
            this.reset();
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.globalAlpha = this.opacity * this.depth;

        // Draw leaf shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.size / 2);
        this.ctx.bezierCurveTo(
            this.size / 2, -this.size / 4,
            this.size / 2, this.size / 4,
            0, this.size / 2
        );
        this.ctx.bezierCurveTo(
            -this.size / 2, this.size / 4,
            -this.size / 2, -this.size / 4,
            0, -this.size / 2
        );

        this.ctx.fillStyle = this.color;
        this.ctx.fill();

        // Leaf vein
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.size / 2);
        this.ctx.lineTo(0, this.size / 2);
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.restore();
    }
}

class LeafSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.leaves = [];
        this.wind = 0;
        this.targetWind = 0;
        this.time = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize leaves
        for (let i = 0; i < CONFIG.leaves.count; i++) {
            const leaf = new Leaf(this.canvas, this.ctx);
            leaf.y = random(-this.canvas.height, this.canvas.height); // Distribute initially
            this.leaves.push(leaf);
        }

        // Random wind gusts
        setInterval(() => {
            this.targetWind = random(-2, 2);
        }, 3000);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update() {
        this.time++;
        this.wind = lerp(this.wind, this.targetWind, 0.01);

        for (const leaf of this.leaves) {
            leaf.update(this.time, this.wind);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Sort by depth for proper layering
        this.leaves.sort((a, b) => a.depth - b.depth);

        for (const leaf of this.leaves) {
            leaf.draw();
        }
    }
}

// ============================================
// EMBER PARTICLE SYSTEM
// ============================================
class Ember {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.reset();
    }

    reset() {
        this.x = random(0, this.canvas.width);
        this.y = random(this.canvas.height * 0.5, this.canvas.height);
        this.size = random(CONFIG.embers.minSize, CONFIG.embers.maxSize);
        this.vx = random(-0.3, 0.3);
        this.vy = random(-0.5, -1.5);
        this.opacity = random(0.3, 0.8);
        this.flickerSpeed = random(0.05, 0.1);
        this.flickerPhase = random(0, Math.PI * 2);
        this.life = 1;
        this.decay = random(0.002, 0.005);
    }

    update(time) {
        this.x += this.vx + Math.sin(time * 0.01 + this.flickerPhase) * 0.3;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.life <= 0 || this.y < 0) {
            this.reset();
        }
    }

    draw(time) {
        const flicker = Math.sin(time * this.flickerSpeed + this.flickerPhase) * 0.3 + 0.7;
        const currentOpacity = this.opacity * this.life * flicker;

        // Glow effect
        const gradient = this.ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, `${CONFIG.embers.color}${currentOpacity})`);
        gradient.addColorStop(0.5, `${CONFIG.embers.color}${currentOpacity * 0.5})`);
        gradient.addColorStop(1, `${CONFIG.embers.color}0)`);

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Core
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 200, ${currentOpacity})`;
        this.ctx.fill();
    }
}

class EmberSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.embers = [];
        this.time = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        for (let i = 0; i < CONFIG.embers.count; i++) {
            this.embers.push(new Ember(this.canvas, this.ctx));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update() {
        this.time++;
        for (const ember of this.embers) {
            ember.update(this.time);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const ember of this.embers) {
            ember.draw(this.time);
        }
    }
}

// ============================================
// GENERATIVE BACKGROUND
// ============================================
class GenerativeBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;

        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            this.draw();
        });

        this.draw();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    draw() {
        const { width, height } = this.canvas;

        // Deep gradient background
        const gradient = this.ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height)
        );
        gradient.addColorStop(0, '#2d1810');
        gradient.addColorStop(0.5, '#1a0f0a');
        gradient.addColorStop(1, '#0d0705');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Add noise texture
        this.addNoiseTexture();

        // Add subtle patterns
        this.drawPatterns();
    }

    addNoiseTexture() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    drawPatterns() {
        const { width, height } = this.canvas;

        // Draw subtle radial light spots
        for (let i = 0; i < 5; i++) {
            const x = random(0, width);
            const y = random(0, height);
            const radius = random(100, 400);

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(196, 112, 60, 0.03)');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

// ============================================
// INTERACTIVE GRATITUDE TREE
// ============================================
class GratitudeTree {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gratitudeLeaves = [];
        this.animationFrame = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        this.draw();
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Show input modal
        const inputContainer = document.getElementById('gratitude-input');
        inputContainer.style.display = 'flex';
        inputContainer.dataset.x = x;
        inputContainer.dataset.y = y;

        document.getElementById('gratitude-text').focus();
    }

    addLeaf(text, x, y) {
        const leaf = {
            text: text,
            x: x,
            y: y,
            size: 0,
            targetSize: random(30, 50),
            rotation: random(-0.3, 0.3),
            color: CONFIG.tree.leafColors[randomInt(0, CONFIG.tree.leafColors.length)],
            opacity: 0,
            swayPhase: random(0, Math.PI * 2)
        };
        this.gratitudeLeaves.push(leaf);

        // Also create a floating gratitude display
        this.createFloatingGratitude(text, x, y);
    }

    createFloatingGratitude(text, x, y) {
        const container = document.getElementById('gratitude-leaves');
        const leaf = document.createElement('div');
        leaf.className = 'gratitude-leaf';
        leaf.textContent = text;

        // Position relative to tree canvas
        const treeRect = this.canvas.getBoundingClientRect();
        leaf.style.left = `${treeRect.left + x}px`;
        leaf.style.top = `${treeRect.top + y}px`;

        container.appendChild(leaf);

        // Remove after animation
        setTimeout(() => leaf.remove(), 15000);
    }

    draw() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);

        // Draw trunk
        const trunkX = width / 2;
        const trunkY = height - 50;
        const trunkHeight = height * 0.4;

        this.drawBranch(trunkX, trunkY, trunkHeight, -Math.PI / 2, 6);

        // Draw gratitude leaves with animation
        for (const leaf of this.gratitudeLeaves) {
            // Animate size and opacity
            leaf.size = lerp(leaf.size, leaf.targetSize, 0.1);
            leaf.opacity = lerp(leaf.opacity, 1, 0.1);

            const sway = Math.sin(this.animationFrame * 0.02 + leaf.swayPhase) * 5;

            this.ctx.save();
            this.ctx.translate(leaf.x + sway, leaf.y);
            this.ctx.rotate(leaf.rotation);
            this.ctx.globalAlpha = leaf.opacity;

            // Draw leaf shape
            this.ctx.beginPath();
            this.ctx.moveTo(0, -leaf.size / 2);
            this.ctx.bezierCurveTo(
                leaf.size / 2, -leaf.size / 4,
                leaf.size / 2, leaf.size / 4,
                0, leaf.size / 2
            );
            this.ctx.bezierCurveTo(
                -leaf.size / 2, leaf.size / 4,
                -leaf.size / 2, -leaf.size / 4,
                0, -leaf.size / 2
            );

            this.ctx.fillStyle = leaf.color;
            this.ctx.fill();

            // Draw text on leaf
            this.ctx.fillStyle = 'rgba(253, 245, 230, 0.9)';
            this.ctx.font = `${Math.max(8, leaf.size / 4)}px 'Cormorant Garamond', serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Truncate text if too long
            let displayText = leaf.text;
            if (displayText.length > 12) {
                displayText = displayText.substring(0, 10) + '...';
            }
            this.ctx.fillText(displayText, 0, 0);

            this.ctx.restore();
        }

        this.animationFrame++;
        requestAnimationFrame(() => this.draw());
    }

    drawBranch(x, y, length, angle, thickness) {
        if (length < 10 || thickness < 1) {
            // Draw a leaf at branch end
            this.drawTreeLeaf(x, y, angle);
            return;
        }

        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        // Draw branch with gradient
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = CONFIG.tree.trunkColor;
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Recursive branches
        const newLength = length * CONFIG.tree.branchLength;
        const newThickness = thickness * 0.7;

        // Add some randomness to branch angles
        const angleVariation = random(-0.1, 0.1);

        this.drawBranch(
            endX, endY,
            newLength,
            angle - CONFIG.tree.branchAngle + angleVariation,
            newThickness
        );

        this.drawBranch(
            endX, endY,
            newLength,
            angle + CONFIG.tree.branchAngle + angleVariation,
            newThickness
        );

        // Sometimes add a middle branch
        if (Math.random() > 0.6 && thickness > 2) {
            this.drawBranch(
                endX, endY,
                newLength * 0.8,
                angle + random(-0.2, 0.2),
                newThickness * 0.8
            );
        }
    }

    drawTreeLeaf(x, y, angle) {
        const leafSize = random(8, 15);
        const color = CONFIG.tree.leafColors[randomInt(0, CONFIG.tree.leafColors.length)];

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle + Math.PI / 2);

        // Leaf shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, -leafSize / 2);
        this.ctx.bezierCurveTo(
            leafSize / 2, -leafSize / 4,
            leafSize / 2, leafSize / 4,
            0, leafSize / 2
        );
        this.ctx.bezierCurveTo(
            -leafSize / 2, leafSize / 4,
            -leafSize / 2, -leafSize / 4,
            0, -leafSize / 2
        );

        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = random(0.7, 1);
        this.ctx.fill();

        this.ctx.restore();
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.reveal-text, .reveal-scale');
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        this.elements.forEach(el => this.observer.observe(el));

        // Parallax effect on scroll
        window.addEventListener('scroll', () => this.handleParallax());
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Stagger children if present
                const children = entry.target.querySelectorAll('[data-delay]');
                children.forEach((child, i) => {
                    child.style.animationDelay = `${i * 0.1}s`;
                });
            }
        });
    }

    handleParallax() {
        const scrollY = window.scrollY;
        const layers = document.querySelectorAll('.parallax-layer');

        layers.forEach((layer, i) => {
            const speed = (i + 1) * 0.1;
            layer.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }
}

// ============================================
// FEAST ITEM INTERACTIONS
// ============================================
class FeastInteractions {
    constructor() {
        this.items = document.querySelectorAll('.feast-item');
        this.init();
    }

    init() {
        this.items.forEach(item => {
            item.addEventListener('mouseenter', () => this.handleHover(item));
            item.addEventListener('mouseleave', () => this.handleLeave(item));
        });
    }

    handleHover(item) {
        // Add ripple effect
        const glow = item.querySelector('.feast-glow');
        if (glow) {
            glow.style.opacity = '0.5';
        }
    }

    handleLeave(item) {
        const glow = item.querySelector('.feast-glow');
        if (glow) {
            glow.style.opacity = '0';
        }
    }
}

// ============================================
// MAIN ANIMATION LOOP
// ============================================
class App {
    constructor() {
        this.init();
    }

    async init() {
        // Initialize systems
        this.timeTheme = new TimeTheme();
        this.background = new GenerativeBackground('bg-canvas');
        this.leafSystem = new LeafSystem('leaf-canvas');
        this.emberSystem = new EmberSystem('ember-canvas');
        this.tree = new GratitudeTree('tree-canvas');
        this.scrollAnimations = new ScrollAnimations();
        this.feastInteractions = new FeastInteractions();

        // Setup gratitude input handlers
        this.setupGratitudeInput();

        // Start animation loop
        this.animate();
    }

    setupGratitudeInput() {
        const inputContainer = document.getElementById('gratitude-input');
        const input = document.getElementById('gratitude-text');
        const addBtn = document.getElementById('add-leaf-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        addBtn.addEventListener('click', () => {
            const text = input.value.trim();
            if (text) {
                const x = parseFloat(inputContainer.dataset.x);
                const y = parseFloat(inputContainer.dataset.y);
                this.tree.addLeaf(text, x, y);
                input.value = '';
                inputContainer.style.display = 'none';
            }
        });

        cancelBtn.addEventListener('click', () => {
            input.value = '';
            inputContainer.style.display = 'none';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });

        // Close on clicking outside
        inputContainer.addEventListener('click', (e) => {
            if (e.target === inputContainer) {
                cancelBtn.click();
            }
        });
    }

    animate() {
        this.leafSystem.update();
        this.leafSystem.draw();

        this.emberSystem.update();
        this.emberSystem.draw();

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
// Reduce animations when page is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy animations
        CONFIG.leaves.count = 10;
        CONFIG.embers.count = 5;
    } else {
        // Resume normal animations
        CONFIG.leaves.count = 50;
        CONFIG.embers.count = 30;
    }
});

// Respect reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    CONFIG.leaves.count = 5;
    CONFIG.embers.count = 3;
}
