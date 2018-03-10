// Initial Setup
var RecCanvas = document.getElementById('RectanglesCanvas');
var RecC = RecCanvas.getContext('2d');
var RectanglesParent = document.getElementById('RectanglesCanvasParent');
RecCanvas.width = RectanglesParent.offsetWidth - 5;
RecCanvas.height = RectanglesParent.offsetHeight;



// Variables
var mou = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

var RectColors = [
    '#2185C5',
    '#7ECEFD',
    '#FFF6E5',
    '#FF7F66'
];


// Event Listeners
RecCanvas.addEventListener("mousemove", function(event) {
    mou.x = event.offsetX;
    mou.y = event.offsetY;


});

RecCanvas.addEventListener("resize", function() {
    RecCanvas.width = RectanglesParent.offsetWidth - 5;
    RecCanvas.height = RectanglesParent.offsetHeight;
    initRect();
});

RecCanvas.addEventListener('click', function(event) {
    initRect();
});


var effectRange = 100;
// Objects
function Rectangle(x, y, dy, dx, width, height, color) {
    this.x = x;
    this.y = y;
    this.dy = dy == 0 ? randomIntFromRange(-5, 5) : dy;
    this.dx = dx == 0 ? randomIntFromRange(-5, 5) : dx;
    this.w = width;
    this.h = height;
    this.minHeight = height;
    this.maxHeight = height * 10;
    this.minWidth = width;
    this.maxWidth = width * 10;
    this.color = color;

    this.update = function() {

        if (this.x + this.w > RecCanvas.width || this.x <= 0)
            this.dx = -this.dx;

        if (this.y + this.h > RecCanvas.height || this.y <= 0)
            this.dy = -this.dy;

        if (this.x - mou.x < effectRange && this.x - mou.x > -effectRange &&
            this.y - mou.y < effectRange && this.y - mou.y > -effectRange) {
            this.w += 1;
            this.h += .5;
        } else {
            this.w -= 1;
            this.h -= .5;
        }
        if (this.h > this.maxHeight)
            this.h = this.maxHeight;
        else if (this.h < this.minHeight)
            this.h = this.minHeight;
        if (this.w > this.maxWidth)
            this.w = this.maxWidth;
        else if (this.w < this.minWidth)
            this.w = this.minWidth;

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    };

    this.draw = function() {
        RecC.beginPath();
        //c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        RecC.rect(this.x, this.y, this.w, this.h)
        RecC.fillStyle = this.color;
        RecC.fill();
        RecC.closePath();
        RecC.stroke();
    };
}


// Implementation

var rectanglesArray = [];

function initRect() {


    rectanglesArray = [];
    for (var i = 0; i < 100; i++) {
        var x, y, dy, dx, width = 40,
            height = 40,
            color;
        radius = randomIntFromRange(8, 20);
        x = randomIntFromRange(width, RecCanvas.width - width);
        y = randomIntFromRange(height, RecCanvas.height - height);
        dx = randomIntFromRange(-3, 3);
        dy = randomIntFromRange(-3, 3);
        width = randomIntFromRange(4, 10);
        height = randomIntFromRange(4, 10);
        color = randomColor(RectColors);
        rectanglesArray.push(new Rectangle(x, y, dy, dx, width, height, color));

    }
}

// Animation Loop
function animateRect() {
    requestAnimationFrame(animateRect);

    RecC.clearRect(0, 0, RecCanvas.width, RecCanvas.height);

    for (var i = 0; i < rectanglesArray.length; i++)
        rectanglesArray[i].update();

    //c.fillText("Potatoes Is Awesome", mouse.x, mouse.y);
}




initRect();
animateRect();