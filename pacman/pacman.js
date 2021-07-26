var cnvsht = 3*(window.innerHeight / 5);
var cnvswd = window.innerWidth/2;
var boxSide = 22;
var vel = 4;
var obtclSize = 25;
var obstacleVel = 1.5;
var foodSide = 16;
var score = 0;
var paused = false;
var gameOver = false;
var fps = 60;
var damage = 0;
var numberOfLifes = 4;
var  b , obstacles = [] , f;
var disableMotion = false;
function empty(){
    obstacles = [];
    b = undefined;
    f = undefined;
}

var g = document.getElementById("game");
g.setAttribute("width" , cnvswd);
g.setAttribute("height" , cnvsht);
cntx = g.getContext("2d");
var rl = document.getElementById("remainingLife");
var scoreEL = document.getElementById("score");
var highestEL = document.getElementById("highest");
document.title = "PacMan";

var secureStorage = {
    setItem: function(key , value){
     localStorage.setItem(CryptoJS.MD5(key).toString() , CryptoJS.AES.encrypt(value.toString() , "key").toString());
    },
    getItem: function(key){
     let item = localStorage.getItem(CryptoJS.MD5(key).toString());
     return item != null ? CryptoJS.AES.decrypt(item , "key").toString(CryptoJS.enc.Utf8) : null;        
    }
};


var spriteSheet = new Image();
spriteSheet.src = "../dist/Images/pacman/googlespritesheet2.png";


function setHighestScore(value){
    //secureStorage.setItem('highestScore', data);
    secureStorage.setItem("highestScore", value);
}
function getHighestScore(){
    var item = secureStorage.getItem("highestScore");
    if (item == null) return 0;
    else return item;
}

highestEL.innerHTML = getHighestScore();

var keyHandlers  = {
    "ArrowRight" : function() { if (b) {b.moveRight(); }}, 
    "ArrowLeft" : function() { if (b) { b.moveLeft(); }} ,
    "ArrowUp" : function() { if (b) { b.moveUp();} } , 
    "ArrowDown" : function() { if(b) {b.moveDown(); } },
    "Space" : function() {
        paused = !paused;
        if(!paused) draw();
    } 
} 

function instantiate(){
    obstacles.push ( new obstacle(obtclSize ,obstacleVel, cnvswd ,  cnvsht));
    b = new box(cnvswd/2 , cnvsht/2 , boxSide , 0 , 0 , cnvswd ,  cnvsht);
    f = new food( cnvswd ,  cnvsht , foodSide);
    setScore(0);
}

instantiate();


function food(lmtX , lmtY , dimension){
    this.animation = [{x : 183 , y : 177 } , {x : 183 , y :197 } , {x : 183 , y : 217 }, {x : 183 , y : 237}];
    this.image = this.animation[Math.ceil(Math.random() *  (this.animation.length - 1))];
    this.dimension =  dimension;
    this.posY =  Math.ceil(Math.random() * (lmtY - 2*dimension ));
    this.posX =  Math.ceil(Math.random() * (lmtX - 2*dimension));
    this.render = function (cntx) {
        cntx.drawImage(spriteSheet, this.image.x , this.image.y , 13 , 12 , this.posX , this.posY , this.dimension , this.dimension);   
    }
}

