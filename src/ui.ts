
class HealthBar{
    healthL : number = 22;
    healthR : number = 33;
    healthLDiv: HTMLDivElement;
    healthRDiv: HTMLDivElement;


    constructor(body: HTMLDivElement){
        let healthLDiv = document.createElement('div');
        healthLDiv.classList.add('health-bar');
        healthLDiv.classList.add('health-bar-left');



        let healthRDiv = document.createElement('div');
        healthRDiv.classList.add('health-bar');
        healthRDiv.classList.add('health-bar-right');

        body.appendChild(healthLDiv);
        body.appendChild(healthRDiv);

        this.healthLDiv = document.createElement('div');
        this.healthLDiv.classList.add('health-value');

        this.healthRDiv = document.createElement('div');
        this.healthRDiv.classList.add('health-value');

        healthLDiv.appendChild(this.healthLDiv);
        healthRDiv.appendChild(this.healthRDiv);

    }

    udpate(){
        this.healthLDiv.style.width = this.healthL + '%';
        this.healthLDiv.style.left = 50 - (100-this.healthL)/2 + '%';

        this.healthRDiv.style.width = this.healthR + '%';
        this.healthRDiv.style.left = 50 + (100-this.healthR)/2 + '%';
    }

}

class Timer{
    time: Number = 60;
    timerElement: HTMLDivElement
    constructor(body: HTMLDivElement){
        this.timerElement = document.createElement('div');
        this.timerElement.innerText = ("00" + this.time).slice(-2);
        this.timerElement.classList.add('timer');

        body.appendChild(this.timerElement);

    }

    update(time: Number){
        this.time = time;
        this.timerElement.innerText = ("00" + this.time).slice(-2);
    }
}


export {HealthBar, Timer};