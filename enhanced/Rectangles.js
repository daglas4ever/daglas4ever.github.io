(function () {
    var canvas = document.getElementById('EnhRectCanvas');
    var parent = document.getElementById('EnhRectParent');
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();

    var EFFECT_RANGE = 110;
    var MAGNET_RANGE = 260;
    var MAGNET_FORCE = 0.55;
    var EXPLODE_FORCE = 20;
    var EXPLODE_RANGE = 320;
    var MAX_VELOCITY = 18;

    var mouse = { x: 0, y: 0, active: false };
    var magnetActive = false;
    var sizeScale = 1;
    var shockwaves = [];

    canvas.addEventListener('mousemove', function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
    });
    canvas.addEventListener('mouseleave', function () {
        mouse.active = false;
        magnetActive = false;
    });
    canvas.addEventListener('mousedown', function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
        magnetActive = true;
    });
    canvas.addEventListener('mouseup', function (e) {
        magnetActive = false;
        explode(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        var step = -Math.sign(e.deltaY) * 0.08;
        sizeScale = Math.max(0.4, Math.min(2.5, sizeScale + step));
    }, { passive: false });

    function explode(x, y) {
        shockwaves.push({ x: x, y: y, life: 32, max: 32 });
        for (var i = 0; i < rects.length; i++) {
            var r = rects[i];
            var cx = r.x + r.w / 2;
            var cy = r.y + r.h / 2;
            var dx = cx - x;
            var dy = cy - y;
            var d = Math.hypot(dx, dy);
            if (d < EXPLODE_RANGE && d > 0.01) {
                var k = (1 - d / EXPLODE_RANGE) * EXPLODE_FORCE;
                r.vx += (dx / d) * k;
                r.vy += (dy / d) * k;
            }
        }
    }

    var colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66', '#45BDFF'];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function Rect(x, y, vx, vy, w, h, color) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.w = w; this.h = h;
        this.minW = w; this.minH = h;
        this.maxW = w * 6; this.maxH = h * 6;
        this.targetW = w; this.targetH = h;
        this.color = color;
        this.angle = 0;
    }
    Rect.prototype.update = function () {
        if (magnetActive && mouse.active) {
            var mcx = this.x + this.w / 2;
            var mcy = this.y + this.h / 2;
            var mdx = mouse.x - mcx;
            var mdy = mouse.y - mcy;
            var md = Math.hypot(mdx, mdy);
            if (md < MAGNET_RANGE && md > 0.01) {
                var mk = MAGNET_FORCE * (1 - md / MAGNET_RANGE);
                this.vx += (mdx / md) * mk;
                this.vy += (mdy / md) * mk;
            }
        }

        this.vx *= 0.995;
        this.vy *= 0.995;
        var speed = Math.hypot(this.vx, this.vy);
        if (speed > MAX_VELOCITY) {
            this.vx = (this.vx / speed) * MAX_VELOCITY;
            this.vy = (this.vy / speed) * MAX_VELOCITY;
        }

        if (this.x < 0 || this.x + this.w > canvas.width) {
            this.vx = -this.vx * 0.8;
            this.x = Math.max(0, Math.min(this.x, canvas.width - this.w));
        }
        if (this.y < 0 || this.y + this.h > canvas.height) {
            this.vy = -this.vy * 0.8;
            this.y = Math.max(0, Math.min(this.y, canvas.height - this.h));
        }

        var near = false;
        if (mouse.active) {
            var cx = this.x + this.w / 2;
            var cy = this.y + this.h / 2;
            if (Math.hypot(cx - mouse.x, cy - mouse.y) < EFFECT_RANGE) near = true;
        }
        this.targetW = (near ? this.maxW : this.minW) * sizeScale;
        this.targetH = (near ? this.maxH : this.minH) * sizeScale;

        this.w += (this.targetW - this.w) * 0.12;
        this.h += (this.targetH - this.h) * 0.12;

        this.x += this.vx;
        this.y += this.vy;
        this.angle = Math.atan2(this.vy, this.vx);
        this.draw();
    };
    Rect.prototype.draw = function () {
        var cx = this.x + this.w / 2;
        var cy = this.y + this.h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    };

    function drawShockwaves() {
        for (var i = shockwaves.length - 1; i >= 0; i--) {
            var s = shockwaves[i];
            var a = s.life / s.max;
            var rad = (1 - a) * EXPLODE_RANGE;
            ctx.beginPath();
            ctx.arc(s.x, s.y, rad, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 246, 229, ' + a + ')';
            ctx.lineWidth = 2 + (1 - a) * 2;
            ctx.stroke();
            s.life--;
            if (s.life <= 0) shockwaves.splice(i, 1);
        }
    }

    function drawMagnetIndicator() {
        if (!magnetActive || !mouse.active) return;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MAGNET_RANGE, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 250, 171, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    var rects = [];
    function init() {
        resize();
        rects = [];
        var n = Math.min(180, Math.floor(canvas.width * canvas.height / 4500));
        for (var i = 0; i < n; i++) {
            var w = rand(4, 10);
            var h = rand(4, 10);
            rects.push(new Rect(
                rand(0, canvas.width - w),
                rand(0, canvas.height - h),
                rand(-2.5, 2.5) || 1,
                rand(-2.5, 2.5) || 1,
                w, h,
                colors[Math.floor(Math.random() * colors.length)]
            ));
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.fillStyle = 'rgba(21,41,64,0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawMagnetIndicator();
        for (var i = 0; i < rects.length; i++) rects[i].update();
        drawShockwaves();
    }

    addEventListener('resize', init);
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(function () { init(); }).observe(parent);
    }
    init();
    loop();
})();