function box(posX , posY , dimension , velX , velY, lmtX , lmtY){
    this.posX = posX;
    this.posY =  posY;
    this.dimension =  dimension; 
    this.velX = velX;
    this.velY = velY;
    this.lmtX = lmtX;
    this.lmtY = lmtY;
    this.reset = function(){
        this.posY = lmtY/2;
        this.posX = lmtX/2;
        reduceLife();
        this.motionDirection = "Up";
        disableMotion = false;    
    }
    this.kill= function(){
        this.i = -1;
        this.motionDirection = "Dead";
        this.velX = 0;
        this.velY= 0;
        disableMotion = true;
    }
    this.motionDirection = "Up";
    this.onCollision = this.kill;
    this.i =0;
    this.motionGuide = {
        "Up" : [{ x: 14 , y : 55 } ,{ x: 34 , y : 55 } ,{ x: 54 , y : 15 }  ] ,
        "Left" : [{ x: 14 , y : 15 } ,{ x: 34 , y : 15 } ,{ x: 54 , y : 15 }  ] ,
        "Right" : [{ x: 14 , y : 35 } ,{ x: 34 , y : 35 } ,{ x: 54 , y : 15 }  ] ,
        "Down" :[{ x: 14 , y : 75 } ,{ x: 34 , y : 75 } ,{ x: 54 , y : 15 }  ] ,
        "Dead" : [ {x : 14 , y : 255} , {x : 34 , y : 255} ,{x : 54 , y : 255} ,{x : 74 , y : 255},{x : 94 , y : 255} , {x : 114 , y : 255} ,{x : 134 , y : 255} ,{x : 154 , y : 255},{x : 174 , y : 255} , {x : 194 , y : 255} ,{x : 214 , y : 255}, {x : -1 , y : -1}]
    };
    this.moveRight =  function (){
        this.velX = vel ; this.velY = 0; 
        this.motionDirection = "Right";
    }
    this.moveLeft =  function (){
        this.velX = -(vel) ; this.velY = 0; 
        this.motionDirection = "Left";
    }
    this.moveUp =  function (){
        this.velX = 0; this.velY = -(vel);
        this.motionDirection = "Up";
    }
    this.moveDown =  function (){
        this.velX = 0 ; this.velY = vel;
        this.motionDirection = "Down";
    }
    this.move = function(){
        if (paused) return;
        if ( ( this.posX >  (this.lmtX - (dimension)) 
        || this.posY >  (this.lmtY - (dimension)) 
        || this.posX < 0
        || this.posY < 0
         ) && ( this.velX !== 0 || this.velY !== 0)){
            this.onCollision();
        }
        this.posX = this.posX + this.velX;
        this.posY = this.posY + this.velY;
    }

    this.render = function (cntx) {
        this.move();
        let motionArray = this.motionGuide[this.motionDirection];
        let cons = motionArray.length * 5;
        this.i = (this.i + 1) % cons;
        let m = motionArray[Math.floor(this.i / 5)];
        if (m.x === -1 && m.y === -1){
            this.reset();
        }
        cntx.drawImage(spriteSheet , m.x , m.y , 13 , 14 , this.posX , this.posY, this.dimension , this.dimension);   
    }
}

function obstacle(dimension , vel , lmtX , lmtY){
    var posY = lmtY/5 +  Math.ceil(Math.random() * ( (4 * (lmtY /5)) - dimension));
    var posX = lmtX/5 +  Math.ceil(Math.random() * ( (4 * (lmtX /5)) - dimension));  
    var velX =  Math.random() >= 0.5 ? vel : 0;
    var velY =   Math.random() >= 0.5 ? vel : velX === vel ? 0 : vel;
    this.animation = [{ x : 54 , y : 95 }, { x : 54 , y : 115 } ,{ x : 54, y : 135 }, { x : 54 , y : 155 }];
    this.image = this.animation[Math.ceil(Math.random() *  (this.animation.length - 1))];
    box.call(this , posX , posY , dimension , velX , velY, lmtX , lmtY);
    this.move = function(){
        if (paused) return;

        if (this.posX >  (this.lmtX - (dimension)) 
        || this.posX < 0)  this.velX = -(this.velX);
         if (this.posY >  (this.lmtY - (dimension)) 
        || this.posY < 0
         ){
            this.velY = -(this.velY);
        }
        this.posX = this.posX + this.velX;
        this.posY = this.posY + this.velY;
    }

    this.onCollision = function(){
        this.velX = -(this.velX);
        this.velY = -(this.velY);
    }
    this.render = function (cntx) {
        this.move();
        cntx.fillStyle= this.color ;
        cntx.drawImage(spriteSheet, this.image.x  , this.image.y, 15 , 15 , this.posX , this.posY , this.dimension , this.dimension);   
    }
}


