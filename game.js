const mapLimits = require('./conf.json')
const { Room } = require('colyseus')
const Player = require('./player')
const randomColor = require('random-color')

const mapX = mapLimits.width
const mapY = mapLimits.height

class GameRoom extends Room {
  onCreate () {
    console.log('Room ' + this.roomId + ' has been created.')

    this.setState({
      players: { _green_: new Player(1, 0, 'gold4', true, 'zombie') }
    })

    this.onMessage('move', (client, direction) => {
      const players = this.state.players
      const player = players[client.sessionId]

      switch (direction) {
        case 'up':

          if (player.y + 1 < mapY) {
            const playerCollidedId = isCollide(player.x, player.y + 1, players)
            if (playerCollidedId) {
              players[playerCollidedId].tagPlayer(player)
            } else {
              player.y += 1
            }
          }
          break

        case 'down':

          if (player.y - 1 >= 0) {
            const playerCollidedId = isCollide(player.x, player.y - 1, players)
            if (playerCollidedId) {
              players[playerCollidedId].tagPlayer(player)
            } else {
              player.y -= 1
            }
          }
          break

        case 'left':

          if (player.x - 1 >= 0) {
            const playerCollidedId = isCollide(player.x - 1, player.y, players)
            if (playerCollidedId) {
              players[playerCollidedId].tagPlayer(player)
            } else {
              player.x -= 1
            }
          }
          break

        case 'right':

          if (player.x + 1 < mapX) {
            const playerCollidedId = isCollide(player.x + 1, player.y, players)
            if (playerCollidedId) {
              players[playerCollidedId].tagPlayer(player)
            } else {
              player.x += 1
            }
          }
          break
      }
    })
  }

  onJoin (client, options) {
    console.log('client ', client.sessionId, ' joined')

    const playerName = options?.name
    if (!playerName || !validatePlayerName(playerName)) {
      return client.leave()
    }

    const spawnX = randomSpawn(mapX)
    const spawnY = randomSpawn(mapY)

    const playerColorStr = randomColor().hexString().replace('#', '0x')
    const playerColorNum = Number.parseInt(playerColorStr)
    const player = new Player(spawnX, spawnY, playerColorNum, false, playerName)

    this.state.players[client.sessionId] = player
  }

  onLeave (client) {
    delete this.state.players[client.sessionId]

    console.log('client ', client.sessionId, ' left')
  }

  onDispose () {
    console.log('Room ' + this.roomId + ' has been disposed of.')
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

function validatePlayerName (name) {
  if (typeof name !== 'string') return false
  return /^[0-9A-Za-z ]{1,15}$/.test(name) && name.replace(/\s/g, '') !== ''
}
