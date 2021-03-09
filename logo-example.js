document.addEventListener("DOMContentLoaded", function(){
    
    //create fullsize canvas element
    var body = document.body
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    var width = body.offsetWidth;
    var height = body.offsetHeight;
    canvas.setAttribute("height", height);
    canvas.setAttribute("width", width);
    body.appendChild(canvas);
    
    buildLogo(canvas);
});

function buildLogo(canvas) {
    var LC = new LatticeCanvas(canvas, 40);
    var stage = 3;    
    var matrix = LC.getPointMatrix(stage);

    //top bar
    for (var i=-2; i<=2; i++) {
        var p = LC.getPoint2(stage, 0, i);
        var t = p.getTriangle();
        LC.fill(t, "black");
    }
    
    //rowlimit
    var rowLimit = LC.getStageParams(stage).rows;
    
    //left
    var r = 1;
    var o = -3;
    do {
        var p = LC.getPoint2(stage, r, o);
        var t = p.getTriangle();
        LC.fill(t, "black");
        if (p.orientation) {
            r++;
        } else {
            o++;
        }
    } while (r < rowLimit);
    
    //right
    var r = 1;
    var c = 3;
    
    do {
        var p = LC.getPoint2(stage, r, c);
        var t = p.getTriangle();
        if (p.orientation) {
            LC.fill(t, "black");
            r++;
        } else {
            c--;
        }
    } while (r <= rowLimit );
    
    stage = 4;
    
    var startPoints = [
        5,
        6,
        7,
        8,
        8,
        7,
        6,
        5
    ];
    
    for (var i=0; i<startPoints.length; i++) {
        var c = startPoints[i];
        var p = LC.getPoint(stage, i, c);
        while ( p.inBounds() ) {
            var t = p.getTriangle();
            LC.stroke(t, "black", 1)
            p = p.step("right");
        }       
    }
    
    //title
    var ctx = canvas.getContext("2d");
    ctx.font = "40px monospace";
    ctx.fillStyle = "#3333333";
    ctx.textAlign = "center";
    ctx.fillText("LatticeCanvas.js", canvas.width/2, canvas.height/2);
    
    ctx.font = "20px monospace";
    ctx.textAlgin = "center";
    ctx.fillText("Version: 1.0", canvas.width/2, canvas.height/2+30);
    
}