function colision_detection (large , small){

    if (small instanceof box && small.velX === 0 && small.velY === 0) return false;

    let cnr1_x = small.posX;
    let cnr1_y = small.posY;
    
    if (
        cnr1_x >= large.posX 
    && cnr1_x <= (large.posX + large.dimension)
    && cnr1_y >= large.posY 
    && cnr1_y <= (large.posY + large.dimension)
    ) return true;

    let cnr2_x = small.posX + small.dimension;
    let cnr2_y = small.posY;

    if (
        cnr2_x >= large.posX 
    && cnr2_x <= (large.posX + large.dimension)
    && cnr2_y >= large.posY 
    && cnr2_y <= (large.posY + large.dimension)
    ) return true;
    
    let cnr3_x = small.posX;
    let cnr3_y = small.posY + small.dimension;

    if (
        cnr3_x >= large.posX 
    && cnr3_x <= (large.posX + large.dimension)
    && cnr3_y >= large.posY 
    && cnr3_y <= (large.posY + large.dimension)
    ) return true;
    
    let cnr4_x = small.posX + small.dimension;
    let cnr4_y = small.posY + small.dimension;

    if (
        cnr4_x >= large.posX 
    && cnr4_x <= (large.posX + large.dimension)
    && cnr4_y >= large.posY 
    && cnr4_y <= (large.posY + large.dimension)
    ) return true;

    return false;
}

function setScore(value){
    scoreEL.innerText = value;
}

function increaseDifficulty(){
    obstacles.push ( new obstacle(obtclSize ,obstacleVel, cnvswd ,  cnvsht));
}

function setGameOver(){
    if (score > parseInt(getHighestScore())){
        setHighestScore(score);
    }
    gameOver = true;
    empty();
}

function reduceLife(){
    damage = damage +  (100 / numberOfLifes);
    if (damage === 100){
        setGameOver();
    }
    rl.style.width = damage + "%";
}

function writeGameOverMessage(){
    cntx.fillStyle = "white";
    cntx.font = "bold 80px Neue Swift";
    cntx.fillText("Game",  cnvswd/3 , cnvsht/3);
    cntx.fillText("Over",  cnvswd/3 , cnvsht/3 + 80);
    cntx.font = "bold 20px Arial";
    cntx.fillText("Press F5 to play again",  cnvswd/3 , cnvsht/3 + 160);
}

function writePausedMessage(){
    cntx.fillStyle = "white";
    cntx.font = "bold 80px Neue Swift";
    cntx.fillText("Paused",cnvswd/4 , cnvsht/2.5);
    cntx.font = "bold 20px Arial";
    cntx.fillText("Press Space Bar to resume", cnvswd/4 , cnvsht/2.5 + 80);
}

function renderBackGround(){
    cntx.fillStyle = "#5b81b5"; //"#99d9ea"; //"black";
    cntx.fillRect(0, 0, cnvswd , cnvsht);
}

function draw(){
    if (paused){
        writePausedMessage();
        return;
    }
    renderBackGround();
    if (gameOver){
        writeGameOverMessage();
        return;
    }
    if (b) { b.render(cntx); }
    if (f) { f.render(cntx); }
    obstacles.forEach(o => {
        o.render(cntx);
        if ( colision_detection(o,b) ){
            b.kill();
        }
    });
    if( b && f && colision_detection(b,f)){
        f = new food( cnvswd ,  cnvsht , foodSide);
        score++;
        setScore(score);
        if (score && score % 5 == 0 ) {
            increaseDifficulty();
        }
    }
    window.requestAnimationFrame(draw);
}

	
function bindKeyEvents(){
    document.onkeydown = function (e){
      if ((paused || disableMotion) && e.code !== "Space") return;
       if (e.altKey == false && e.ctrlKey == false)
       {
           var f =  keyHandlers[e.code];
           if (typeof f === "function") f();
       }
    }
}

window.onload =  function(){
    bindKeyEvents();
    draw();
}