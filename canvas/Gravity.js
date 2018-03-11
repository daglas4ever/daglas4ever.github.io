// Initial Setup
var GravityCanvas = document.getElementById('GravityCanvas');
var GravityParent = document.getElementById('GravityCanvasParent');
var GravityContext = GravityCanvas.getContext('2d');
var gravity = 2;
var friction = 0.7;

GravityCanvas.width = GravityParent.offsetWidth;
GravityCanvas.height = GravityParent.offsetHeight;

// Variables
var GravityMouse = {
    x: GravityParent.offsetWidth / 2,
    y: GravityParent.offsetHeight / 2
};

var GravityColors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66'];

// Event Listeners
GravityCanvas.addEventListener("mousemove", function(event) {
    GravityMouse.x = event.offsetX;
    GravityMouse.y = event.offsetY;
});

GravityCanvas.addEventListener("mouseleave", function(event) {
    GravityMouse.x = undefined;
    GravityMouse.y = undefined;
});

GravityCanvas.addEventListener("resize", function() {
    GravityCanvas.width = GravityParent.offsetWidth;
    GravityCanvas.height = GravityParent.offsetHeight;

    init();
});
/*
GravityCanvas.addEventListener('click', function(event) {

    init();
});
*/
// Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(GravityColors) {
    return GravityColors[Math.floor(Math.random() * GravityColors.length)];
}

// Objects

function Ball(x, y, dy, dx, radius, color) {
    this.x = x;
    this.y = y;
    this.dy = dy;
    this.dx = dx;
    this.radius = radius;
    this.color = color;

    this.update = function() {

        if (this.y + this.radius + this.dy > GravityCanvas.height)
            this.dy = -this.dy * friction;
        else
            this.dy += gravity;

        if (this.x + this.radius > GravityCanvas.width || this.x - this.radius < 0)
            this.dx = -this.dx;

        //effect of lifting it up on GravityMouse nearby
        if (this.x - GravityMouse.x < gravityMouseRange && this.x - GravityMouse.x > -gravityMouseRange && this.y - GravityMouse.y < gravityMouseRange && this.y - GravityMouse.y > -gravityMouseRange) {
            this.dy -= 10;

        }

        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    };

    this.draw = function() {
        GravityContext.beginPath();
        GravityContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        GravityContext.fillStyle = this.color;
        GravityContext.fill();
        GravityContext.closePath();
        GravityContext.stroke();
    };
}

// Implementation
var ball;
var ballArray = [];
var arraysize = 100;
var gravityMouseRange = 50;

function init() {

    ball = new Ball(
        GravityCanvas.width / 2,
        GravityCanvas.height / 2,
        3,
        0,
        30,
        'red'
    );
    ballArray = [];
    for (var i = 0; i < arraysize; i++) {
        var x,
            y,
            dy,
            dx,
            radius,
            color;
        radius = randomIntFromRange(8, 20);
        x = randomIntFromRange(radius + 5, GravityCanvas.width - radius);
        y = randomIntFromRange(radius + 5, GravityCanvas.height - radius);
        dx = randomIntFromRange(-2, 2);
        dy = randomIntFromRange(-2, 2);
        color = randomColor(GravityColors);
        ballArray.push(new Ball(x, y, dy, dx, radius, color));

    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    GravityContext.clearRect(0, 0, GravityCanvas.width, GravityCanvas.height);

    for (var i = 0; i < ballArray.length; i++)
        ballArray[i].update();

    // GravityContext.fillText("Potatoes Is Awesome", GravityMouse.x,
    // GravityMouse.y);
}

init();
animate();