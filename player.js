class Player {
  constructor (x, y, color, tag) {
    this.x = x
    this.y = y
    this.color = color
    this.tag = tag
  }

  tagPlayer (predator) {
    if (predator.tag) {
      this.tag = true
    } else if (!predator.tag && this.tag) {
      predator.tag = true
    }
  }
}

module.exports = Player
