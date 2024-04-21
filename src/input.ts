 
class InputBuffer{

    up: Boolean = false;
    down: Boolean = false;
    left: Boolean = false;
    right: Boolean = false;

    a: Boolean = false;
    b: Boolean = false;
    x: Boolean = false;
    y: Boolean = false;

    constructor(){
        
    }
}

 class Input{
    constructor(inputBuffer: InputBuffer, dataChannel: RTCDataChannel){
        document.addEventListener('keydown', (event) => {
            dataChannel.send(JSON.stringify({k: event.key, d: true}))
            switch(event.key){
                case 'a':
                case 'A': inputBuffer.left = true; break;
                case 's':
                case 'S': inputBuffer.down = true; break;
                case 'd':
                case 'D': inputBuffer.right = true; break;
                case 'w':
                case 'W': inputBuffer.up = true; break;
                case 'u':
                case 'U': inputBuffer.a = true; break;
                case 'i':
                case 'I': inputBuffer.b = true; break;
                case 'j':
                case 'J': inputBuffer.x = true; break;
                case 'k':
                case 'K': inputBuffer.y = true; break;
            }
        })

        document.addEventListener('keyup', (event) => {
            dataChannel.send(JSON.stringify({k:event.key, d: false}))
            switch(event.key){
                case 'a':
                case 'A': inputBuffer.left = false; break;
                case 's':
                case 'S': inputBuffer.down = false; break;
                case 'd':
                case 'D': inputBuffer.right = false; break;
                case 'w':
                case 'W': inputBuffer.up = false; break;
                case 'u':
                case 'U': inputBuffer.a = false; break;
                case 'i':
                case 'I': inputBuffer.b = false; break;
                case 'j':
                case 'J': inputBuffer.x = false; break;
                case 'k':
                case 'K': inputBuffer.y = false; break;
            }
        })
    }
 }




 export {Input, InputBuffer};