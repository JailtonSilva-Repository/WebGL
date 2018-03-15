let targetElm;
let sensitivity;

let clicked = false;
let previousX = 0;
let previousY = 0;
let offsetX = 0;
let offsetY = 0;
let movedX = 0;
let movedY = 0;

let mouseLook = {  
    setMouseLook: function(target, sens){
        targetElm = target;
        sensitivity = sens;
        movedX = 0;
        movedY = 0;
        targetElm.addEventListener("mousedown", this.mouseDown, false);
        document.addEventListener("mousemove", this.mouseMove, false);
        document.addEventListener("mouseup", this.mouseUp, false);
    },
    
    
    mouseDown: function(event){
        event.preventDefault();
    
        clicked = true;
    
        previousX = event.clientX;
        previousY = event.clientY;
    },
    
    mouseMove: function(event){
        event.preventDefault();
        if (clicked == true){
    
            let aspect = targetElm.width / targetElm.height;
            //let multiplyerX = Math.abs(aspect*(1000/window.innerWidth));
            //let multiplyerY = Math.abs(aspect*(1000/window.innerWidth));
            let multiplyerX = Math.abs(aspect*(targetElm.height / 500));
            let multiplyerY = Math.abs(aspect*(targetElm.width / 500));
    
            offsetX = -(previousX - event.clientX) * sensitivity*multiplyerX/2;
            offsetY = (previousY - event.clientY) * sensitivity*multiplyerY/2;
    
            movedX += offsetX;
            movedY += offsetY;
    
            previousX = event.clientX;
            previousY = event.clientY;
        }
    },
    
    mouseUp: function(event){
        event.preventDefault();
        offsetX = 0;
        offsetY = 0;
        clicked = false;
    }
}

/*let sensitivity;

let clicked;
let previousX;
let previousY;
let offsetX;
let offsetY;
let movedX;
let movedY;

function setMouseLook(targetElm, sens){
    sensitivity = sens;
    movedX = 0;
    movedY = 0;
    targetElm.addEventListener("mousedown", mouseDown, false);
    document.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("mouseup", mouseUp, false);
}


function mouseDown(event){
    event.preventDefault();

    clicked = true;

    previousX = event.clientX;
    previousY = event.clientY;
}

function mouseMove(event){
    event.preventDefault();
    if (clicked == true){

        let aspect = window.innerWidth / window.innerHeight;
        let multiplyerX = Math.abs(aspect*(1000/window.innerWidth));
        let multiplyerY = Math.abs(aspect*(1000/window.innerWidth));
        //console.log(window.innerHeight / window.innerWidth+" >> "+multiplyerY);

        offsetX = -(previousX - event.clientX) * sensitivity*multiplyerX;
        offsetY = (previousY - event.clientY) * sensitivity*multiplyerY;

        movedX += offsetX;
        movedY += offsetY;

        previousX = event.clientX;
        previousY = event.clientY;
    }
}

function mouseUp(event){
    event.preventDefault();

    clicked = false;
}*/