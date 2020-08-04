import View from './view'
import * as axios from 'axios'
import * as Colyseus from 'colyseus.js'

axios
  .get('/api/sizes')
  .then((res) => {
    const view = new View(res.data)

    const client = new Colyseus.Client(`ws://${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`)
    client.joinOrCreate('game').then(room => {
      const keymap = [
        ['up', ['ArrowUp', 'w']],
        ['down', ['ArrowDown', 's']],
        ['left', ['ArrowLeft', 'a']],
        ['right', ['ArrowRight', 'd']]
      ]

      document.onkeydown = e => {
        keymap.forEach(dir => {
          if (dir[1].indexOf(e.key) + 1) return room.send('move', dir[0])
        })
      }

      console.log(room)

      room.listen('players/:id', (change) => view.updatePlayer(change))
      room.listen('players/:id/:attribute', (change) => view.updatePosition(change))
    })
  })
