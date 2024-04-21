
import { InputBuffer } from "./input";

class Signaling{
    socket: WebSocket = new WebSocket("ws://localhost:8765");
    constructor(){
    }

    start(id: number){
        this.socket.send(JSON.stringify({id: id, type: 'start'}));
    }
    sendCandidate(id: number, message: Object, sender: string){
        this.socket.send(JSON.stringify({id: id, type: 'candidate', data: message, sender: sender}));
    }

    sendDescription(id: number, message: Object, sender: string){
        this.socket.send(JSON.stringify({id: id, type: 'desc', data: message, 'sender': sender}));

    }

    join(id: number){
        this.socket.send(JSON.stringify({id: id, type: 'join'}))
    }
    

    stop(id: number){
        this.socket.send(JSON.stringify({id: id, type: 'stop'}))
    }
}


 const signaling = new Signaling();

 enum RemoteInputStatus {
    Connecting,
    Joining,
    Joined,
    Connected
 };

class RemoteInput{
    
    pc: RTCPeerConnection;
    creator: Boolean = false;
    dataChannel: RTCDataChannel;
    configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    connectionId : number
    status: RemoteInputStatus

    connectionDiv: HTMLDivElement
    connectionIdElem: HTMLDivElement


    inputElement: HTMLInputElement
    connectionButton: HTMLButtonElement
    joinButton: HTMLButtonElement

    inputBuffer: InputBuffer

    onconnection: Function = () => {}
    
    constructor(inputBuffer: InputBuffer){
        signaling.socket.onmessage = (message:object) => {this.onmessage(message)};
        this.createDomElements();
        this.inputBuffer = inputBuffer;
    }
    hideDomElements(){
       this.connectionDiv.style.display = 'none' ;
    }
    createDomElements(){
        let body = document.getElementsByTagName('body')[0];
        
        this.connectionDiv = document.createElement('div');
        this.connectionDiv.classList.add('connection-modal');
        
        this.connectionIdElem = document.createElement('div');
        this.connectionIdElem.classList.add('connection-modal-text');

        this.connectionDiv.appendChild(this.connectionIdElem);
        
        
        this.inputElement = document.createElement('input');
        let buttonsDiv = document.createElement('div');
        this.connectionButton = document.createElement('button');
        this.connectionButton.innerText = "Create";
        this.connectionButton.onclick = () => this.connect()
        
        this.joinButton = document.createElement('button');
        this.joinButton.innerText = "Join";
        this.joinButton.onclick = () => this.join();

        buttonsDiv.appendChild(this.connectionButton);
        buttonsDiv.appendChild(this.joinButton);

        this.connectionDiv.appendChild(this.inputElement);
        this.connectionDiv.appendChild(buttonsDiv);

        body.appendChild(this.connectionDiv);
    }

    connect(){
        this.creator = true;
        this.joinButton.disabled = true;
        this.connectionId = Math.floor(100000 + Math.random() * 900000);
        this.connectionIdElem.innerText = this.connectionId.toString();

        signaling.start(this.connectionId);
        this.status = RemoteInputStatus.Connecting;
    }

    join(){
        this.connectionButton.disabled = true;
        this.connectionId = parseInt(this.inputElement.value);
        this.pc = new RTCPeerConnection(this.configuration);
        this.pc.ondatachannel = ( event: RTCDataChannelEvent) => {
            this.dataChannel = event.channel;
            this.onconnection();
            this.dataChannel.onmessage = (message) => {
                this.createInput(message)
            } ;
        }

        this.pc.onicecandidate = ({candidate}) => signaling.sendCandidate(this.connectionId, candidate, 'joiner');
        signaling.join(this.connectionId);
    }

    createInput(message: object){
        let data = JSON.parse(message.data)

        switch(data.k){
            case 'a':
            case 'A': this.inputBuffer.left = data.d; break;
            case 's':
            case 'S': this.inputBuffer.down = data.d; break;
            case 'd':
            case 'D': this.inputBuffer.right = data.d; break;
            case 'w':
            case 'W': this.inputBuffer.up = data.d; break;
            case 'u':
            case 'U': this.inputBuffer.a = data.d; break;
            case 'i':
            case 'I': this.inputBuffer.b = data.d; break;
            case 'j':
            case 'J': this.inputBuffer.x = data.d; break;
            case 'k':
            case 'K': this.inputBuffer.y = data.d; break;
        }
    }

    async createChannel(){
        this.pc = new RTCPeerConnection(this.configuration);

        this.pc.onicecandidate = ({candidate}) => signaling.sendCandidate(this.connectionId, candidate, 'creator');

        this.dataChannel = this.pc.createDataChannel('gameData');
        this.dataChannel.onopen = () => {
            this.onconnection();
        }
        this.dataChannel.onclose = () => {
        }
        this.dataChannel.onmessage = (message: object) => {
            this.createInput(message);
        }

        let offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        signaling.sendDescription(this.connectionId, this.pc.localDescription, 'creator');

        this.status = RemoteInputStatus.Connected;
    }

    async acceptOffer(value: RTCSessionDescription){
        this.pc.setRemoteDescription(value);
        let answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        signaling.sendDescription(this.connectionId, this.pc.localDescription, 'joiner');
        signaling.stop(this.connectionId);

        this.status = RemoteInputStatus.Joined;
    }

    onmessage(message: object){
        let data = JSON.parse(message.data);
        if(data.comand == 'PeerReady'){
            this.createChannel();
            return
        }
        if(data.comand == 'Candidate'){
            this.pc.addIceCandidate(data.value);
            
        }

        if(data.comand == 'desc'){
            if(!this.creator){
                this.acceptOffer(data.value);
            }else{
                this.pc.setRemoteDescription(data.value);
            }
        }
    }

    sendMessage(keyDown: string, down: boolean){
        this.dataChannel.send(JSON.stringify({k: keyDown, d: down}));
    }

    update(){

    }
    
}

 
export {RemoteInput, RemoteInputStatus};