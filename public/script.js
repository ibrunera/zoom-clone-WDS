const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
  host:'/',
  port:'3334'
})

//variavel para saber qm esta na ligação para remove-lo
const peers = {}

const myVideo = document.createElement('video')
//mutamos nosso video para nao ouvirmos nos mesmos
myVideo.muted = true

//dizendo pro navegador usar nosso audio e video
//isso é uma promisse por isso o.then
navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then((stream) => {
  addVideoStream(myVideo, stream)

  //recebendo o video do usuario que entrou depois
  myPeer.on('call', call=>{
    call.answer(stream)
    //mostrando pro segundo usuario o video
    const video = document.createElement('video')
    call.on('stream',(userVideoStream)=>{
      addVideoStream(video,userVideoStream)
    })
  })

  //permitir que outros usuarios recebam nosso video
  socket.on('user-connected', (userId)=>{
    connectToNewUser(userId, stream)
  })
})

//para fehcar a conexção mais rapido
socket.on('user-disconnect',(userId)=>{
  if(peers[userId]) peers[userId].close()
})


//myPeer.on('open) -> assim que conectarmos rodaremos o código dele.
//e usaramos isso para pegar o id do usuário.
myPeer.on('open',(userId)=>{
  socket.emit('join-room', ROOM_ID, userId)
})

//teste parar ouvir o user connected
/*
socket.on('user-connected', (userId)=>{
  console.log(`user-connected userId:(${userId})`)
})
*/

//função para dizer pro myVideo usar o stream do navigator.
function addVideoStream(video, stream){
  video.srcObject = stream
  video.addEventListener('loadedmetadata', ()=>{
    video.play()
  })
  videoGrid.append(video)
}

//funcao para novo usuário receber nosso stream
function connectToNewUser(userId, stream){
  const video = document.createElement('video')
  const call = myPeer.call(userId,stream)
  call.on('stream', (userVideoStream) =>{
    addVideoStream(video, userVideoStream)
  })
  call.on('close', ()=>{
    video.remove()
  })

  peers[userId] = call
}