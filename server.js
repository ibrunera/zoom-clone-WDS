const express = require('express')
const app = express()
//criando o server para o socket.io
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

//setando como renderizamos as paginas
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (request, response) => {
  //gerando um id random
  const roomId = uuidV4()
  //redirecionando para um id gerado automativamente
  response.redirect(`/${roomId}`)

  console.log('roomId:', roomId)
})

app.get('/:roomId', (request, response) => {
  const { roomId } = request.params
  response.render('room', { roomId })
})

//toda vez que alguem conectar 
io.on('connection', (socket) => {
  //toda vez que alguem conectar, e recebermos o join-room event, passaremos o roomId e o userId
  socket.on('join-room', (roomId, userId) => {
    console.log(`<>join-room roomId:(${roomId}) e userId:(${userId})`)
    //para avisar os outros usuários que entramos no room
    socket.join(roomId)
    //enviando uma msg que entramos no room para os outros usuarios,
    //bradcast para q n recebamos nossa propria msg
    socket.to(roomId).broadcast.emit('user-connected', userId)
    //para desconectar mais rapido, quando o usuario deixar a pagina
    //esse evento deve ser chamado
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3333, () => {
  console.log('Server running on http://localhost:3333  ')
})