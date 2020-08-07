const mapLimits = require('./conf.json')

const mapX = mapLimits.width
const mapY = mapLimits.height

class Util {
  static findFreeCell (players) {
    let spawnX, spawnY
    do {
      spawnX = Util.randomNumber(mapX)
      spawnY = Util.randomNumber(mapY)
    } while (Util.isCellOccupied(spawnX, spawnY, players) !== false)
    return [spawnX, spawnY]
  }

  static isCellOccupied (x, y, playerlist) { // Returns a player in cell [x, y] or undefined if it is empty
    const player = Object.values(playerlist).find(p => p.x === x && p.y === y)
    return player || false
  }

  static inRange (n, _min, _max) { // Whether n is in the range [_min; _max]
    const min = Math.min(_min, _max)
    const max = Math.max(_min, _max)
    return min <= n && n <= max
  }

  static randomNumber (upperbound) { // Returns a random number in the range [0; upperbound)
    return Math.floor(Math.random() * upperbound)
  }
}

module.exports = Util
