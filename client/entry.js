/* global localStorage */
import View from './view'
import * as axios from 'axios'
import * as Colyseus from 'colyseus.js'

const nameInput = document.getElementById('name')
const submitBtn = document.getElementById('submit')
const errorMsg = document.getElementById('errorMsg')
const TT = document.getElementById('tooltip')

if (localStorage.name) nameInput.value = localStorage.name

nameInput.onkeypress = e => {
  if (e.key !== 'Enter') return
  submitName()
}

submitBtn.onclick = submitName

function submitName () {
  const name = nameInput.value
  if (!validateName(name)) return
  localStorage.name = name
  document.getElementById('startScreen-wrap').style.display = 'none'
  startGame(name)
}

nameInput.onblur = e => {
  if (!nameInput.value.length) return
  validateName(nameInput.value)
}

function startGame (name) {
  axios
    .get('/api/sizes')
    .then((res) => {
      const view = new View(res.data)

      const client = new Colyseus.Client(`ws://${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`)
      client.joinOrCreate('game', { name }).then(room => {
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

        view._app.view.onmousemove = e => {
          const mouseCoords = view.coordsToStr(e.layerX, e.layerY)
          const playerId = view._playerPositions.get(mouseCoords)
          if (!playerId) return hideTooltip()
          TT.innerText = room.state.players[playerId].name
          TT.style.top = e.y + 'px'
          TT.style.left = e.x + 'px'
        }

        view._app.view.onmouseleave = hideTooltip

        console.log(room)

        room.listen('players/:id', (change) => view.updatePlayer(change))
        room.listen('players/:id/:attribute', (change) => view.updatePosition(change))
      })
    })
}

function validateName (name) {
  const validationResult = nameValidator(name)
  if (validationResult[0]) {
    nameInput.classList.remove('invalidInput')
    errorMsg.style.width = null
    errorMsg.style.height = null
    return true
  }
  nameInput.classList.add('invalidInput')
  errorMsg.style.width = '100%'
  errorMsg.style.height = '100%'
  errorMsg.innerText = validationResult[1]
  return false
}

function nameValidator (name) {
  if (name.length > 15) return [false, 'Name cannot be longer than 15 characters.']
  if (!/^[0-9A-Za-z ]*$/.test(name)) return [false, 'Name can only contain numbers and Latin characters.']
  if (name.replace(/\s/g, '') === '') return [false, 'Name must contain at least one displayable character.']
  return [true, null]
}

function hideTooltip () {
  TT.style.top = null
  TT.style.left = null
}
