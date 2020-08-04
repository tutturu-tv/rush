const port = 8080

const mapLimits = require('./conf')
const path = require('path')
const express = require('express')
const app = express()
const http = require('http')
const colyseus = require('colyseus')
const GameRoom = require('./game')

const server = http.createServer(app)
const gameServer = new colyseus.Server({ server })

gameServer.register('game', GameRoom)

app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/api/sizes', (req, res) => {
  res.send(mapLimits)
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './static/index.html'))
})

server.listen((process.env.PORT || port), () => {
  console.log(process.env.PORT || port)
})
