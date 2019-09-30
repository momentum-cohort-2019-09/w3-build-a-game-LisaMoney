const colors = {
  sky: "blue";
  ground: "brown";
  person: "red";
  obstacle: "black";
  cloud: "white"
}

class Game {
  constructor (canvasId) {
    const canvas = document.getElementById(canvasId)
    this.screen = canvas.getContext('2d')
    this.size = {width: canvas.width, height: canvas.height}
    this.groundY = Math.floor(this.size.height * 0.8)
    this.runningSpeed = 4
    this.bodies = []
    this.ticksSinceObstacle = 0
    this.keyboard = new Keyboarder()
    this.gameOver = false

    let playerSize = {
      width: 20,
      height: 30
    }

    let playerLocation = {
      x: Math.floor(this.size.width * 0.2),
      y: this.groundY - (playerSize.height / 2) - 2
    }

    this.player = new Player(playerLocation, playerSize)
    this.addBody(this.player)
  }

  addBody (body) {
    this.bodies.push(body)
  }

  run () {
    const tick = () => {
      this.update()
      this.draw()

      if (!this.gameOver) {
        window.requestAnimationFrame(tick)
      }
    }
    
    tick()
  }

  addObstacle () {
    this.addBody(new Obstacle({x: this.size.width, y: this.groundY - 15}, {width: 30, height: 30}))
  }

  addCloud () {
    const cloudCenter = {x: this.size.width, y: Math.floor(Math.random() * this.size.height / 2 ) }
    const cloudSize = {width: Math.random() * 100 + 10, height: Math.random() * 50 + 10 }
    this.addBody(new Cloud(cloudCenter, cloudSize))
  }

  update () {
    const obstacleOccurPercentage = this.ticksSinceObstacle * 0.0001

    if (Math.random() < obstacleOccurPercentage) {
      this.addObstacle()
      this.ticksSinceObstacle = 0
    } else {
      this.ticksSinceObstacle++
    }

    if (Math.random() < 0.01) {
      this.addCloud()
    }

    for (let body of this.bodies) {
      body.update(this)
      if (colliding(this.player, body)) {
        this.gameOver = true
      }
    }

    this.bodies = this.bodies.filer(bodyOnScreen)
  }

  draw () {
    let skyHeight = Math.floor(this.size.height * 0.8)
    let groundHeight = this.size.height - skyHeight 
    this.screen.fillStyle = colors.sky 
    this.screen.fillRect(0, 0, this.size.width, skyHeight)

    this.screen.fillStyle = colors.ground
    this.screen.fillRect(0, skyHeight, this.size.width, groundHeight)

    for (let body of this.bodies) {
      body.draw(this.screen)
    }
  }
}

class Player {
  constructor (center, size) {
    this.center = center
    this.size = size 
    this.startingY = center.y
    this.velocityY = 0
    this.jumping = false
  }

  update (game) {
    this.center.y -= this.velocityY

    if (this.jumping) {
      this.velocityY -= 1
      if (this.center.y >= this.startingY) {
        this.center.y = this.startingY
        this.velociyY = 0
        this.jumping = false
      }
    }

    if (game.keyboard.isDown(Keyboarder.KEYS.SPACE) && !this.jumping) {
      this.jumping = true 
      this.velocityY = 15
    }
  }

  draw (screen) {
    screen.fillStyle = colors.person
    screen.fillRect(
      this.center.x - (this.size.width / 2),
      this.center.y - (this.size.height / 2),
      this.size.width, this.size.height)
  }
}

class Obstacle {
  constructor (center, size) {
    this.center = center
    this.size = size
  }

  update (game) {
    this.center.x -= game.runningSpeed
  }

  draw (screen) {
    screen.fillStyle = colors.obstacle
    screen.fillRect(
      this.center.x - (this.size.width / 2),
      this.center.y - (this.size.height / 2),
      this.size.width, this.size.height)
  }
}

class Cloud {
  constructor (center, size) {
    this.center = center
    this.size = size
    this.safe = true
  }

  update (game) {
    this.center.x -= game.runningSpeed / 2
  }

  draw (screen) {
    screen.fillStyle = colors.cloud
    screen.fillRect( 
      this.center.x - (this.size.width / 2)
      this.center.y - (this.size.height / 2),
      this.size.width, this.size.height)
  }
}

class Keyboarder {
  constructor () {
    this.keyState = {}

    window.addEventListener('keydown', function (e) {
      this.keyState[e.keyCode] = true
    }.bind(this))

    window.addEventListener('keyup', function (e) {
      this.keyState[e.keyCode] = false
    }.bind(this))
  }

  isDown (keyCode) {
    return this.keyState[keyCode] === true
  }

  on (keyCode, callback) {
    window.addEventListener('keydown', function(e) {
      if (e.keyCode === keyCode) {
        callback ()
      }
    })
  }
}

function bodyOnScreen (body) {
  return body.center.x > 0 - body.size.width
}

function colliding (b1, b2) {
  return !(
    b1.safe ||
    b2.safe ||
    b1 === b2 ||
      b1.cener.x + b1.size.width / 2 < b2.center.x - b2.size.width / 2 ||
      b1.center.y + b1.size.height / 2 < b2.center.y - b2.size.height / 2 ||
      b1.center.x - b1.size.width / 2 > b2.center.x + b2.size.width / 2 ||
      b1.center.y - b1.size.height / 2 > b2.center.y + b2.size.height / 2
  )
}

Keyboarder.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, S: 83, SPACE: 32 }

const game = new Game('game-canvas')
game.run()
