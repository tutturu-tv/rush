'use strict'

import * as PIXI from 'pixi.js'

const SPRITE_HEIGHT = 16
const SPRITE_WIDTH = 16
let SCREEN_WIDTH
let SCREEN_HEIGHT
let TT

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
    this._playerPositions = new Map()
    TT = document.querySelector('#tooltip')

    document.body.appendChild(this._app.view)

    this._app.view.onmousemove = e => {
      const mouseCoords = coordsToStr(e.layerX, e.layerY)
      const playerId = this._playerPositions.get(mouseCoords)
      if (!playerId) return hideToolTip()
      TT.innerText = playerId
      TT.style.top = e.y + 'px'
      TT.style.left = e.x + 'px'
    }

    this._app.view.onmouseleave = hideToolTip
  }

  _removePlayer (id) {
    const sprite = this._sprites[id]
    this._playerPositions.delete(coordsToStr(sprite.x, sprite.y))
    sprite.destroy()
    delete this._sprites[id]
  }

  _createPlayer (id, x, y) {
    const sprite = makeSprite(this._app.renderer)

    console.log(sprite)

    sprite.x = x * SPRITE_WIDTH
    sprite.y = SCREEN_HEIGHT - (y + 1) * SPRITE_HEIGHT

    this._sprites[id] = sprite
    this._app.stage.addChild(sprite)
    this._playerPositions.set(x + ';' + y, id)
  }

  _updatePosition (id, coord, value) {
    const sprite = this._sprites[id]
    this._playerPositions.delete(coordsToStr(sprite.x, sprite.y))
    if (coord === 'x') {
      sprite[coord] = value * SPRITE_WIDTH
    } else {
      sprite[coord] = SCREEN_HEIGHT - (value + 1) * SPRITE_HEIGHT
    }

    this._playerPositions.set(coordsToStr(sprite.x, sprite.y), id)
    console.log(sprite.x, sprite.y)
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

function hideToolTip () {
  TT.style.top = null
  TT.style.left = null
};

function coordsToStr (x, y) {
  const mapH = SCREEN_HEIGHT / SPRITE_HEIGHT
  const cellW = Math.floor(x / SPRITE_WIDTH)
  const cellH = mapH - Math.floor(y / SPRITE_HEIGHT) - 1
  return cellW + ';' + cellH
}
