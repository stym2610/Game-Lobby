var cnvsht = window.innerHeight/1.2;
var cnvswd = window.innerWidth/3.5;

if(window.innerWidth < 700 || window.innerHeight < 700){
    var cnvsht = window.innerHeight;
    var cnvswd = window.innerWidth;
}

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    cnvsht = window.innerHeight;
    cnvswd = window.innerWidth;
}

var g = document.getElementById("game");
g.setAttribute("width" , cnvswd);
g.setAttribute("height" , cnvsht);
cntx = g.getContext("2d");
var themes = ["day" , "night"]; 
var theme = themes[Math.floor(Math.random() * themes.length)];
var paused = true;
var spriteSheet = new Image();
spriteSheet.src = "../dist/Images/flappy/Flappy.png"; 
var addObstacleEvent = new CustomEvent('addObstacle');
var gameOver = false;
var blackbody = false;
var score = 0;
var playButton = {
    posX: cnvswd/2.6,
    posY: cnvsht/2.3,
    width: cnvswd/4,
    height: cnvsht/8
};
document.title = "Flappy";

function bird(initialX , initialY , dimension){
    this.velY = 0;
    this.posX = initialX;
    this.posY = initialY;
    this.dimension = dimension;
    this.colors = [ "yellow" , "red"]; 
    this.color =  this.colors[Math.floor(Math.random() * this.colors.length)];
    this.motionGuide = {
           "yellow" : [{ x : 3 , y : 491 , width : 17 , height : 12},
                        { x : 31 , y : 491 , width : 17 , height : 12},
                        { x : 59 , y : 491 , width : 17 , height : 12}],
           "red" : [
                      { x : 115 , y : 381 , width : 17 , height : 12},
                      { x : 115 , y : 407 , width : 17 , height : 12},
                      { x : 115 , y : 433 , width : 17 , height : 12}
                    ]
    };
    this.i = 0;
    this.move = function(){
        if (paused) return;
        this.posY = this.posY + this.velY;
        if ( this.velY !== 3) this.velY++;
        if (Math.ceil(this.posY + this.dimension) > Math.ceil(0.8 * cnvsht) ) gameOver = true;
    }
    this.up = function(){
        this.velY = -10;
    }
    this.render = function(){
        this.move();
        let n = 8;
        let motionArray= this.motionGuide[this.color];
        let cons = motionArray.length * n;
        this.i = (this.i + 1) % cons;
        let m = motionArray[Math.floor(this.i / n)];
        if (blackbody){
            cntx.fillStyle = "black";
            cntx.fillRect(this.posX , this.posY , dimension , dimension);
        }
        cntx.drawImage(spriteSheet , m.x , m.y , m.width , m.height, this.posX , this.posY , dimension , dimension);
    }
}

function obstacle(width){
    this.posY = cnvsht / 10 + Math.random() * ( 2 * cnvsht / 5);
    this.posX = cnvswd;
    this.opening = cnvsht/5;
    this.motionGuide = {
        "down" : { x : 55, y : 323 , width : 28 , height : 160},
        "up" :  { x : 83, y : 323 , width : 28 , height : 160}
    };
    this.dimension = width;
    this.move = function(){
        this.posX = this.posX - 1;
        if (Math.ceil(this.posX) === Math.ceil(cnvswd/2)){
            document.dispatchEvent(addObstacleEvent);
        }
        if (Math.ceil(this.posX + this.dimension) === Math.ceil(b.posX)){
            score++;
        }
    }
    this.ht = (3 * cnvsht)/5;
    this.render = function(){
        let u = this.motionGuide["up"];
        let d = this.motionGuide["down"];
        this.move();
        if (blackbody){
            cntx.fillStyle="black";
            cntx.fillRect(this.posX , this.posY - this.ht , this.dimension , this.ht);
            cntx.fillRect(this.posX , this.posY + this.opening , this.dimension , this.ht);
        }
        cntx.drawImage(spriteSheet , d.x , d.y , d.width , d.height, this.posX , this.posY - this.ht , this.dimension , this.ht);
        cntx.drawImage(spriteSheet , u.x , u.y , u.width , u.height, this.posX , this.posY + this.opening , this.dimension , this.ht);
        
    }
}
function collision_detection (obs , b){  
        var collision = false;
        var corners = [];
        corners.push({ x :  b.posX , y : b.posY});
        corners.push({ x :  b.posX + b.dimension , y : b.posY});
        corners.push({ x :  b.posX , y : b.posY + b.dimension});
        corners.push({ x :  b.posX + b.dimension , y : b.posY + b.dimension});
        corners.forEach(c => {
            let cnr_x = c.x;
            let cnr_y =  c.y;
            if (cnr_x >= obs.posX && cnr_x <= (obs.posX + obs.dimension)
                && !(cnr_y > obs.posY && cnr_y < obs.posY + obs.opening)) 
                collision  = true;
        });
        return collision;
}


