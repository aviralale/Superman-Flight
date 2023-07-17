// board
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

// superman
let supermanWidth = 60; // width/height ratio = 408/228 = 17/12
let supermanHeight = 30;
let supermanX = boardWidth / 8;
let supermanY = boardHeight / 2;
let supermanImg;

let superman = {
  x: supermanX,
  y: supermanY,
  width: supermanWidth,
  height: supermanHeight,
};

// pipes
let pipeArray = [];
let pipeWidth = 60; // width/height ratio = 384/3072 = 1/8
let pipeHeight = boardHeight / 1.6;
let pipeX = boardWidth;
let pipeY = 0;
let pipeHorizontalGap = 20; // Adjust the horizontal gap between pipes as needed

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // superman jump speed
let gravity = 0.4;
let pipeVelocityX = -2;
let gameOver = false;
let score = 0;
let audioBGM = new Audio("./gamebgm.mp3");
audioBGM.volume = 0.2;

// Game Over Form
let gameoverContainer;
let gameoverForm;
let scoreInput;

function velocityIncrement() {
  if (score >= 10) {
    velocityX = -2.4 + Math.floor(score / 10) * -0.4;
  }
};
velocityIncrement();

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  // Load images
  supermanImg = new Image();
  supermanImg.src = "./super-arcade-pixels.png";
  supermanImg.onload = function () {
    context.drawImage(supermanImg, superman.x, superman.y, superman.width, superman.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "./toppipe2.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe2.png";

  // Prompt to start the game
  board.addEventListener("click", startGame);
  showPrompt();
};

function startGame() {
  // Remove the event listener and start the game
  board.removeEventListener("click", startGame);
  // Initialize the game
  superman.y = supermanY;
  pipeArray = [];
  score = 0;
  gameOver = false;
  audioBGM.addEventListener("ended", function () {
    audioBGM.currentTime = 0;
    audioBGM.play();
  });

  audioBGM.play();
  // Start the game loop
  requestAnimationFrame(update);
  setInterval(placePipes, 1500); // every 1.5 seconds

  // Add event listener for keydown to control the game
  document.addEventListener("keydown", movesuperman);
}

function showPrompt() {
  context.fillStyle = "white";
  context.font = "1rem Minecrafter";
  context.textAlign = "center";
  context.fillText("Click anywhere to start the game", boardWidth / 2, boardHeight / 2);
}

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    displayGameOverForm();
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  // Superman
  velocityY += gravity;
  superman.y = Math.max(superman.y + velocityY, 0);
  context.drawImage(supermanImg, superman.x, superman.y, superman.width, superman.height);

  if (superman.y > board.height) {
    gameOver = true;
  }

  // Pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += pipeVelocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && superman.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
    }

    if (detectCollision(superman, pipe)) {
      gameOver = true;
    }
  }

  // Clear pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  // Score
  context.fillStyle = "white";
  context.font = "45px MineCrafter";
  context.fillText(score, 45, 60);

  // Update velocity
  velocityIncrement();
}

function placePipes() {
  if (gameOver) {
    return;
  }

  
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);

  }
  pipeX += pipeWidth + pipeHorizontalGap; // Adjust the pipeX value for the next set of pipes


function movesuperman(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    velocityY = -6;
  }

  if (gameOver) {
    superman.y = supermanY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    document.addEventListener("keydown", startGame);
    restartGame();
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && // a's top right corner passes b's top left corner
    a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y // a's bottom left corner passes b's top left corner
  );
}

function restartGame() {
  location.reload();
}

function displayGameOverForm() {
  // Disable game controls
  document.removeEventListener("keydown", movesuperman);

  // Create the form container
  let gameoverContainer = document.getElementById("gameover-container");
  if (!gameoverContainer) {
    gameoverContainer = document.createElement("div");
    gameoverContainer.id = "gameover-container";
    gameoverContainer.style.position = "absolute";
    gameoverContainer.style.display = 'flex';
    gameoverContainer.style.justifyContent = "center";
    gameoverContainer.style.alignItems = "center";
    gameoverContainer.style.top = "0";
    gameoverContainer.style.left = "0";
    gameoverContainer.style.width = "100vw";
    gameoverContainer.style.height = "100vh";
    gameoverContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    document.body.appendChild(gameoverContainer);
  }

  // Create the form elements
  let gameoverForm = document.getElementById("gameover-form");
  if (!gameoverForm) {
    gameoverForm = document.createElement("form");
    gameoverForm.id = "gameover-form";
    gameoverForm.style.display = "flex";
    gameoverForm.style.flexDirection = "column";
    gameoverForm.style.alignItems = "center";
    gameoverForm.style.justifyContent = "center";
    gameoverForm.style.backgroundColor = "transparent";
    gameoverForm.style.padding = "20px";

    let title = document.createElement("h2");
    title.textContent = "Game Over";

    let nameLabel = document.createElement("label");
    nameLabel.textContent = "Enter your name: ";
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "name";
    nameInput.required = true;

    let scoreLabel = document.createElement("label");
    scoreLabel.textContent = "Score: ";
    scoreInput = document.createElement("input");
    scoreInput.type = "text";
    scoreInput.name = "score";
    scoreInput.value = score;
    scoreInput.readOnly = true;

    let submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Submit";

    let skipButton = document.createElement("button");
    skipButton.type = "button";
    skipButton.textContent = "Skip";

    let highScoresButton = document.createElement("button");
    highScoresButton.type = "button";
    highScoresButton.textContent = "View High Scores";

    let mainMenuButton = document.createElement("button");
    mainMenuButton.type = "button";
    mainMenuButton.textContent = "Back to Main Menu";

    // Append form elements
    gameoverForm.appendChild(title);
    gameoverForm.appendChild(nameLabel);
    gameoverForm.appendChild(nameInput);
    gameoverForm.appendChild(scoreLabel);
    gameoverForm.appendChild(scoreInput);
    gameoverForm.appendChild(submitButton);
    gameoverForm.appendChild(skipButton);
    gameoverForm.appendChild(highScoresButton);
    gameoverForm.appendChild(mainMenuButton);

    gameoverContainer.appendChild(gameoverForm);

    // Add event listeners to the form and buttons
    gameoverForm.addEventListener("submit", submitForm);
    skipButton.addEventListener("click", skipToGame);
    highScoresButton.addEventListener("click", viewHighScores);
    mainMenuButton.addEventListener("click", backToMainMenu);
  }
}

function submitForm(e) {
  e.preventDefault();

  const playerName = e.target.elements.name.value;
  const playerScore = e.target.elements.score.value;

  // Retrieve existing high scores from localStorage
  const highScoresString = localStorage.getItem("highScores");
  let highScores = [];

  if (highScoresString) {
    highScores = JSON.parse(highScoresString);
  }

  // Add the current player's score to the high scores array
  highScores.push({ name: playerName, score: playerScore });

  // Sort high scores by score in descending order
  highScores.sort((a, b) => b.score - a.score);

  // Store the updated high scores array in localStorage
  localStorage.setItem("highScores", JSON.stringify(highScores));

  // Redirect to the high scores page
  window.location.href = "game.html";
}



function skipToGame() {
  // Redirect to the game page
  window.location.href = "game.html";
}

function viewHighScores() {
  // Redirect to the high scores page
  window.location.href = "highscores.html";
}
function backToMainMenu() {
  // Redirect to the high scores page
  window.location.href = "index.html";
}
