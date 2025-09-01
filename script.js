const gameArea = document.getElementById("game-area");
let currentGame;

// Switch games
function showGame(name) {
  gameArea.innerHTML = "";
  if (name === "snake") startSnake();
  if (name === "blocks") startBlocks();
  if (name === "mole") startMole();
}

/* ========== Snake ========== */
function startSnake() {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  gameArea.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let snake = [{ x: 200, y: 200 }];
  let dx = 20, dy = 0;
  let food = { x: 100, y: 100 };

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -20; }
    if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 20; }
    if (e.key === "ArrowLeft" && dx === 0) { dx = -20; dy = 0; }
    if (e.key === "ArrowRight" && dx === 0) { dx = 20; dy = 0; }
  });

  function loop() {
    ctx.clearRect(0, 0, 400, 400);

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      food = {
        x: Math.floor(Math.random() * 20) * 20,
        y: Math.floor(Math.random() * 20) * 20
      };
    } else {
      snake.pop();
    }

    // Draw snake
    ctx.fillStyle = "lime";
    snake.forEach(p => ctx.fillRect(p.x, p.y, 20, 20));

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, 20, 20);

    // Game over check
    if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 ||
        snake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
      alert("Game Over!");
      return;
    }

    setTimeout(loop, 100);
  }
  loop();
}

/* ========== Falling Blocks (Tetris-like placeholder) ========== */
function startBlocks() {
  gameArea.innerHTML = "<p>Falling Blocks coming soon 🚧</p>";
}

/* ========== Whack-A-Mole ========== */
function startMole() {
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(3, 100px)";
  grid.style.gridGap = "10px";
  gameArea.appendChild(grid);

  let score = 0;
  const scoreDisplay = document.createElement("p");
  scoreDisplay.innerText = "Score: 0";
  gameArea.appendChild(scoreDisplay);

  for (let i = 0; i < 9; i++) {
    const hole = document.createElement("div");
    hole.style.width = "100px";
    hole.style.height = "100px";
    hole.style.background = "#333";
    grid.appendChild(hole);
  }

  function randomMole() {
    [...grid.children].forEach(h => h.innerHTML = "");
    const mole = document.createElement("span");
    mole.innerText = "🐹";
    mole.style.fontSize = "50px";
    mole.style.cursor = "pointer";
    const randomHole = grid.children[Math.floor(Math.random() * 9)];
    randomHole.appendChild(mole);

    mole.onclick = () => {
      score++;
      scoreDisplay.innerText = "Score: " + score;
    };

    setTimeout(randomMole, 800);
  }
  randomMole();
}
