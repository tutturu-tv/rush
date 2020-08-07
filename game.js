const mapLimits = require('./conf.json')
const { findFreeCell, isCellOccupied, inRange } = require('./util')
const { Room } = require('colyseus')
const randomColor = require('random-color')
const Player = require('./player')

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

      const moveMap = {
        up: [0, 1],
        down: [0, -1],
        left: [-1, 0],
        right: [1, 0]
      }

      const moveOffset = moveMap[direction]
      if (!moveOffset) return
      const newX = player.x + moveOffset[0]
      const newY = player.y + moveOffset[1]
      if (!inRange(newX, 0, mapX - 1) || !inRange(newY, 0, mapY - 1)) return

      const collidedPlayer = isCellOccupied(newX, newY, players)
      if (collidedPlayer) return collidedPlayer.tagPlayer(player)

      player.x = newX
      player.y = newY
    })
  }

  onJoin (client, options) {
    console.log('client ', client.sessionId, ' joined')

    const playerName = options?.name
    if (!playerName || !Player.validateName(playerName)) {
      console.log('client ' + client.sessionId + ' hasn\'t provided a valid name')
      return client.leave()
    }

    const players = this.state.players
    const spawnCoords = findFreeCell(players)

    const playerColorStr = randomColor().hexString().replace('#', '0x')
    const playerColorNum = Number.parseInt(playerColorStr)
    const player = new Player(spawnCoords[0], spawnCoords[1], playerColorNum, false, playerName)

    players[client.sessionId] = player
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
