import { Animator } from "./animation";
import { Physics, BoxCollider } from "./physics";
import { InputBuffer } from "./input";


class Player {

    physics : Physics = new Physics();
    collider: BoxCollider = new BoxCollider(this.physics, 9, 28, -4.5, -14);
    animator: Animator = new Animator();
    charging: Boolean = false;
    grouded: Boolean = false;
    inputBuffer: InputBuffer = new InputBuffer();

    hitboxes: Map<string, BoxCollider> = new Map();
    flipx : boolean = false;
    health: number = 100;

    constructor(){
        this.physics.gravity = 200;
        this.physics.transform.y = 50;
        this.grouded = false;

        this.createHitboxes();
        

        this.collider.onCollision = (col: BoxCollider, overlap: number, direction: string) => {
            if(col.tag == 'Ground'){
                this.grouded = true;

            }
            if(direction == 'Y'){
                this.physics.velocity.y = 0;
                this.physics.transform.y = Math.ceil(this.physics.transform.y - overlap);
            }else{
                this.physics.velocity.x = 0;
                this.physics.transform.x = Math.ceil(this.physics.transform.x - overlap);
            }
            if(col.tag == 'upperCut'){
                this.physics.velocity.y = -100;
            }
            if(col.tag == 'upperCut' || col.tag == 'fightKick' || col.tag == 'quickPunch'){
                this.health = this.health - 10;
                col.active = false;
            }

        }
    }

    flipHorizontally(){
        this.flipx = true;
        this.animator.flipx = true;
        this.hitboxes.forEach((col: BoxCollider, key: string)=>{
            col.offset.x = -col.offset.x;
        });
    }

    createHitboxes(){
        this.hitboxes.set('quickPunch',  new BoxCollider(this.physics, 7, 7, 14, -2));
        this.hitboxes.get('quickPunch').active = false;
        this.hitboxes.get('quickPunch').tag = 'quickPunch';

        this.hitboxes.set('fightKick',  new BoxCollider(this.physics, 7, 7, 14, -4));
        this.hitboxes.get('fightKick').active = false;
        this.hitboxes.get('fightKick').tag = 'fightKick';

        this.hitboxes.set('upperCut', new BoxCollider(this.physics, 7, 10, 14, -6));
        this.hitboxes.get('upperCut').active = false;
        this.hitboxes.get('upperCut').tag = 'upperCut';
    }

    render(ctx: CanvasRenderingContext2D, dt: number){
        this.physics.render(ctx);
        this.animator.render(ctx, dt, this.physics.transform);
        this.collider.render(ctx);
        this.hitboxes.get('quickPunch').render(ctx);
        this.hitboxes.get('upperCut').render(ctx);
    }

    activateHitbox(name: string, delay: number, activeTime: number): boolean{
        setTimeout(() => {
            this.hitboxes.get(name).active=true;
            this.deactivateHitbox(name, activeTime);
        }, delay);
        return true;
    }

    deactivateHitbox(name: string, activeTime: number){
        setTimeout(() => {
            this.hitboxes.get(name).active=false;
        }, activeTime);
    }

    moves(){
        if(this.charging){
        }
        if(this.inputBuffer.a 
            && this.animator.cancelAndPlayMultiple(['idle', 'walk'], ['quickPunch', 'idle']) 
            && this.activateHitbox('quickPunch', 150, 150) )  return;

        if(this.inputBuffer.b 
            && this.animator.cancelAndPlayMultiple(['idle', 'walk'], ['upperCut', 'idle'])
            && this.activateHitbox('upperCut', 250, 150) ) return;

        if(this.inputBuffer.x && this.animator.cancelAndPlayMultiple(['idle', 'walk'], ['fightKick', 'idle']) 
            && this.activateHitbox('fightKick', 200, 150)
        ) return;

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
        if(this.health <= 0 ){
            if(this.animator.currentAnimationName != 'die'){
                this.animator.play('die');
            }
            return
        }
        this.moves();
        this.physics.update(dt);
    }
}

export {Player};