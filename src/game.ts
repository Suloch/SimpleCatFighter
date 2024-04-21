
import { Physics, BoxCollider, world } from "./physics";
import { Player } from "./player";
import { HealthBar, Timer } from "./ui";
import { Input } from "./input";
import { RemoteInput, RemoteInputStatus } from "./remoteInput";

class Ground{

    physics: Physics = new Physics();
    collider: BoxCollider = new BoxCollider(this.physics, 2000, 20, -100, 0);

    constructor(){
        this.physics.transform.x = 10;
        this.physics.transform.y = 105;
        this.physics.gravity = 0;
        this.collider.tag = 'Ground';
    }

    render(ctx: CanvasRenderingContext2D, dt: number){
        this.collider.render(ctx);
    }
}

class Background{
    image: HTMLImageElement
    constructor(){
        this.image = document.createElement('img');
        this.image.src = 'background.png';
    }
    render(ctx: CanvasRenderingContext2D, dt: Number){
        ctx.drawImage(this.image, 0, 0, 320, 180, 0, 0, 320, 120);
    }
}

export default class GameWindow{

    ctx : CanvasRenderingContext2D;
    height: number;
    width: number;
    player: Player = new Player();
    player2: Player = new Player();
    ground: Ground = new Ground();
    background: Background = new Background();
    healthBarPlayer1: HealthBar;
    timer: Timer ;
    input: Input;
    remoteInput: RemoteInput;

    constructor(){
        this.height = 128;
        this.width = 256;
        this.init();

        
        this.remoteInput = new RemoteInput(this.player.inputBuffer);
        
        this.player2.animator.flipx = true;
        this.player2.physics.transform.x = 100;
        this.player2.collider.offset.x = 30;
        

        this.remoteInput.onconnection = () => {
            if(this.remoteInput.creator){
                this.remoteInput.inputBuffer = this.player.inputBuffer
                this.input = new Input(this.player2.inputBuffer, this.remoteInput.dataChannel);
            }else{
                this.remoteInput.inputBuffer = this.player2.inputBuffer
                this.input = new Input(this.player.inputBuffer, this.remoteInput.dataChannel);
            }
            this.remoteInput.hideDomElements();
            this.startGameLoop();
        }
    }

    init(){
        let body = document.getElementsByTagName('body')[0];
        
        let mainDiv = document.createElement('div');
        mainDiv.id = 'canvas-container'
        body.appendChild(mainDiv);

        let canvas = document.createElement('canvas');
        canvas.height = this.height;
        canvas.width = this.width;
        mainDiv.appendChild(canvas);
        
        this.healthBarPlayer1 = new HealthBar(mainDiv);
        this.timer = new Timer(mainDiv);

        let ctx = canvas.getContext('2d');
        if(ctx != null){
            this.ctx = ctx;
        }
    }

    

    render(dt: number){
        this.background.render(this.ctx, dt);
        this.ground.render(this.ctx, dt);
        this.player.render(this.ctx, dt);
        this.player2.render(this.ctx, dt);
    }

    update(dt: number){
        this.player.update(dt);
        this.player2.update(dt);
        this.healthBarPlayer1.udpate();
    }

    startGameLoop(){
        let prevTime = 0;

        let animate = (timestamp: number) =>{
            
            let dt = timestamp - prevTime;

            if( dt > 20 || prevTime == 0){
                world.checkCollision();
                this.update(20);
                this.render(dt);
                prevTime = timestamp;
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

};