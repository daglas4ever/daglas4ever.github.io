(function () {
    var canvas = document.getElementById('EnhRectCanvas');
    var parent = document.getElementById('EnhRectParent');
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();

    var mouse = { x: 0, y: 0, active: false };
    canvas.addEventListener('mousemove', function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
    });
    canvas.addEventListener('mouseleave', function () { mouse.active = false; });

    var colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66', '#45BDFF'];
    var EFFECT_RANGE = 110;

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
        if (this.x < 0 || this.x + this.w > canvas.width) {
            this.vx = -this.vx;
            this.x = Math.max(0, Math.min(this.x, canvas.width - this.w));
        }
        if (this.y < 0 || this.y + this.h > canvas.height) {
            this.vy = -this.vy;
            this.y = Math.max(0, Math.min(this.y, canvas.height - this.h));
        }

        var near = false;
        if (mouse.active) {
            var cx = this.x + this.w / 2;
            var cy = this.y + this.h / 2;
            if (Math.hypot(cx - mouse.x, cy - mouse.y) < EFFECT_RANGE) near = true;
        }
        this.targetW = near ? this.maxW : this.minW;
        this.targetH = near ? this.maxH : this.minH;

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

    var rects = [];
    function init() {
        resize();
        rects = [];
        var n = Math.min(110, Math.floor(canvas.width * canvas.height / 4500));
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
        for (var i = 0; i < rects.length; i++) rects[i].update();
    }

    addEventListener('resize', init);
    init();
    loop();
})();
