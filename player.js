class Player {
  constructor (x, y, color, tag, name) {
    Object.assign(this, { x, y, color, tag, name })
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
