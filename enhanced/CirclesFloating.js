(function () {
    var canvas = document.getElementById('EnhCirFloCanvas');
    var parent = document.getElementById('EnhCirFloParent');
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();

    var mouse = { x: 0, y: 0, active: false };
    var pendingExplosion = null;
    var RANGE = 90;

    canvas.addEventListener('mousemove', function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
    });
    canvas.addEventListener('mouseleave', function () { mouse.active = false; });
    canvas.addEventListener('click', function (e) {
        pendingExplosion = { x: e.offsetX, y: e.offsetY };
    });

    var palette = ['#092140', '#024959', '#F2C777', '#F24738', '#BF2A2A'];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function Circle(x, y, vx, vy, r) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.r = r;
        this.minR = r;
        this.maxR = r * 8;
        this.stroke = palette[Math.floor(Math.random() * palette.length)];
        this.fill = palette[Math.floor(Math.random() * palette.length)];
    }
    Circle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.fill;
        ctx.strokeStyle = this.stroke;
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
    };
    Circle.prototype.update = function () {
        if (this.x + this.r > canvas.width || this.x - this.r < 0) this.vx = -this.vx;
        if (this.y + this.r > canvas.height || this.y - this.r < 0) this.vy = -this.vy;
        this.x += this.vx;
        this.y += this.vy;

        var near = mouse.active &&
            Math.hypot(this.x - mouse.x, this.y - mouse.y) < RANGE;

        var target = near ? this.maxR : this.minR;
        this.r += (target - this.r) * 0.15;

        if (pendingExplosion) {
            var dx = this.x - pendingExplosion.x;
            var dy = this.y - pendingExplosion.y;
            var d = Math.hypot(dx, dy);
            if (d < RANGE * 1.6 && d > 0.01) {
                var k = (1 - d / (RANGE * 1.6)) * 14;
                this.vx += (dx / d) * k;
                this.vy += (dy / d) * k;
            }
        }

        this.vx *= 0.995;
        this.vy *= 0.995;

        this.draw();
    };

    var circles = [];
    function init() {
        resize();
        circles = [];
        var n = Math.min(120, Math.floor(canvas.width * canvas.height / 4000));
        for (var i = 0; i < n; i++) {
            var r = rand(3, 8);
            circles.push(new Circle(
                rand(r, canvas.width - r),
                rand(r, canvas.height - r),
                rand(-1, 1) || 0.5,
                rand(-1, 1) || 0.5,
                r
            ));
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < circles.length; i++) circles[i].update();
        pendingExplosion = null;
    }

    addEventListener('resize', init);
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(function () { init(); }).observe(parent);
    }
    init();
    loop();
})();
