 
 
let pc: RTCPeerConnection
let creator = false;
let dataChannel;

 class Signaling{
    socket: WebSocket = new WebSocket("ws://localhost:8765");
    constructor(){
    this.socket.onmessage = this.onmessage;

    }

    start(){
        this.socket.send(JSON.stringify({id: 1232, type: 'start'}));
        creator = true;
    }
    sendCandidate(message: Object, sender: string){
        this.socket.send(JSON.stringify({id: 1232, type: 'candidate', data: message, sender: sender}));
    }

    sendDescription(message: Object, sender: string){
        this.socket.send(JSON.stringify({id: 1232, type: 'desc', data: message, 'sender': sender}));

    }

    join(){
        this.socket.send(JSON.stringify({id: 1232, type: 'join'}))
    }
    onmessage(message: object){
        let data = JSON.parse(message.data);
        console.log(data);
        if(data.comand == 'PeerReady'){
            createChannel();
            return
        }
        if(data.comand == 'Candidate'){
            pc.addIceCandidate(data.value);
            
        }

        if(data.comand == 'desc'){
            if(!creator){
                handleOffer(data.value);
            }else{
                pc.setRemoteDescription(data.value);
            }
        }
    }

    stop(){
        this.socket.send(JSON.stringify({id: 1232, type: 'stop'}))
    }
}

const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
};

let createChannel = async () =>{
    pc = new RTCPeerConnection(configuration);
    console.log(pc);

    pc.onicecandidate = ({candidate}) => signaling.sendCandidate(candidate, 'creator');

    dataChannel = pc.createDataChannel('gameData');
    dataChannel.onopen = () => {console.log("open")}
    dataChannel.onclose = () => {console.log("open")}
    dataChannel.onmessage = (message) => {console.log(message)}

    let offer = await pc.createOffer();
    console.log(offer);
    await pc.setLocalDescription(offer);
    signaling.sendDescription(pc.localDescription, 'creator');
}


let handleOffer = async (value) => {
    pc.setRemoteDescription(value);
    let answer = await pc.createAnswer();
    console.log(answer);
    await pc.setLocalDescription(answer);
    signaling.sendDescription(pc.localDescription, 'joiner');
    signaling.stop();
}

 const signaling = new Signaling();

 
 class RemoteInput{
    peerConnection: RTCPeerConnection
    dataChannel: RTCDataChannel

    

    constructor(){
          let body = document.getElementsByTagName('body')[0];

          let button = document.createElement('button');
          button.innerText = "Create";
          button.onclick = this.createChannel;
          body.appendChild(button);

          let button2 = document.createElement('button');
          button2.innerText = "Join";
          button2.onclick = this.handleOffer;
          body.appendChild(button2);

          let button3 = document.createElement('button');
          button3.innerText = "Send";
          button3.onclick = () => {dataChannel.send('Hello')};
          body.appendChild(button3);
         
    }

    createChannel(){
        signaling.start();
        

    }

    handleOffer(){
        pc = new RTCPeerConnection(configuration);
        pc.ondatachannel = ( event: RTCDataChannelEvent) => {
            console.log(event)
            dataChannel = event.channel;
            dataChannel.onmessage = (message) => {console.log(message)} ;
        }

        pc.onicecandidate = ({candidate}) => signaling.sendCandidate(candidate, 'joiner');
        signaling.join();
        
    }

    sendMessage(){
        this.dataChannel.send("hello");
    }
    

    handleDataChannelOpen(){
        console.log('Channel opened');
    }

    handleDataChannelClose(){
        console.log('Channel Closed');
    }

    handleDataChannelMessage(message: Event){
        console.log(message)
    }
 }
 
 new RemoteInput();

 class Input{
    up: Boolean = false;
    down: Boolean = false;
    left: Boolean = false;
    right: Boolean = false;

    a: Boolean = false;
    b: Boolean = false;
    x: Boolean = false;
    y: Boolean = false;

    constructor(){
        document.addEventListener('keydown', (event) => {
            switch(event.key){
                case 'a':
                case 'A': this.left = true; break;
                case 's':
                case 'S': this.down = true; break;
                case 'd':
                case 'D': this.right = true; break;
                case 'w':
                case 'W': this.up = true; break;
                case 'u':
                case 'U': this.a = true; break;
                case 'i':
                case 'I': this.b = true; break;
                case 'j':
                case 'J': this.x = true; break;
                case 'k':
                case 'K': this.y = true; break;
            }
        })

        document.addEventListener('keyup', (event) => {
            switch(event.key){
                case 'a':
                case 'A': this.left = false; break;
                case 's':
                case 'S': this.down = false; break;
                case 'd':
                case 'D': this.right = false; break;
                case 'w':
                case 'W': this.up = false; break;
                case 'u':
                case 'U': this.a = false; break;
                case 'i':
                case 'I': this.b = false; break;
                case 'j':
                case 'J': this.x = false; break;
                case 'k':
                case 'K': this.y = false; break;
            }
        })
    }
 }

class InputBuffer{
    
    constructor(){
        
    }
}

 const input = new Input();

 export {input, RemoteInput};