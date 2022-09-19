const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')

// variables

const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 20
const PADDLE_MARGIN_BOTTOM = 50
const BALL_RADIUS = 8
let leftArrow = false
let rightArrow = false
let LIFE = 3
let SCORE = 0
let SCORE_UNIT = 10
let LEVEL = 1
let MAX_LEVEL = 3
let GAME_OVER = false
let BRICK_HIT = new Audio()
let PADDLE_HIT = new Audio()
let LIFE_LOST = new Audio()
let WALL_COLLISION = new Audio()
let WIN_SOUND = new Audio()

const BACKGROUND = new Image()
BACKGROUND.src =
  'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGdhbWV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60'

BRICK_HIT.src = './sounds/sounds_brick_hit.mp3'
PADDLE_HIT.src = './sounds/sounds_paddle_hit.mp3'
LIFE_LOST.src = './sounds/sounds_life_lost.mp3"'
WALL_COLLISION.src = './sounds/sounds_wall_collision.mp3'
WIN_SOUND.src = './sounds/sounds_win_sound.mp3'

// obj
const paddle = {
  x: cvs.width / 2 - PADDLE_WIDTH / 2, // 150
  y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT, //   430
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dx: 5,
}

// draw-paddle

function drawPaddle() {
  ctx.fillStyle = 'pink'
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
  ctx.strokeStyle = 'purple'
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height)
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowLeft') {
    leftArrow = true
  } else if (event.key === 'ArrowRight') {
    rightArrow = true
  }
})

document.addEventListener('keyup', function (event) {
  if (event.key === 'ArrowLeft') {
    leftArrow = false
  } else if (event.key === 'ArrowRight') {
    rightArrow = false
  }
})

// move paddle functio

function movePaddle() {
  if (rightArrow && paddle.x + paddle.width < cvs.width) {
    paddle.x += paddle.dx
  } else if (leftArrow && paddle.x > 0) {
    paddle.x -= paddle.dx
  }
}

// BALL OBJECT

const ball = {
  x: cvs.width / 2,
  y: paddle.y - BALL_RADIUS,
  radius: BALL_RADIUS,
  speed: 4,
  dx: 3 * (Math.random() * 2 - 1),
  dy: -3,
}

// draw ball

function drawBall() {
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
  ctx.fillStyle = 'yellow'
  ctx.fill()
  ctx.strokeStyle = 'orange'
  ctx.stroke()
  ctx.closePath()
}

// draw function
function draw() {
  drawPaddle()
  drawBall()
  drawBricks()
  showGamePoints('Score:' + SCORE, 35, 25)
  showGamePoints('Life:' + LIFE, cvs.width - 85, 25)
  showGamePoints('Level:' + LEVEL, cvs.width / 2 - 40, 25)
}
// moving ball function

function moveBall() {
  ball.x += ball.dx
  ball.y += ball.dy
}

// update function

function update() {
  movePaddle()
  moveBall()
  ballWallCollision()
  ballPaddleCollision()
  ballBrickCollision()
  levelUp()
  gameOver()
}

// control ball
function ballWallCollision() {
  if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx
  }
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy
  }
  if (ball.y + ball.radius > cvs.height) {
    LIFE--
    resetBall()
  }
}

// ball paddle collision function

function ballPaddleCollision() {
  if (
    ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    ball.y < paddle.y + paddle.height &&
    ball.y > paddle.y
  ) {
    let collidPoint = ball.x - (paddle.x + paddle.width / 2)
    collidPoint = collidPoint / (paddle.width / 2)
    let angle = (collidPoint * Math.PI) / 3
    ball.dx = ball.speed * Math.sin(angle)
    ball.dy = -ball.speed * Math.cos(angle)
  }
}

// resetBall function
function resetBall() {
  ball.x = cvs.width / 2
  ball.y = paddle.y - BALL_RADIUS
  ball.dx = 3 * (Math.random() * 2 - 1)
  ball.dy = -3
}

// brick object
const brick = {
  row: 1,
  column: 5,
  width: 55,
  height: 20,
  offSetLeft: 20,
  offSetTop: 20,
  marginTop: 40,
  fillColor: 'purple',
  strokeColor: 'pink',
}
let bricks = []
// createBricks function
function createBricks() {
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = []
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
        y:
          r * (brick.offSetTop + brick.height) +
          brick.offSetTop +
          brick.marginTop,
        status: true,
      }
    }
  }
}

createBricks()

// draw briks function
function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c]
      if (b.status) {
        ctx.fillStyle = brick.fillColor
        ctx.fillRect(b.x, b.y, brick.width, brick.height)

        ctx.strokeStyle = brick.strokeColor
        ctx.strokeRect(b.x, b.y, brick.width, brick.height)
      }
    }
  }
}

// ballBrickCollision function
function ballBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c]
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          ball.dy = -ball.dy
          b.status = false
          SCORE += SCORE_UNIT
          BRICK_HIT.play()
        }
      }
    }
  }
}

// showGamePoints function
function showGamePoints(text, textX, textY) {
  ctx.fillStyle = 'purple'
  ctx.font = '25px Germania One'
  ctx.fillText(text, textX, textY)
}

// game over function
function gameOver() {
  if (LIFE < 0) {
    GAME_OVER = true
    showGamePoints('Game Over', cvs.width / 2 - 40, cvs.height / 2)
    showGamePoints(
      'Refresh to Play Again!',
      cvs.width / 2 - 100,
      cvs.height / 2 + 30,
    )
  }
}

// level up function
function levelUp() {
  let isLevelDone = true

  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      isLevelDone = isLevelDone && !bricks[r][c].status
    }
  }

  if (isLevelDone) {
    if (LEVEL >= MAX_LEVEL) {
      GAME_OVER = true
      WIN_SOUND.play()
      showGamePoints('Win Win !', cvs.width / 2 - 45, cvs.height / 2)
      return
    }
    brick.row++
    createBricks()
    ball.speed += 0.5
    resetBall()
    LEVEL++
  }
}

function loop() {
  ctx.drawImage(BACKGROUND, 0, 0)
  draw()
  update()
  if (!GAME_OVER) {
    requestAnimationFrame(loop)
  }
}
loop()
