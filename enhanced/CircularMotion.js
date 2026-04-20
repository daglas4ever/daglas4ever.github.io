(function () {
    var canvas = document.getElementById('EnhCircularCanvas');
    var parent = document.getElementById('EnhCircularParent');
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();

    var CLICK_MAX_MS = 200;
    var CLICK_MAX_MOVE = 6;
    var WELL_LIFE = 220;
    var WELL_RANGE = 200;
    var WELL_FORCE = 4.5;
    var GATHER_FACTOR = 0.32;

    var mouse = { x: canvas.width / 2, y: canvas.height / 2, active: false };
    var prevMouse = { x: mouse.x, y: mouse.y };
    var holding = false;
    var holdStartTime = 0;
    var holdMoved = 0;
    var pressX = 0, pressY = 0;
    var ringScale = 1;
    var follow = { x: canvas.width / 2, y: canvas.height / 2, vx: 0, vy: 0 };
    var wells = [];

    canvas.addEventListener('mousemove', function (e) {
        prevMouse.x = mouse.x;
        prevMouse.y = mouse.y;
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
        if (holding) {
            holdMoved = Math.max(holdMoved, Math.hypot(mouse.x - pressX, mouse.y - pressY));
        }
    });
    canvas.addEventListener('mouseleave', function () {
        mouse.active = false;
        holding = false;
    });
    canvas.addEventListener('mousedown', function (e) {
        holding = true;
        holdStartTime = performance.now();
        holdMoved = 0;
        pressX = e.offsetX;
        pressY = e.offsetY;
    });
    canvas.addEventListener('mouseup', function (e) {
        var duration = performance.now() - holdStartTime;
        if (holding && duration < CLICK_MAX_MS && holdMoved < CLICK_MAX_MOVE) {
            wells.push({ x: e.offsetX, y: e.offsetY, life: WELL_LIFE });
        }
        holding = false;
    });
    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        var step = -Math.sign(e.deltaY) * 0.06;
        ringScale = Math.max(0.4, Math.min(2.0, ringScale + step));
    }, { passive: false });

    function Particle(ring, index, ringCount) {
        this.ring = ring;
        this.angle = (Math.PI * 2 * index) / ringCount + Math.random() * 0.2;
        this.speed = 0.015 + ring * 0.008;
        this.baseDistance = 40 + ring * 35;
        this.distance = this.baseDistance;
        this.radius = 6 - ring * 0.6;
        this.hueOffset = Math.random() * 60;
        this.last = { x: canvas.width / 2, y: canvas.height / 2 };
        this.offset = { x: 0, y: 0, vx: 0, vy: 0 };
    }
    Particle.prototype.update = function (time) {
        var prev = { x: this.last.x, y: this.last.y };
        this.angle += this.speed;

        var target = this.baseDistance * ringScale * (holding ? GATHER_FACTOR : 1);
        this.distance += (target - this.distance) * 0.1;

        var ox = follow.x + Math.cos(this.angle) * this.distance;
        var oy = follow.y + Math.sin(this.angle) * this.distance;

        for (var w = 0; w < wells.length; w++) {
            var well = wells[w];
            var dx = well.x - (ox + this.offset.x);
            var dy = well.y - (oy + this.offset.y);
            var d = Math.hypot(dx, dy);
            if (d < WELL_RANGE && d > 0.01) {
                var lifeStrength = Math.min(1, (well.life / WELL_LIFE) * 2.2);
                var falloff = (1 - d / WELL_RANGE) * lifeStrength;
                this.offset.vx += (dx / d) * WELL_FORCE * falloff;
                this.offset.vy += (dy / d) * WELL_FORCE * falloff;
            }
        }

        this.offset.vx -= this.offset.x * 0.04;
        this.offset.vy -= this.offset.y * 0.04;
        this.offset.vx *= 0.9;
        this.offset.vy *= 0.9;
        this.offset.x += this.offset.vx;
        this.offset.y += this.offset.vy;

        this.last.x = ox + this.offset.x;
        this.last.y = oy + this.offset.y;

        var hue = (time * 0.05 + this.hueOffset + this.ring * 40) % 360;
        ctx.beginPath();
        ctx.strokeStyle = 'hsl(' + hue + ', 80%, 60%)';
        ctx.lineWidth = this.radius;
        ctx.lineCap = 'round';
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(this.last.x, this.last.y);
        ctx.stroke();
    };

    var particles = [];
    function init() {
        resize();
        particles = [];
        follow.x = canvas.width / 2;
        follow.y = canvas.height / 2;
        follow.vx = 0; follow.vy = 0;
        var rings = 4;
        var perRing = 18;
        for (var r = 0; r < rings; r++) {
            for (var i = 0; i < perRing; i++) {
                particles.push(new Particle(r, i, perRing));
            }
        }
    }

    function updateFollow() {
        if (holding) {
            follow.vx = mouse.x - follow.x;
            follow.vy = mouse.y - follow.y;
            follow.x = mouse.x;
            follow.y = mouse.y;
        } else {
            var tx = mouse.active ? mouse.x : canvas.width / 2;
            var ty = mouse.active ? mouse.y : canvas.height / 2;
            follow.vx += (tx - follow.x) * 0.02;
            follow.vy += (ty - follow.y) * 0.02;
            follow.vx *= 0.94;
            follow.vy *= 0.94;
            follow.x += follow.vx;
            follow.y += follow.vy;
        }
    }

    function drawWells() {
        for (var i = wells.length - 1; i >= 0; i--) {
            var w = wells[i];
            var alpha = w.life / WELL_LIFE;
            var grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, WELL_RANGE);
            grad.addColorStop(0, 'rgba(255, 255, 255, ' + (alpha * 0.35) + ')');
            grad.addColorStop(0.4, 'rgba(150, 200, 255, ' + (alpha * 0.15) + ')');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(w.x, w.y, WELL_RANGE, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(w.x, w.y, 4 + (1 - alpha) * 20, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + alpha + ')';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            w.life--;
            if (w.life <= 0) wells.splice(i, 1);
        }
    }

    function loop(time) {
        requestAnimationFrame(loop);
        ctx.fillStyle = 'rgba(10, 15, 30, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateFollow();
        drawWells();
        for (var i = 0; i < particles.length; i++) particles[i].update(time);
    }

    addEventListener('resize', init);
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(function () { init(); }).observe(parent);
    }
    init();
    requestAnimationFrame(loop);
})();
