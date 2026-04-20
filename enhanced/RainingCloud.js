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

    function Cloud(cx, cy, scale, speed) {
        this.cx = cx;
        this.cy = cy;
        this.scale = scale;
        this.vx = speed;

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
            this.cx += this.vx;
            var w = canvas.width;
            var margin = 120 * this.scale;
            if (this.cx > w - margin || this.cx < margin) this.vx = -this.vx;
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
        this.vy += 0.08;
        this.y += this.vy;
        if (this.y > canvas.height) this.reset(false);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.len);
        ctx.strokeStyle = 'rgba(120,180,230,0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
    };

    var clouds = [];
    var drops = [];
    var flashTimer = 0;

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

    function maybeLightning() {
        if (flashTimer > 0) {
            ctx.fillStyle = 'rgba(255,255,230,' + (flashTimer / 10) + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashTimer--;
        } else if (Math.random() < 0.003) {
            flashTimer = 8;
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        drawSky();
        for (var i = 0; i < clouds.length; i++) clouds[i].update();
        for (var j = 0; j < drops.length; j++) drops[j].update();
        maybeLightning();
    }

    addEventListener('resize', init);
    init();
    loop();
})();
