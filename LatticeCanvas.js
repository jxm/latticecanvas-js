/**
 * LatticeCanvas Javascript Library
 */


//constants accessed with class
const LATTICE_CANVAS_UPRIGHT = 1;
const LATTICE_CANVAS_INVERTED = 0;
const LATTICE_CANVAS_DEG30_X = 0.86602540378443864;

class LatticeCanvas {
    
    static canvas;
    static stageParams;
    static context;
    
    constructor(canvasElement, minRowHeight) { 
        this.canvas = canvasElement;
        this.context = canvasElement.getContext("2d");
        
        this.stageParams = new Array();
        
        //stage 1
        var s = new Object();
        var stage = 1;
        s.stage = stage;
        s.rows = 1;
        s.rowHeight = (3/4)*this.canvas.height;
        
        //inital point is the top row of the horizontal middle
        s.initOrientation = 0;  //triangle orientation; 0 = inverted, 1 = upright
        s.initY = this.canvas.height/2;
        
        //radius for stage 1
        s.radius = (1/2)*this.canvas.height;
        
        while (s.rowHeight >= minRowHeight) {
            this.stageParams.push(s);
            stage++;
            
            var s = new Object();
            s.stage = stage;
            s.rows = Math.pow(2, stage-1);
            s.rowHeight = this.canvas.height/s.rows;
            
            s.initOrientation = 1; //(stage)%2;
            
            var cofactor;
            if (s.initOrientation == 1) {
                cofactor = 2/3;
            } else if (s.initOrientation == 0) {
                cofactor = 1/3;
            }
               
            //cofactor 1/3 inverted : 2/3 upright
            //s.initY = s.rowHeight*(s.initOrientation+1)/3;
            s.initY = s.rowHeight*cofactor;
            s.radius = (2/3)*s.rowHeight;
        }
    }
    
    //return constants using the class
    static get UPRIGHT() {
        return LATTICE_CANVAS_UPRIGHT;
    }
    static get INVERTED() {
        return LATTICE_CANVAS_INVERTED;
    }
    static get DEG30_X() {
        return LATTICE_CANVAS_DEG30_X;
    }
    
    //row starts at 0
    getPoint2(stage, row, offset) {
        return this.getPoint(stage, row, offset);
    }
    
    //working on
    getPoint(stage, row, offset) {
        var x;
        var y;
        var sp = this.getStageParams(stage);
        
        //getXcoord
        var center = this.getCenter();
        x = center.x + offset*LatticeCanvas.DEG30_X*sp.radius;
        
        //get orientation
        var orientation = (sp.initOrientation+Math.abs(offset)+row)%2;
        
        var cofactor;
        if (orientation == 1) {
            cofactor = 2/3;
        } else {
            cofactor = 1/3;
        }
        
        //getYcoord
        if (1 == stage) {
            y = (1/4)*this.canvas.height+(cofactor*sp.rowHeight);
        } else {
            y = row*sp.rowHeight+(cofactor)*sp.rowHeight;
        }
        console.log("row: "+row);
        //TODO stage, row, and offset params should be in one argument as an array
        var p = new LatticeCanvasPoint(this, stage, x, y, orientation, row, offset);
        return p;
    }
    
    getPointMatrix(stage) {
        var matrix = new Array();
        var sp = this.getStageParams(stage);
        
        //get offset limit
        var xStep = LatticeCanvas.DEG30_X*sp.radius;
        var offsetLimit = Math.trunc( (xStep + this.canvas.width/2)/(xStep) );
        
        for (var r=0; r<sp.rows; r++) { //rows
            var row = new Array();
            for (var i=-offsetLimit; i<=offsetLimit; i++) {
                var cell = this.getPoint2(stage, r, i);
                row.push(cell);
            }
            matrix.push(row);
        }
        return matrix;
    }
    
    getMaxStage() {
        return (this.stageParams).length;
    }
    
    getStageParams(stage) {
        var key = stage-1;
        return this.stageParams[key];
    }
    
    getContext() {
        return this.canvas.getContext("2d");
    }
    
    getCenter() {
        var c = new Object();
        c.x = this.canvas.width/2;
        c.y = this.canvas.height/2;
        return c;
    }
    
