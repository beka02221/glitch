var D = document,
    w = window,
    delayed = setTimeout,
    shittyMode, // undefined by default
    C, // canvas
    R, // canvas context
    W, // world
    P, // player
    V, // camera
    PI = Math.PI,
    raf = (function(){
        return  w.requestAnimationFrame       ||
                w.webkitRequestAnimationFrame ||
                w.mozRequestAnimationFrame    ||
                function(c){
                    delayed(c, 1000 / 60);
                };
    })(),
    CANVAS_WIDTH = 920,
    CANVAS_HEIGHT = 920;
