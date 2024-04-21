import { Transform } from "./physics";

type Frame = {x: number, y: number, h:number, w:number};


class SpriteSheet{
    image: HTMLImageElement;
    imageF: HTMLImageElement;

    frames: Array<Frame> = [];
    framesF: Array<Frame> = [];

    constructor(){
        this.image = document.createElement('img');
        this.image.src = 'sprite.png';
        this.imageF = document.createElement('img');
        this.imageF.src = 'sprite_f.png';
        
        let topMargin = 0;
        let height = 64; 
        let width = 64;
        let leftMargin = 0;

        let framesCount = [4, 8, 8, 10, 9, 7, 6, 8, 13, 10, 12, 6, 8, 8, 8, 6];
        // b = a.map((sum = 0, n => sum += n))

        for(let count of framesCount){
            leftMargin = 0;
            for(let i = 0; i < count; i++){    
                this.frames.push({x: leftMargin, y: topMargin, h: height, w: width});
                this.framesF.push({x: 1024-leftMargin-width, y: topMargin, h: height, w: width});

                leftMargin = leftMargin + width ;
            }
            topMargin = topMargin + height;
        }
    }

}


class Animation{
    offset: Transform = new Transform();
    sheet: SpriteSheet
    animationData: Map<number, Frame>
    animationDataF: Map<number, Frame>


    currentFrame: number;
    maxFrame: number;
    loop: Boolean = false;
    prevFrame: Frame;
    speed: number = 1;

    constructor(indices: Array<number>){
        this.sheet = new SpriteSheet();
        this.currentFrame = 0;
        let i = 0;
        this.animationData = new Map();
        this.animationDataF = new Map();

        for(let index of indices){
            this.animationData.set(i*10,  this.sheet.frames[index]);
            this.animationDataF.set(i*10,  this.sheet.framesF[index]);
            i++;
        }
        
        this.prevFrame = this.animationData.get(0);
        this.maxFrame = i*10;
        this.offset.x = -32;
        this.offset.y = -40;

    }

    render(ctx: CanvasRenderingContext2D, dt: number, t: Transform, flipx: Boolean){

        if(this.animationData.has(this.currentFrame)){
            if(flipx){
                this.prevFrame = this.animationDataF.get(this.currentFrame);
            }else{

                this.prevFrame = this.animationData.get(this.currentFrame);
            }
        }
        if(flipx){
            ctx.drawImage(this.sheet.imageF, this.prevFrame.x, this.prevFrame.y, this.prevFrame.h, this.prevFrame.w, t.x+this.offset.x, t.y+this.offset.y, 64, 64);
        }else{
            ctx.drawImage(this.sheet.image, this.prevFrame.x, this.prevFrame.y, this.prevFrame.h, this.prevFrame.w, t.x+this.offset.x, t.y+this.offset.y, 64, 64);
        }
        this.currentFrame = (this.currentFrame + this.speed) ;
        if(this.loop){
            this.currentFrame = this.currentFrame % this.maxFrame;
        }
    }
}


class Animator{
    animations: Map<String, Animation> = new Map();
    currentAnimation: Animation;
    currentAnimationName: String;
    nextAnimations: Array<String> = [];
    playing: Boolean = true;
    flipx: Boolean = false;
    
    constructor(){
        let idleAnimation =  new Animation([0, 1, 2, 3]);
        idleAnimation.loop = true;
        
        this.animations.set('idle', idleAnimation);

        let walkAnimation = new Animation([4, 5, 6, 7, 8, 9, 10, 11]);
        walkAnimation.speed = 2;
        walkAnimation.loop = true;

        this.animations.set('walk', walkAnimation);

        let jumpstartAnimation = new Animation([12, 13]);
        jumpstartAnimation.speed = 2.5;
        this.animations.set('jumpstart', jumpstartAnimation);

        let jumpairAnimation = new Animation([14, 15])
        this.animations.set('jumpair', jumpairAnimation);
        
        let landAnimation = new Animation([16, 17, 18, 19]);
        landAnimation.speed = 2.5;
        this.animations.set('land', landAnimation);
        
        let dieAnimation = new Animation([30, 31, 32, 33, 34, 35, 36]);
        this.animations.set('die', dieAnimation);

        let quickPunchAnimation = new Animation([46, 47, 48, 49, 50, 51]);
        quickPunchAnimation.speed = 5;
        this.animations.set('quickPunch', quickPunchAnimation);

        let upperCutAnimation = new Animation([125, 126, 127, 128, 129, 130]);
        upperCutAnimation.speed = 2.5;
        this.animations.set('upperCut', upperCutAnimation);

        let fightKickAnimation = new Animation([95, 96, 97, 98, 99, 100]);
        fightKickAnimation.speed = 2.5;
        this.animations.set('fightKick', fightKickAnimation);

        this.currentAnimation = this.animations.get('idle');
        this.currentAnimationName = 'idle';
    }

    play(name: String){
        this.currentAnimation = this.animations.get(name);
        this.currentAnimationName = name;
        this.currentAnimation.currentFrame = 0;
        this.playing = true;
    }

    playMultiple(names: Array<String>){
        this.currentAnimationName = names.shift()
        this.currentAnimation = this.animations.get(this.currentAnimationName);
        this.currentAnimation.currentFrame = 0;
        this.nextAnimations = names;
        this.playing = true;
    }

    cancelAndPlay(cancel:Array<String>, name: String): Boolean{
        if(cancel.includes(this.currentAnimationName)){
            this.play(name);
            return true;
        }
        return false;
    }

    cancelAndPlayMultiple(cancel:Array<String>, names: Array<String>): Boolean{
        if(cancel.includes(this.currentAnimationName)){
            this.playMultiple(names);
            return true;
        }
        return false;
    }

    render(ctx: CanvasRenderingContext2D, dt: number, t: Transform){
        if(!this.currentAnimation.loop && this.currentAnimation.currentFrame >= this.currentAnimation.maxFrame ){
            if(this.nextAnimations.length > 0){
                this.currentAnimationName = this.nextAnimations.shift()
                this.currentAnimation = this.animations.get(this.currentAnimationName);
                this.currentAnimation.currentFrame = 0;
            }else{
                this.playing = false;
            }
        }

        this.currentAnimation.render(ctx, dt, t, this.flipx);
    }
}

export {Animation, Animator};