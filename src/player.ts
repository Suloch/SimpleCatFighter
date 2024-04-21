import { Animator } from "./animation";
import { Physics, BoxCollider } from "./physics";
import { InputBuffer } from "./input";

class Player {

    physics : Physics = new Physics();
    collider: BoxCollider = new BoxCollider(this.physics, 9, 28, 26, 28);
    animator: Animator = new Animator();
    charging: Boolean = false;
    grouded: Boolean = false;
    inputBuffer: InputBuffer = new InputBuffer();

    constructor(){
        this.physics.gravity = 200;
        this.physics.transform.y = 50;
        this.grouded = false;

        this.collider.onCollision = (col: BoxCollider, overlap: number, direction: string) => {
            if(col.tag == 'Ground'){
                this.grouded = true;

            }
            if(direction == 'Y'){
                this.physics.velocity.y = 0;
                this.physics.transform.y -= overlap;
            }else{
                this.physics.velocity.x = 0;
                this.physics.transform.x -= overlap;
            }

        }
    }

    render(ctx: CanvasRenderingContext2D, dt: number){
        this.animator.render(ctx, dt, this.physics.transform);
        this.collider.render(ctx);
    }

    moves(){
        if(this.charging){
        }
        if(this.inputBuffer.a && this.animator.cancelAndPlayMultiple(['idle', 'walk'], ['quickPunch', 'idle'])) return;
        if(this.inputBuffer.b && this.animator.cancelAndPlayMultiple(['idle', 'walk'], ['upperCut', 'idle']) ) return;
        if(this.inputBuffer.x && this.animator.cancelAndPlayMultiple(['idle', 'walk'], ['fightKick', 'idle']) ) return;

        if(this.inputBuffer.up && this.grouded){
            this.physics.velocity.y = - 120;
            this.grouded = false;
            this.animator.playMultiple(['jumpstart', 'jumpair', 'jumpair', 'land', 'idle']);
        }
        if(this.inputBuffer.right ){
            if(this.animator.cancelAndPlay(['idle'], 'walk') || this.animator.currentAnimationName == 'walk' || !this.grouded){
                this.physics.transform.x += 1;
                return;
            }
        }
        if(this.inputBuffer.left ){
            if(this.animator.cancelAndPlay(['idle'], 'walk') || this.animator.currentAnimationName == 'walk' || !this.grouded){
                this.physics.transform.x -= 1;
                return;
            }
        }else{
            if(!this.animator.playing || this.animator.currentAnimationName == 'walk'
            ){
                this.animator.play('idle');
            }
        }
    }
    
    update(dt: number){
        this.moves();
        this.physics.update(dt);
    }
}

export {Player};