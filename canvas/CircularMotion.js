// Initial Setup
//var canvas = document.querySelector('canvas');
var canvas = document.getElementById('CircularCanvas');
var parent = document.getElementById('CircularCanvasParent');
var c = canvas.getContext('2d');

canvas.width = parent.offsetWidth - 5;
canvas.height = parent.offsetHeight;

// Variables

var CircularMouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

var colors = [
    '#2185C5',
    '#7ECEFD',
    '#FFF6E5',
    '#FF7F66'
];

// Event Listeners
canvas.addEventListener("mousemove", function(event) {
    CircularMouse.x = event.offsetX;
    CircularMouse.y = event.offsetY;
});

canvas.addEventListener("mouseleave", function(event) {
    CircularMouse.x = parent.offsetWidth / 2;
    CircularMouse.y = parent.offsetHeight / 2;
});

canvas.addEventListener("resize", function() {


    canvas.width = parent.offsetWidth - 5;
    canvas.height = parent.offsetHeight;
    initCircle();
});
/*
canvas.addEventListener('click', function(event) {
    //initCircle();
});
*/
// Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}


// Objects
function Particle(x, y, radius, color) {
    this.x = x; //mouse.x;
    this.y = y; //mouse.y;
    this.radius = radius; //size
    this.radiance = Math.random() * Math.PI * 2; //so they arnt all the same place(start angle)
    this.color = color;
    this.velocity = .03; //travel away from center // SPEED
    this.distanceFromCenter = randomIntFromRange(50, 150);
    this.lastMouse = { x: x, y: y };

    this.update = function() {
        const lastPoint = { x: this.x, y: this.y };
        this.radiance += this.velocity;

        //drag effect
        this.lastMouse.x += (CircularMouse.x - this.lastMouse.x) * .05;
        this.lastMouse.y += (CircularMouse.y - this.lastMouse.y) * .05;

        this.x = this.lastMouse.x + Math.cos(this.radiance) * this.distanceFromCenter;
        this.y = this.lastMouse.y + Math.sin(this.radiance) * this.distanceFromCenter;
        this.draw(lastPoint);


    };

    this.draw = lastPoint => {
        c.beginPath();
        c.strokeStyle = this.color;
        c.lineWidth = this.radius;
        c.moveTo(lastPoint.x, lastPoint.y);
        c.lineTo(this.x, this.y);
        c.stroke();
        c.closePath();
    };
}


// Implementation

var parts = [];

function initCircle() {

    parts = [];

    for (var i = 0; i < 60; i++) {
        var x, y, radius, color;
        radius = 8
        x = (canvas.width / 2); //- randomIntFromRange(-100, 100);// randomIntFromRange(radius + 5, canvas.width - radius);
        y = (canvas.height / 2); //- randomIntFromRange(-100, 100);//randomIntFromRange(radius + 5, canvas.height - radius);

        color = randomColor(colors);
        parts.push(new Particle(x, y, radius, color));

    }
}

// Animation Loop

function animateCircle() {
    requestAnimationFrame(animateCircle);
    c.fillStyle = 'rgba(255,255,255,.05)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    //c.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < parts.length; i++)
        parts[i].update();

    //c.fillText("Potatoes Is Awesome", mouse.x, mouse.y);
}




initCircle();
animateCircle();
