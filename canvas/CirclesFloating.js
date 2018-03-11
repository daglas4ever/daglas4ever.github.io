var CirFlotCanvas = document.getElementById('CirclesFloatingCanvas');
var CirclesFloatingParent = document.getElementById('CirclesFloatingParent');
var CirFloContext = CirFlotCanvas.getContext('2d'); //context

CirFlotCanvas.height = CirclesFloatingParent.offsetHeight;
CirFlotCanvas.width = CirclesFloatingParent.offsetWidth;


var CirFloMouse = {
    x: undefined,
    y: undefined
};

var clicked = false;

CirFlotCanvas.addEventListener('mousemove', function(Event) {
    CirFloMouse.x = event.offsetX;
    CirFloMouse.y = event.offsetY;

});

CirFlotCanvas.addEventListener("mouseleave", function(event) {
    CirFloMouse.x = undefined;
    CirFloMouse.y = undefined;
});

addEventListener('resize', function(event) {

    CirFlotCanvas.width = CirclesFloatingParent.offsetWidth;
    CirFlotCanvas.height = CirclesFloatingParent.offsetHeight;

    cirFloInit();
});

CirFlotCanvas.addEventListener('click', function(event) {
    for (var i = 0; i < circleArray.length; i++)
        circleArray[i].clicked = true;
});

var CirFloatMouseRange = 75;

var CirFloatColorArray = ['#092140', '#024959', '#F2C777', '#F24738', '#BF2A2A'];



function Circle(x1, y1, dx1, dy1, radius1) {
    this.x = x1;
    this.y = y1;
    this.dx = dx1;
    this.dy = dy1;
    this.radius = radius1;
    this.minRadius = radius1;
    this.maxRadius = radius1 * 10;


    var style = CirFloatColorArray[Math.floor(CirFloatColorArray.length * Math.random())];

    var style2 = CirFloatColorArray[Math.floor(CirFloatColorArray.length * Math.random())];

    this.draw = function() {
        CirFloContext.beginPath();
        CirFloContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        CirFloContext.strokeStyle = style;
        CirFloContext.fillStyle = style2;
        CirFloContext.lineWidth = 4;
        CirFloContext.fill();
        console.log('FML');
    }
    this.update = function() {

        if (this.x + this.radius > CirFlotCanvas.width || this.x - this.radius < 0)
            this.dx = -this.dx;

        if (this.y + this.radius > CirFlotCanvas.height || this.y - this.radius < 0)
            this.dy = -this.dy;

        this.x += this.dx;
        this.y += this.dy;


        if (CirFloMouse.x - this.x < CirFloatMouseRange &&
            CirFloMouse.x - this.x > -CirFloatMouseRange &&
            CirFloMouse.y - this.y < CirFloatMouseRange &&
            CirFloMouse.y - this.y > -CirFloatMouseRange) {
            if (this.radius < this.maxRadius)
                this.radius += 2;

        } else if (this.radius > this.minRadius) {
            this.radius -= 2;

        }

        this.pot();
        this.draw();
    }

    this.pot = function() {
        if (CirFloMouse.x - this.x < CirFloatMouseRange &&
            CirFloMouse.x - this.x > -CirFloatMouseRange &&
            CirFloMouse.y - this.y < CirFloatMouseRange &&
            CirFloMouse.y - this.y > -CirFloatMouseRange && clicked) {
            if (this.x < CirFloMouse.x)
                this.dx = -10;
            else
                this.dx = 10;
            if (this.y < CirFloMouse.y)
                this.dy = -10;
            else
                this.dy = 10;
            clicked = false;
        }
    }

}

var circleArray = [];
var CirFLoaArraySize = 100;

function cirFloInit() {
    circleArray = [];
    for (var i = 0; i < CirFLoaArraySize; i++) {

        var radius = Math.random() * 5 + 2;
        var x = Math.random() * (CirFlotCanvas.width - radius * 2) + radius;
        var y = Math.random() * (CirFlotCanvas.height - radius * 2) + radius;
        var dx = (Math.random() - 0.5) * 2;
        var dy = (Math.random() - 0.5) * 2;

        circleArray.push(new Circle(x, y, dx, dy, radius));
    }

}

//Animating the Circle

function cirFloAnimate() {
    requestAnimationFrame(cirFloAnimate);
    CirFloContext.fillStyle = 'rgba(255,255,255,.1)';
    CirFloContext.fillRect(0, 0, CirclesFloatingParent.offsetWidth, CirclesFloatingParent.offsetHeight);


    for (var i = 0; i < circleArray.length; i++) {
        circleArray[i].update();
    }

}
cirFloInit();
cirFloAnimate();