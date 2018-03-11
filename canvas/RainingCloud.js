// Initial Setup

var CloudCanvas = document.getElementById('CloudCanvas');
var CloudContext = CloudCanvas.getContext('2d');
var CloudParent = document.getElementById('CloudCanvasParent');
CloudCanvas.width = CloudParent.offsetWidth;
CloudCanvas.height = CloudParent.offsetHeight;

// Event Listeners
addEventListener("resize", function() {
    CloudCanvas.width = CloudParent.offsetWidth;
    CloudCanvas.height = CloudParent.offsetHeight;
    cloudInit();
});

// Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Objects
function Cloud(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.cp1x = cp1x;
    this.cp1y = cp1y;
    this.cp2x = cp2x;
    this.cp2y = cp2y;
    this.x = x;
    this.y = y;
    this.dx = 3;

    this.draw = function() {
        CloudContext.beginPath();
        CloudContext.moveTo(this.cp1x + 40, this.cp1y - 50);
        //CloudContext.bezierCurveTo(130, 90, 130, 140, 230, 140);
        CloudContext.bezierCurveTo(
            this.cp1x,
            this.cp1y,
            this.cp2x,
            this.cp2y,
            this.x,
            this.y
        );
        CloudContext.bezierCurveTo(
            this.cp1x + 120,
            this.cp1y + 80,
            this.cp2x + 190,
            this.cp2y + 30,
            this.x + 110,
            this.y
        );
        CloudContext.bezierCurveTo(
            this.cp1x + 290,
            this.cp1y + 60,
            this.cp2x + 290,
            this.cp2y - 20,
            this.x + 160,
            this.y - 40
        ); //(420, 150, 420, 120, 390, 100)
        CloudContext.bezierCurveTo(
            this.cp1x + 300,
            this.cp1y - 60,
            this.cp2x + 240,
            this.cp2y - 115,
            this.x + 110,
            this.y - 100
        );
        CloudContext.bezierCurveTo(
            this.cp1x + 190,
            this.cp1y - 85,
            this.cp2x + 120,
            this.cp2y - 125,
            this.x + 20,
            this.y + -100
        );
        CloudContext.bezierCurveTo(
            this.cp1x + 70,
            this.cp1y - 85,
            this.cp2x + 20,
            this.cp2y + (15 - 140),
            this.x + (170 - 230),
            this.y + (70 - 140)
        );
        CloudContext.closePath();
        CloudContext.lineWidth = 5;
        CloudContext.fillStyle = 'darkgrey';
        CloudContext.fill();
        CloudContext.strokeStyle = 'grey';
        CloudContext.stroke();
        //
    }
    this.update = function() {

        if (this.x + 200 > CloudParent.offsetWidth || this.x - 100 < 0)
            this.dx = -this.dx;
        this.cp1x += this.dx;
        this.cp2x += this.dx;
        this.x += this.dx;

        this.draw();
    }
}

function RainDrop(x, y, dy, dx, x2, y2, color) {
    this.x = x;
    this.y = y;
    this.dy = dy == 0 ?
        randomIntFromRange(1, 5) :
        dy;
    this.dx = dx == 0 ?
        randomIntFromRange(1, 5) :
        dx;
    this.x2 = x2;
    this.y2 = y2;
    this.originalY2 = y2 - y;
    this.originalX2 = x2;

    this.color = color;

    this.update = function() {

        if (this.y > CloudCanvas.height) {
            this.y = 0;
            this.y2 = this.originalY2;
            this.dy = Math.random() + 0.01;
        }
        this.y2 += this.dy;
        this.y += this.dy;
        this.dy += .33;

        this.draw();
    };

    this.draw = function() {
        CloudContext.beginPath();
        CloudContext.moveTo(this.x, this.y);
        CloudContext.lineTo(this.x2, this.y2);
        CloudContext.strokeStyle = this.color;
        CloudContext.lineWidth = Math.random() * 2;
        if ((this.x > cloud.x - 80 && this.x < cloud.x + 200) && (this.y > cloud.y - 20 && this.y < CloudCanvas.height))
            CloudContext.stroke();
    };
}

// Implementation

var rainDrops = [];
var cloud;

function cloudInit() {
    cloud = new Cloud(130, 90, 130, 140, 230, 140);

    rainDrops = [];
    rainDropsAmount = CloudParent.offsetWidth / 3;
    for (var i = 0; i < rainDropsAmount; i++) {
        var x1,
            y1,
            dy,
            dx,
            x2,
            y2,
            color;

        x = randomIntFromRange(0, CloudCanvas.width);
        y = randomIntFromRange(0, CloudCanvas.height);
        dx = randomIntFromRange(1, 3);
        dy = Math.random();
        x2 = x;
        y2 = y + 10;
        color = 'black'; //randomColor(colors);
        rainDrops.push(new RainDrop(x, y, dy, dx, x2, y2, color));

    }
}
var check = false;

// Animation Loop
function cloudAnimate() {
    requestAnimationFrame(cloudAnimate);

    CloudContext.clearRect(0, 0, CloudCanvas.width, CloudCanvas.height);

    for (var i = 0; i < rainDrops.length; i++)
        rainDrops[i].update();
    cloud.update();

    if (cloud.x > CloudCanvas.width / 2 - 200)
        check = true;


}

cloudInit();
cloudAnimate();