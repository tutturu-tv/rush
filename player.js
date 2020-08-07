class Player {
  constructor (x, y, color, tag, name) {
    Object.assign(this, { x, y, color, tag, name })
  }

  tagPlayer (predator) {
    if (predator.tag) this.tag = true
    else if (this.tag) predator.tag = true
  }

  static validateName (name) {
    if (typeof name !== 'string') return false
    return /^[0-9A-Za-z ]{1,15}$/.test(name) && name.replace(/\s/g, '') !== ''
  }
}

module.exports = Player
