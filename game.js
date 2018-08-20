const mapLimits = require('./conf.json')
const { Room } = require('colyseus')
const Player = require('./player')
const randomColor = require('random-color')

const mapX = mapLimits.width
const mapY = mapLimits.height

class GameRoom extends Room {
  onInit () {
    this.setState({
      players: {'retard': new Player(1, 1, 'gold4', true)}
    })
  }

  onJoin (client) {
    console.log('client ', client.sessionId, ' joined')

    const spawnX = randomSpawn(mapX)
    const spawnY = randomSpawn(mapY)

    const playerColorStr = randomColor().hexString().replace('#', '0x')
    const playerColorNum = Number.parseInt(playerColorStr)
    const player = new Player(spawnX, spawnY, playerColorNum, false)

    this.state.players[client.sessionId] = player
  }

  onMessage (client, data) {
    const player = this.state.players[client.sessionId]

    switch (data.direction) {
      case 'up':

        if (player.y + 1 <= mapY) {
          const playerCollidedId = isCollide(player.x, player.y + 1, this.state.players)
          if (playerCollidedId) {
            this.state.players[playerCollidedId].tagPlayer(player)
          } else {
            player.y += 1
          }
        }
        break

      case 'down':

        if (player.y - 1 > 0) {
          const playerCollidedId = isCollide(player.x, player.y - 1, this.state.players)
          if (playerCollidedId) {
            this.state.players[playerCollidedId].tagPlayer(player)
          } else {
            player.y -= 1
          }
        }
        break

      case 'left':

        if (player.x - 1 >= 0) {
          const playerCollidedId = isCollide(player.x - 1, player.y, this.state.players)
          if (playerCollidedId) {
            this.state.players[playerCollidedId].tagPlayer(player)
          } else {
            player.x -= 1
          }
        }
        break

      case 'right':

        if (player.x + 1 < mapX) {
          const playerCollidedId = isCollide(player.x + 1, player.y, this.state.players)
          if (playerCollidedId) {
            this.state.players[playerCollidedId].tagPlayer(player)
          } else {
            player.x += 1
          }
        }
        break
    }
  }

  onLeave (client) {
    delete this.state.players[client.sessionId]

    console.log('client ', client.sessionId, ' left')
  }

  onDispose () {
    console.log('server died lelelelel')
  }
}

module.exports = GameRoom

function isCollide (x, y, playerlist) {
  for (const player in playerlist) {
    if (playerlist[player].x === x && playerlist[player].y === y) {
      return player
    }
  }
}

function randomSpawn (upperbound) {
  return Math.floor(Math.random() * upperbound)
}
