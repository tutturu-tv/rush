import View from './view'
import * as axios from 'axios'
import * as Colyseus from 'colyseus.js'
import Controller from 'key-controller'

axios
  .get('/api/sizes')
  .then((res) => {
    const view = new View(res.data)

    const client = new Colyseus.Client(`ws://${window.location.host}${window.location.port ? ':' + window.location.port : ''}`)
    const room = client.join('game')

    const directions = ['up', 'down', 'left', 'right']
    let virtuals = {}

    directions.forEach((direction) => {
      virtuals[direction] = {
        keyup (transmitter) {
          transmitter.send({ direction })
        }
      }
    })

    const keymap = {
      up: ['ArrowUp', 'w'],
      down: ['ArrowDown', 's'],
      left: ['ArrowLeft', 'a'],
      right: ['ArrowRight', 'd']
    }

    const controller = new Controller(room, virtuals)
    controller.register(keymap)

    room.listen('players/:id', (change) => view.updatePlayer(change))
    room.listen('players/:id/:attribute', (change) => view.updatePosition(change))
  })
