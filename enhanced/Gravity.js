(function () {
    var canvas = document.getElementById('EnhGravityCanvas');
    var parent = document.getElementById('EnhGravityParent');
    var ctx = canvas.getContext('2d');

    var DEFAULT_GRAVITY = 0.35;
    var FRICTION = 0.85;
    var MOUSE_RANGE = 90;
    var MOUSE_FORCE = 1.2;
    var ATTRACT_RANGE = 220;
    var ATTRACT_FORCE = 1.1;
    var CLICK_MAX_MS = 200;
    var CLICK_MAX_MOVE = 5;
    var MAX_BALLS = 120;

    var gravity = DEFAULT_GRAVITY;

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();

    var mouse = { x: 0, y: 0, active: false };
    var holding = false;
    var holdStart = 0;
    var holdMoved = 0;
    var pressX = 0, pressY = 0;

    canvas.addEventListener('mousemove', function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
        if (holding) holdMoved = Math.max(holdMoved, Math.hypot(mouse.x - pressX, mouse.y - pressY));
    });
    canvas.addEventListener('mouseleave', function () {
        mouse.active = false;
        holding = false;
    });
    canvas.addEventListener('mousedown', function (e) {
        mouse.x = e.offsetX; mouse.y = e.offsetY; mouse.active = true;
        holding = true;
        holdStart = performance.now();
        holdMoved = 0;
        pressX = e.offsetX;
        pressY = e.offsetY;
    });
    canvas.addEventListener('mouseup', function (e) {
        var duration = performance.now() - holdStart;
        if (holding && duration < CLICK_MAX_MS && holdMoved < CLICK_MAX_MOVE) {
            spawnBall(e.offsetX, e.offsetY);
        }
        holding = false;
    });
    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        var step = -Math.sign(e.deltaY) * 0.08;
        gravity = Math.max(-0.6, Math.min(1.3, gravity + step));
    }, { passive: false });

    var colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66', '#F2C777'];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function Ball(x, y, vx, vy, r, color) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.r = r;
        this.mass = r * r;
        this.color = color;
    }
    Ball.prototype.draw = function () {
        var g = ctx.createRadialGradient(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.1, this.x, this.y, this.r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.4, this.color);
        g.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    };
    Ball.prototype.update = function () {
        this.vy += gravity;

        if (mouse.active && !holding) {
            var dx = this.x - mouse.x;
            var dy = this.y - mouse.y;
            var d = Math.hypot(dx, dy);
            if (d < MOUSE_RANGE && d > 0.01) {
                var strength = (1 - d / MOUSE_RANGE) * MOUSE_FORCE;
                this.vx += (dx / d) * strength * 4;
                this.vy += (dy / d) * strength * 4;
            }
        }

        if (holding && mouse.active) {
            var adx = mouse.x - this.x;
            var ady = mouse.y - this.y;
            var ad = Math.hypot(adx, ady);
            if (ad < ATTRACT_RANGE && ad > 0.01) {
                var ak = (1 - ad / ATTRACT_RANGE) * ATTRACT_FORCE;
                this.vx += (adx / ad) * ak;
                this.vy += (ady / ad) * ak;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.r < 0) { this.x = this.r; this.vx = -this.vx * FRICTION; }
        if (this.x + this.r > canvas.width) { this.x = canvas.width - this.r; this.vx = -this.vx * FRICTION; }
        if (this.y - this.r < 0) { this.y = this.r; this.vy = -this.vy * FRICTION; }
        if (this.y + this.r > canvas.height) {
            this.y = canvas.height - this.r;
            this.vy = -this.vy * FRICTION;
            this.vx *= 0.98;
        }
    };

    function collide(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var dist = Math.hypot(dx, dy);
        var overlap = a.r + b.r - dist;
        if (overlap <= 0 || dist === 0) return;

        var nx = dx / dist;
        var ny = dy / dist;

        var sep = overlap / 2;
        a.x -= nx * sep; a.y -= ny * sep;
        b.x += nx * sep; b.y += ny * sep;

        var rvx = b.vx - a.vx;
        var rvy = b.vy - a.vy;
        var velAlongNormal = rvx * nx + rvy * ny;
        if (velAlongNormal > 0) return;

        var restitution = 0.9;
        var j = -(1 + restitution) * velAlongNormal / (1 / a.mass + 1 / b.mass);
        var ix = j * nx;
        var iy = j * ny;
        a.vx -= ix / a.mass; a.vy -= iy / a.mass;
        b.vx += ix / b.mass; b.vy += iy / b.mass;
    }

    function spawnBall(x, y) {
        if (balls.length >= MAX_BALLS) return;
        var r = rand(10, 22);
        x = Math.max(r, Math.min(canvas.width - r, x));
        y = Math.max(r, Math.min(canvas.height - r, y));
        balls.push(new Ball(x, y, rand(-2, 2), rand(-1, 1), r, colors[Math.floor(Math.random() * colors.length)]));
    }

    var balls = [];
    function init() {
        resize();
        balls = [];
        var n = Math.min(40, Math.floor(canvas.width * canvas.height / 9000));
        var tries = 0;
        while (balls.length < n && tries < n * 20) {
            tries++;
            var r = rand(10, 22);
            var x = rand(r, canvas.width - r);
            var y = rand(r, canvas.height * 0.5);
            var overlap = false;
            for (var k = 0; k < balls.length; k++) {
                if (Math.hypot(balls[k].x - x, balls[k].y - y) < balls[k].r + r + 2) {
                    overlap = true; break;
                }
            }
            if (overlap) continue;
            balls.push(new Ball(x, y, rand(-2, 2), rand(-1, 1), r, colors[Math.floor(Math.random() * colors.length)]));
        }
    }

    function drawAttractIndicator() {
        if (!holding || !mouse.active) return;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, ATTRACT_RANGE, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 250, 171, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawGravityHud() {
        ctx.save();
        ctx.font = '13px "Franklin Gothic Medium", Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(255, 250, 171, 0.9)';
        var label = 'gravity ' + gravity.toFixed(2);
        if (Math.abs(gravity) < 0.02) label += '  (zero-g)';
        else if (gravity < 0) label += '  (inverted)';
        ctx.fillText(label, canvas.width - 12, canvas.height - 12);

        var ax = canvas.width - 24;
        var ay = canvas.height - 40;
        var len = Math.max(-28, Math.min(28, gravity * 40));
        ctx.strokeStyle = 'rgba(255, 250, 171, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay - len / 2);
        ctx.lineTo(ax, ay + len / 2);
        ctx.stroke();
        if (Math.abs(len) > 4) {
            var dir = Math.sign(len);
            ctx.beginPath();
            ctx.moveTo(ax, ay + len / 2);
            ctx.lineTo(ax - 4, ay + len / 2 - 5 * dir);
            ctx.lineTo(ax + 4, ay + len / 2 - 5 * dir);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 250, 171, 0.9)';
            ctx.fill();
        }
        ctx.restore();
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.fillStyle = '#152940';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawAttractIndicator();
        for (var i = 0; i < balls.length; i++) balls[i].update();
        for (var i2 = 0; i2 < balls.length; i2++) {
            for (var j = i2 + 1; j < balls.length; j++) collide(balls[i2], balls[j]);
            balls[i2].draw();
        }
        drawGravityHud();
    }

    addEventListener('resize', init);
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(function () { init(); }).observe(parent);
    }
    init();
    loop();
})();