var obstacles =[];
obstacles.push(new obstacle(cnvswd/10));
var b = new bird(cnvswd/5, cnvsht/2 , cnvsht/15);

document.addEventListener('addObstacle', function (elem) {
    obstacles.push(new obstacle(cnvswd/10));
    if (obstacles.length > 3){
        obstacles.splice(0 , 1);
    }
}, false); 
function writeGameOverMessage(){
    cntx.drawImage(spriteSheet , 390 , 58 , 100 , 30 , cnvswd/4 , cnvsht/3 , cnvswd/2 , cnvsht/8);
}
function showPlayAgainButton(){
    cntx.drawImage(spriteSheet, 354 , 118 , 52 , 29 , cnvswd/2.6 , cnvsht/2.3 , cnvswd/4 , cnvsht/8)
}
function writePausedMessage(){
    cntx.fillStyle = "white";
    cntx.font = "bold 80px Neue Swift";
    cntx.fillText("Paused",cnvswd/4 , cnvsht/2.5);
    cntx.font = "bold 20px Arial";
    cntx.fillText("Press Space Bar to resume", cnvswd/4 , cnvsht/2.5 + 80);
}

function writeScore(){
    cntx.fillStyle = "orange";
    cntx.font = "bold 50px Impact";
    cntx.fillText(score.toString(), cnvswd/2 , cnvsht/4);
}

function renderBackGround(){
    var bgs = {
                "day" : { x : 0 , y : 0 , width : 128, height : 256},
                "night" : { x : 150 , y : 0 , width : 128, height : 256}
            };
    var bg = bgs[theme];
    cntx.drawImage(spriteSheet , bg.x , bg.y , bg.width , bg.height, 0, 0 , cnvswd , cnvsht);
}
var renderRamp = (function(){
    var rampX = 0;
    return function (){
        var r = { x : 300 , y : 0 , width : 150 , height : 50};
        cntx.drawImage(spriteSheet , r.x , r.y , r.width , r.height, rampX, cnvsht/1.25 , cnvswd, cnvsht/5);
        cntx.drawImage(spriteSheet , r.x , r.y , r.width , r.height, rampX + r.width-4, cnvsht/1.25 , cnvswd, cnvsht/5);
        rampX = (rampX % 150 ) - 1;
    }
})();
function draw(){
    renderBackGround();
    obstacles.forEach(o => {
        o.render();
       if ( collision_detection(o,b) ){
           gameOver = true;
        }
    });
    if (b && !gameOver) { b.render(); }
    renderRamp();
    writeScore();
    if (gameOver){
        writeGameOverMessage();
        showPlayAgainButton();
        return;
    }
    if (!gameOver){
        window.requestAnimationFrame(draw);
    }
}

var keyHandlers  = {
    "Space" : function() { if (paused) paused = false; b.up();} 
} 

function bindEvents(){
    document.onclick = function(){
        if (paused) paused = false;
        b.up();
    }
    document.onkeydown = function (e){
    //   if ((paused || disableMotion) && e.code !== "Space") return;
       if (e.altKey == false && e.ctrlKey == false)
       {
           var f =  keyHandlers[e.code];
           if (typeof f === "function") f();
       }
    }
}

g.addEventListener("click", (e)=>{
    var x = e.layerX, y = e.layerY;
    if((playButton.posX <= x && x <= (playButton.posX+playButton.width)) &&
        (playButton.posY <= y && y <= (playButton.posY+playButton.height)) && gameOver){
            playAgain();
        }
});

function playAgain(){
    window.location.reload();
}

window.onload =  function(){
    bindEvents();
    draw();
}
