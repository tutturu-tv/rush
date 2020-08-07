class Util {
  static isCellOccupied (x, y, playerlist) { // Returns a player in cell [x, y] or undefined if it is empty
    return Object.values(playerlist).find(p => p.x === x && p.y === y)
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
