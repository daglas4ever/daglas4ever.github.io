(function () {
    var canvas = document.getElementById('EnhCloudCanvas');
    var parent = document.getElementById('EnhCloudParent');
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();

    function rand(min, max) { return Math.random() * (max - min) + min; }

    var UMBRELLA_RADIUS = 45;
    var DRAG_THRESHOLD = 5;
    var CLOUD_HIT_RADIUS = 100;

    var mouse = { x: 0, y: 0, active: false };
    var pointerDown = null;
    var dragging = null;
    var dragOffset = { x: 0, y: 0 };
    var lightnings = [];
    var splashes = [];

    function pickCloud(x, y) {
        for (var i = 0; i < clouds.length; i++) {
            var c = clouds[i];
            if (Math.hypot(c.cx - x, c.cy - y) < CLOUD_HIT_RADIUS * c.scale) return c;
        }
        return null;
    }

    canvas.addEventListener('mousemove', function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
        if (dragging) {
            dragging.cx = mouse.x + dragOffset.x;
            dragging.cy = mouse.y + dragOffset.y;
        }
    });
    canvas.addEventListener('mouseleave', function () {
        mouse.active = false;
        pointerDown = null;
        if (dragging) { dragging.frozen = false; dragging = null; }
    });
    canvas.addEventListener('mousedown', function (e) {
        pointerDown = { x: e.offsetX, y: e.offsetY };
        var c = pickCloud(e.offsetX, e.offsetY);
        if (c) {
            dragging = c;
            c.frozen = true;
            dragOffset.x = c.cx - e.offsetX;
            dragOffset.y = c.cy - e.offsetY;
        }
    });
    canvas.addEventListener('mouseup', function (e) {
        var moved = pointerDown && Math.hypot(e.offsetX - pointerDown.x, e.offsetY - pointerDown.y) > DRAG_THRESHOLD;
        if (dragging) {
            dragging.frozen = false;
            dragging = null;
        } else if (pointerDown && !moved) {
            strikeLightning(e.offsetX, e.offsetY);
        }
        pointerDown = null;
    });

    function nearestCloud(x, y) {
        var best = null, bestD = Infinity;
        for (var i = 0; i < clouds.length; i++) {
            var c = clouds[i];
            var d = Math.hypot(c.cx - x, c.cy - y);
            if (d < bestD) { bestD = d; best = c; }
        }
        return best;
    }

    function buildBolt(x1, y1, x2, y2, displace) {
        var pts = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
        for (var iter = 0; iter < 5; iter++) {
            var next = [pts[0]];
            for (var i = 0; i < pts.length - 1; i++) {
                var a = pts[i], b = pts[i + 1];
                var mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * displace;
                var my = (a.y + b.y) / 2 + (Math.random() - 0.5) * displace;
                next.push({ x: mx, y: my });
                next.push(b);
            }
            pts = next;
            displace *= 0.5;
        }
        return pts;
    }

    function strikeLightning(x, y) {
        var c = nearestCloud(x, y);
        if (!c) return;
        var startX = c.cx + rand(-20, 20) * c.scale;
        var startY = c.cy + 20 * c.scale;
        var pts = buildBolt(startX, startY, x, y, Math.hypot(x - startX, y - startY) * 0.4);
        lightnings.push({ pts: pts, life: 12, max: 12 });
    }

    function drawLightnings() {
        for (var i = lightnings.length - 1; i >= 0; i--) {
            var L = lightnings[i];
            var alpha = L.life / L.max;
            ctx.fillStyle = 'rgba(255, 255, 220, ' + (alpha * 0.45) + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(255, 255, 230, ' + alpha + ')';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#fffae0';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.moveTo(L.pts[0].x, L.pts[0].y);
            for (var p = 1; p < L.pts.length; p++) ctx.lineTo(L.pts[p].x, L.pts[p].y);
            ctx.stroke();
            ctx.shadowBlur = 0;

            L.life--;
            if (L.life <= 0) lightnings.splice(i, 1);
        }
    }

    function umbrellaSurfaceY(x) {
        var dx = x - mouse.x;
        if (Math.abs(dx) > UMBRELLA_RADIUS) return null;
        return mouse.y - Math.sqrt(UMBRELLA_RADIUS * UMBRELLA_RADIUS - dx * dx);
    }

    function drawUmbrella() {
        if (!mouse.active || dragging) return;
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        ctx.beginPath();
        ctx.arc(0, 0, UMBRELLA_RADIUS, Math.PI, Math.PI * 2);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, -UMBRELLA_RADIUS, 0, 0);
        g.addColorStop(0, '#FF5E7D');
        g.addColorStop(1, '#8C001C');
        ctx.fillStyle = g;
        ctx.strokeStyle = '#FFFAAB';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 22);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFAAB';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(3, 24, 4, Math.PI, Math.PI * 2.2);
        ctx.stroke();
        ctx.restore();
    }

    function spawnSplash(x, y) {
        for (var i = 0; i < 4; i++) {
            splashes.push({
                x: x, y: y,
                vx: rand(-2.2, 2.2),
                vy: rand(-3.5, -1),
                life: 18
            });
        }
    }

    function updateSplashes() {
        for (var i = splashes.length - 1; i >= 0; i--) {
            var s = splashes[i];
            s.vy += 0.25;
            s.x += s.vx;
            s.y += s.vy;
            s.life--;
            if (s.life <= 0) { splashes.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(180, 220, 240, ' + (s.life / 18) + ')';
            ctx.fill();
        }
    }

    function Cloud(cx, cy, scale, speed) {
        this.cx = cx;
        this.cy = cy;
        this.scale = scale;
        this.vx = speed;
        this.frozen = false;

        this.draw = function () {
            var s = this.scale;
            ctx.save();
            ctx.translate(this.cx, this.cy);
            ctx.scale(s, s);

            var grad = ctx.createLinearGradient(0, -60, 0, 40);
            grad.addColorStop(0, '#f5f5f5');
            grad.addColorStop(1, '#6e7a8a');
            ctx.fillStyle = grad;
            ctx.strokeStyle = '#3d4a5c';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(-60, 10, 34, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(-20, -30, 42, Math.PI * 1, Math.PI * 1.85);
            ctx.arc(30, -40, 38, Math.PI * 1.2, Math.PI * 1.9);
            ctx.arc(70, -10, 34, Math.PI * 1.4, Math.PI * 2.1);
            ctx.arc(55, 25, 28, Math.PI * 1.8, Math.PI * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };

        this.update = function () {
            if (!this.frozen) {
                this.cx += this.vx;
                var w = canvas.width;
                var margin = 120 * this.scale;
                if (this.cx > w - margin || this.cx < margin) this.vx = -this.vx;
            }
            this.draw();
        };

        this.rainBounds = function () {
            var half = 90 * this.scale;
            return {
                left: this.cx - half,
                right: this.cx + half,
                top: this.cy + 10 * this.scale
            };
        };
    }

    function Drop() {
        this.reset(true);
    }
    Drop.prototype.reset = function (initial) {
        this.cloud = clouds[Math.floor(Math.random() * clouds.length)];
        var b = this.cloud.rainBounds();
        this.x = rand(b.left, b.right);
        this.y = initial ? rand(b.top, canvas.height) : b.top;
        this.vy = rand(2, 5);
        this.len = rand(6, 14);
    };
    Drop.prototype.update = function () {
        var prevY = this.y;
        this.vy += 0.08;
        this.y += this.vy;

        if (mouse.active && !dragging) {
            var surfY = umbrellaSurfaceY(this.x);
            if (surfY !== null && prevY < surfY && this.y >= surfY) {
                spawnSplash(this.x, surfY);
                this.reset(false);
                return;
            }
        }

        if (this.y > canvas.height) { this.reset(false); return; }

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.len);
        ctx.strokeStyle = 'rgba(120,180,230,0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
    };

    var clouds = [];
    var drops = [];

    function init() {
        resize();
        clouds = [
            new Cloud(canvas.width * 0.3, canvas.height * 0.3, 1.0, 0.6),
            new Cloud(canvas.width * 0.7, canvas.height * 0.45, 0.75, -0.45)
        ];
        var count = Math.floor(canvas.width / 4);
        drops = [];
        for (var i = 0; i < count; i++) drops.push(new Drop());
    }

    function drawSky() {
        var g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, '#1b2a3d');
        g.addColorStop(1, '#5a6a80');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function loop() {
        requestAnimationFrame(loop);
        drawSky();
        for (var i = 0; i < clouds.length; i++) clouds[i].update();
        for (var j = 0; j < drops.length; j++) drops[j].update();
        updateSplashes();
        drawLightnings();
        drawUmbrella();

        canvas.style.cursor = (mouse.active && pickCloud(mouse.x, mouse.y))
            ? (dragging ? 'grabbing' : 'grab')
            : 'crosshair';
    }

    addEventListener('resize', init);
    init();
    loop();
})();