    fill(pointArray, style) {
        var ctx = this.context;
        
        //start
        ctx.beginPath();
        ctx.moveTo(pointArray[0].x, pointArray[0].y);
        
        for (var i=1; i<pointArray.length; i++) {
            ctx.lineTo(pointArray[i].x, pointArray[i].y);
            console.log(i);
        }
        ctx.closePath();
        
        ctx.fillStyle = style;
        ctx.fill();
    }
    
    stroke(pointArray, style, lineWidth) {
        var ctx = this.context;
        
        ctx.beginPath();
        ctx.moveTo(pointArray[0].x, pointArray[0].y);
        
        for (var i=1; i<pointArray.length; i++) {
            ctx.lineTo(pointArray[i].x, pointArray[i].y);
            console.log(i);
        }
        ctx.closePath();
        
        ctx.strokeStyle = style;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

/**
 * A point converted from <stage, row, offset> ready to plot
 */
class LatticeCanvasPoint
{
    row;
    offset;
    x;
    y;
    stage;
    stageParams;
    orientation;
    latticeCanvasObject;
    radius;
    
    constructor(latticeCanvasObject, stage, x, y, orientation, row, offset) {
        this.row = row;
        this.offset = offset;
        this.x = x;
        this.y = y;
        this.stage = stage;
        this.orientation = orientation;
        this.stageParams = latticeCanvasObject.getStageParams(stage);
        this.radius = this.stageParams.radius;
        this.latticeCanvasObject = latticeCanvasObject;
    }
    
    /*** getters ***/
    get radius() {
        return this.stageParams.radius; //NOT WORKING
    }
    get context() {
        return latticeCanvasObject.context;
    }
    
    getTriangle() {
        console.log(this.stageParams)
        
        var returnPoints = new Array();
        
        var t1 = new Object(); //top or bottom point
        var t2 = new Object();
        var t3 = new Object();
        
        var radius = this.stageParams.radius;
        
        //t1
        t1.x = this.x;
        if (1 == this.orientation) { //upright
            t1.y = this.y - radius;
        } else {                        //inverted
            t1.y = this.y + radius;
        }
        
        //t2 & t3
        t2.x = this.x - this.stageParams.radius*Math.sqrt(3)/2;
        t3.x = this.x + this.stageParams.radius*Math.sqrt(3)/2;
        
        if (this.orientation) {
            t2.y = this.y + this.stageParams.radius/2;
            t3.y = this.y + this.stageParams.radius/2;
        } else {
            t2.y = this.y - this.stageParams.radius/2;
            t3.y = this.y - this.stageParams.radius/2;
        }
        
        returnPoints.push(t1);
        returnPoints.push(t2);
        returnPoints.push(t3);
        
        return returnPoints;
    }
    
    inBounds() {
        var margin = this.stageParams.radius*LatticeCanvas.DEG30_X;
        var leftLimit = -margin;
        var rightLimit = this.latticeCanvasObject.canvas.width + margin;
        var canvasHeight = this.latticeCanvasObject.canvas.height;
        if (this.y <= canvasHeight && (this.x >= leftLimit && this.x <= rightLimit) )  
        {
            return true;
        } else {
            return false;
        }
    }
    
    //directions: left, right, downright, downleft, upright, upleft
    //negative cofactor points in the opposite direction
    //cofactor > 1 steps multiple cells
    step(direction, cofactor = 1) {
        var rowadd = 0;
        var offsetadd =0;
        var point; //return value
        
        if ("left" == direction) {
            offsetadd = -1*cofactor;
        } else if ("right" == direction) {
            offsetadd = cofactor;
        } else if ("downright" == direction) {
            rowadd = cofactor;
            offsetadd = cofactor;
        } else if ("downleft" == direction) {
            rowadd = cofactor;
            offsetadd = -cofactor;
        } else if ("upright" == direction) {
            rowadd = -cofactor;
            offsetadd = cofactor;
        } else if ("upleft" == direction) {
            rowadd = -cofactor;
            offsetadd = cofactor;
        } else {
            //TODO throw error
        }
        
        point = this.latticeCanvasObject.getPoint(this.stage, this.row+rowadd, this.offset+offsetadd);
        
        //TODO maybe check if point is inbounds and return false if not
        return point;
    }
}