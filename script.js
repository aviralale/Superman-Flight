
//board
let board; 
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

//superman
let supermanWidth = 51; //width/height ratio = 408/228 = 17/12
let supermanHeight = 36;
let supermanX = boardWidth/8;
let supermanY = boardHeight/2;
let supermanImg;

let superman = {
    x : supermanX,
    y : supermanY,
    width : supermanWidth,
    height : supermanHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = boardHeight/1.6;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //superman jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

function velocityIncrement() {
    
    if (score >= 10) {
        velocityX = -2.4 + Math.floor(score / 10) * -0.4;
      }
}

velocityIncrement();

gameOverSound = new Audio('gameover.mp3');

jumpSound = new Audio('jump.mp3');





window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
    
    
    //draw flappy superman
    // context.fillStyle = "green";
    // context.fillRect(superman.x, superman.y, superman.width, superman.height);
    
    //load images
    supermanImg = new Image();
    supermanImg.style.maskImage = "url(./harrypott.png)";
    supermanImg.style.maskSize = "cover";
    supermanImg.src = "./harrypott.png";
    supermanImg.onload = function() {
        context.drawImage(supermanImg, superman.x, superman.y, superman.width, superman.height);
    }
    
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe2.png";
    
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe2.png";
    
    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", movesuperman);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);
    
    //superman
    velocityY += gravity;
    // superman.y += velocityY;
    superman.y = Math.max(superman.y + velocityY, 0); //apply gravity to current superman.y, limit the superman.y to top of the canvas
    context.drawImage(supermanImg, superman.x, superman.y, superman.width, superman.height);
    
    if (superman.y > board.height) {
        gameOver = true;
    }
    
    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        
        if (!pipe.passed && superman.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            jumpSound.volume = 0;
            jumpSound.play();  
            pipe.passed = true;
            velocityIncrement();
        }
        
        if (detectCollision(superman, pipe)) {
            gameOver = true;
        }
    }
    
    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }
    
    //score
    context.fillStyle = "white";
    context.stroke = "black";
    context.font="45px MineCrafter";
    context.fillText(score, 15, 45);
    
    if (gameOver) {
        // gameOverSound.play();
        // Draw the image onto the canvas
        let  text = "Your score is " + score;
        let  textWidth = context.measureText(text).width;
        
        let  centerX = boardWidth / 2;
        let  centerY = boardHeight / 2;
        
        let  textX = centerX - (textWidth / 2);
        let  textY = centerY;
        
        context.textAlign = "center";
        context.fillStyle = "red";
        context.strokeStyle = "black";
        context.lineWidth = "2";
        context.fillText("GAME OVER", textX,textY-50);
        context.fillText(text, textX, textY)
        ;
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }
    
    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function movesuperman(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

    }else if (e.type === "click") {
                //jump
                velocityY = -6;

    }
            //reset game
            if (gameOver) {
                superman.y = supermanY;
                pipeArray = [];
                score = 0;
                gameOver = false;
            }
}

window.addEventListener("click", movesuperman);

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

let isMuted = false;

function toggleMute() {
  if (isMuted) {
    // Unmute the sounds
    gameOverSound.muted = false;
    jumpSound.muted = false;
    isMuted = false;
  } else {
    // Mute the sounds
    gameOverSound.muted = true;
    jumpSound.muted = true;
    isMuted = true;
  }
}

let muteButton = document.getElementById("soundToggle");
muteButton.addEventListener("click", toggleMute);