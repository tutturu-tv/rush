'use strict'

import * as PIXI from 'pixi.js'

const SPRITE_HEIGHT = 16
const SPRITE_WIDTH = 16
let SCREEN_WIDTH
let SCREEN_HEIGHT

function getColorTexture (color, renderer) {
  const graphics = new PIXI.Graphics()

  graphics.beginFill(color)
  graphics.drawRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT)
  graphics.endFill()

  return renderer.generateTexture(graphics)
}

function makeSprite (renderer) {
  const texture = getColorTexture(0xff0000, renderer)

  const sprite = new PIXI.Sprite(texture)

  return sprite
}

class View {
  constructor (map) {
    SCREEN_WIDTH = map.width * SPRITE_WIDTH
    SCREEN_HEIGHT = map.height * SPRITE_HEIGHT

    this._app = new PIXI.Application(SCREEN_WIDTH, SCREEN_HEIGHT, { backgroundColor: 0xffc125 })
    this._sprites = {}

    document.body.appendChild(this._app.view)
  }

  _removePlayer (id) {
    this._sprites[id].destroy()
    delete this._sprites[id]
  }

  _createPlayer (id, x, y) {
    const sprite = makeSprite(this._app.renderer)

    console.log(sprite)

    sprite.x = x * SPRITE_WIDTH
    sprite.y = SCREEN_HEIGHT - y * SPRITE_HEIGHT

    this._sprites[id] = sprite
    this._app.stage.addChild(sprite)
  }

  _updatePosition (id, coord, value) {
    if (coord === 'x') {
      this._sprites[id][coord] = value * SPRITE_WIDTH
    }
    else {
      this._sprites[id][coord] = SCREEN_HEIGHT - value * SPRITE_HEIGHT
    }

    
    console.log(this._sprites[id]['x'], this._sprites[id]['y'])
  }

  _updateColor (id, tagged) {
    const sprite = this._sprites[id]

    if (tagged) {
      sprite.texture = getColorTexture(0x00ff00, this._app.renderer)
    }
  }

  updatePlayer (change) {
    console.log(change)

    switch (change.operation) {
      case 'add':
        this._createPlayer(change.path.id, change.value.x, change.value.y)
        this._updateColor(change.path.id, change.value.tag)
        break
      case 'remove':
        this._removePlayer(change.path.id)
    }
  }

  updatePosition (change) {
    console.log(change)

    if (change.operation === 'replace') {
      if (change.path.attribute === 'x' || change.path.attribute === 'y') {
        this._updatePosition(change.path.id, change.path.attribute, change.value)
      } else {
        this._updateColor(change.path.id, change.value)
      }
    }
  }
}

export default View
