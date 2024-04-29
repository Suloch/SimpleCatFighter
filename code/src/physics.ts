

class Transform{
    x: number = 0;
    y: number = 0;

    scale: number = 1;

    constructor(x: number, y: number, scale: number){
        this.x = x;
        this.y = y;
        this.scale = scale;
    }
}

class Velocity{
    x: number = 0;
    y: number = 0;
}

class World{
    objects: Array<Physics> = [];
    colliders: Array<BoxCollider> = [];

    checkCollision(){
        let n_objects = this.colliders.length;
        for(let i = 0; i < n_objects; i++){
            for(let j = i+1; j < n_objects; j++){
                if(this.colliders[i].active && this.colliders[j].active){
                    let box1xmin = this.colliders[i].physics.transform.x+this.colliders[i].offset.x;
                    let box2xmin = this.colliders[j].physics.transform.x+this.colliders[j].offset.x;
                    let box1ymin = this.colliders[i].physics.transform.y+this.colliders[i].offset.y;
                    let box2ymin = this.colliders[j].physics.transform.y+this.colliders[j].offset.y;
                    let box1xmax = this.colliders[i].physics.transform.x+this.colliders[i].offset.x+this.colliders[i].w;
                    let box2xmax = this.colliders[j].physics.transform.x+this.colliders[j].offset.x+this.colliders[j].w;
                    let box1ymax = this.colliders[i].physics.transform.y+this.colliders[i].offset.y+this.colliders[i].h;
                    let box2ymax = this.colliders[j].physics.transform.y+this.colliders[j].offset.y+this.colliders[j].h;
                    
                    
                    let xOverlap1 = box2xmax - box1xmin;
                    let xOveralp2 = box1xmax - box2xmin;
    
                    let yOverlap1 = box2ymax - box1ymin;
                    let yOverlap2 = box1ymax - box2ymin;
    
                    let xOverlap = Math.min(xOverlap1, xOveralp2);
                    let yOverlap = Math.min(yOverlap1, yOverlap2);
                    if(xOverlap > 0 && yOverlap > 0){
                        let maxOverlap: number, direction: string, factor: number = -1; 
                        if(xOverlap < yOverlap){
                            maxOverlap = xOverlap;
                            direction = 'X';
                            if(box1xmin < box2xmin){
                                factor = 1;
                            }
                        }else{
                            maxOverlap = yOverlap;
                            direction = 'Y';
                            if(box1ymin < box2ymin){
                                factor = 1;
                            }
                        }
    
                        
    
                        this.colliders[i].onCollision(this.colliders[j], factor*maxOverlap, direction);
                        this.colliders[j].onCollision(this.colliders[i], factor*-maxOverlap, direction);
                    }
                }
            }
        }
    }
}

const world = new World();

class BoxCollider{
    active = true;
    physics : Physics;
    offset: Transform =  new Transform(0, 0, 1);
    onCollision: Function = () => {};
    tag: String = '';

    h: number = 1;
    w: number = 1;

    show: Boolean = false;

    constructor(p: Physics, w:number, h:number, offx: number, offy: number){
        this.physics = p;
        this.offset.x = offx;
        this.offset.y = offy;
        this.w = w;
        this.h = h;
        world.colliders.push(this);
    }
    render(ctx: CanvasRenderingContext2D){
        if(this.show && this.active){
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.physics.transform.x+this.offset.x, this.physics.transform.y+this.offset.y, this.w, this.h);
        }

    }
};

class Physics{
    transform: Transform = new Transform(0, 0, 1);
    velocity: Velocity = new Velocity();
    gravity: number = 10;

    constructor(){
        world.objects.push(this);
    }

    update(dt: number){
        this.transform.x += this.velocity.x*dt/1000;
        this.transform.y += this.velocity.y*dt/1000;
        this.velocity.y += this.gravity*dt/1000; 
    }

    render(ctx: CanvasRenderingContext2D){
        // ctx.beginPath();
        // ctx.arc(this.transform.x, this.transform.y, 5, 0, 2 * Math.PI);
        // ctx.fillStyle = "red";
        // ctx.fill();
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = "blue";
        // ctx.stroke();
    }
}


export {Physics, world, BoxCollider, Transform};
