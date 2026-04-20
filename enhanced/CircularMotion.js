(function () {
    var canvas = document.getElementById('EnhCircularCanvas');
    var parent = document.getElementById('EnhCircularParent');
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();

    var mouse = { x: canvas.width / 2, y: canvas.height / 2, active: false };

    canvas.addEventListener('mousemove', function (e) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        mouse.active = true;
    });
    canvas.addEventListener('mouseleave', function () {
        mouse.active = false;
    });

    function Particle(ring, index, ringCount) {
        this.ring = ring;
        this.index = index;
        this.ringCount = ringCount;
        this.angle = (Math.PI * 2 * index) / ringCount + Math.random() * 0.2;
        this.speed = 0.015 + ring * 0.008;
        this.distance = 40 + ring * 35;
        this.radius = 6 - ring * 0.6;
        this.hueOffset = Math.random() * 60;
        this.last = { x: canvas.width / 2, y: canvas.height / 2 };
        this.follow = { x: canvas.width / 2, y: canvas.height / 2 };
    }
    Particle.prototype.update = function (time) {
        var prev = { x: this.last.x, y: this.last.y };
        this.angle += this.speed;

        var tx = mouse.active ? mouse.x : canvas.width / 2;
        var ty = mouse.active ? mouse.y : canvas.height / 2;
        this.follow.x += (tx - this.follow.x) * 0.06;
        this.follow.y += (ty - this.follow.y) * 0.06;

        this.last.x = this.follow.x + Math.cos(this.angle) * this.distance;
        this.last.y = this.follow.y + Math.sin(this.angle) * this.distance;

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
        var rings = 4;
        var perRing = 18;
        for (var r = 0; r < rings; r++) {
            for (var i = 0; i < perRing; i++) {
                particles.push(new Particle(r, i, perRing));
            }
        }
    }

    function loop(time) {
        requestAnimationFrame(loop);
        ctx.fillStyle = 'rgba(10, 15, 30, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) particles[i].update(time);
    }

    addEventListener('resize', init);
    init();
    requestAnimationFrame(loop);
})();
