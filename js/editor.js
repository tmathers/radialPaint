var canvasWidth = 500;
var canvasHeight = 500;
var canvas = null;
var bounds = null;
var ctx = null;
var hasLoaded = false;

var startX = 0;
var startY = 0;
var mouseX = 0;
var mouseY = 0;
var isDrawing = false;
var existingLines = [];
var existingPenPaths = [];  

const ONE_THIRD_PI = 1.047198;
const PI = 3.14159;

var numPoints = 6;
var reflect = true;
var lineWidth = 2;


var drawMode = 'pen';
var mouseDown = false;

function draw() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.strokeStyle = "black";
  ctx.lineWidth = lineWidth;

  // mark center point
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, canvasHeight / 2, 1, 0, 2 * Math.PI, true);
  ctx.stroke();

  const ROTATE = PI / (numPoints / 2);

  for (var j = 0; j < numPoints; j++) {

    ctx.translate( canvasWidth / 2, canvasHeight / 2 );
    
    ctx.rotate(ROTATE * j);

    ctx.translate( -canvasWidth / 2, -canvasHeight / 2 );

    ctx.beginPath();

    for (var i = 0; i < existingLines.length; ++i) {
      var line = existingLines[i];
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);

    }

    for (i in existingPenPaths) {
      drawPenPath(existingPenPaths[i]);
    }

    ctx.stroke();


    if (isDrawing) {
      ctx.strokeStyle = "darkred";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(mouseX, mouseY); 

      if (reflect) {
        ctx.moveTo(  - startX + canvasWidth, startY);
        ctx.lineTo ( - mouseX + canvasWidth, mouseY );
      }
      ctx.stroke();
    }
  
    // Reset transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  if (reflect) {
    for (var j = 0; j < numPoints; j++) {

      ctx.translate( canvasWidth / 2, canvasHeight / 2 );
      ctx.rotate(ROTATE * j);
      ctx.translate( -canvasWidth / 2, -canvasHeight / 2 );
  
      ctx.beginPath();

      for (var i = 0; i < existingLines.length; ++i) {
          var line = existingLines[i];
          ctx.moveTo(  - line.startX  + canvasWidth, line.startY);
          ctx.lineTo ( - line.endX + canvasWidth,   line.endY );
      }

      for (i in existingPenPaths) {
        drawPenPath(existingPenPaths[i], true);
      }
  
      ctx.stroke();

      // Reset transformation matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
}

function onmousedown(e) {
  if (hasLoaded && e.button === 0) {

    if (drawMode == 'line') {
      if (!isDrawing) {
        startX = e.clientX - bounds.left;
        startY = e.clientY - bounds.top;

        isDrawing = true;
      }
    }
  }
  mouseDown = true;

  if (drawMode == 'pen') {
    findxy('down', e);
  }

  draw();
}

function onmouseup(e) {
  if (hasLoaded && e.button === 0) {
    if (isDrawing) {
      existingLines.push({
        startX: startX,
        startY: startY,
        endX: mouseX,
        endY: mouseY
      });

      isDrawing = false;
    }

    draw();
  }
  mouseDown = false;

  if (drawMode == 'pen') {
    findxy('up', e);
  }
}

function onmousemove(e) {
  if (hasLoaded) {
    mouseX = e.clientX - bounds.left;
    mouseY = e.clientY - bounds.top;


    if (drawMode == 'line' && isDrawing) {
      draw();
    }

    if (drawMode == 'pen') {
      findxy('move', e);
      draw();
    }
  }
}

function onKeypress(e) {

  // delete last line
  if (e.code == 'KeyU') {
    existingLines.pop();
    draw();
  }

}

window.onload = function() {
  canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.onmousedown = onmousedown;
  canvas.onmouseup = onmouseup;
  canvas.onmousemove = onmousemove;

  canvas.addEventListener("mouseout", function (e) {
    findxy('out', e)
  }, false);
  
  document.addEventListener("keypress", onKeypress);

  document.getElementById('points').value = numPoints;
  document.getElementById('reflect').checked = reflect;
  document.getElementById('line').checked = true;

  document.getElementById('points').onchange = function(e) {
    numPoints = e.target.value;
  }
  document.getElementById('reflect').onchange = function(e) {
    reflect = e.target.checked;
  }

  bounds = canvas.getBoundingClientRect();
  ctx = canvas.getContext("2d");
  hasLoaded = true;

  draw();
}



flag = false,
prevX = 0,
currX = 0,
prevY = 0,
currY = 0;


function mark() {
  var currentPenPath = existingPenPaths[existingPenPaths.length - 1];
  currentPenPath.points.push({
    
    x: currX,
    y: currY
  });
}

function drawPenPath(path, reflect = false) {
  ctx.beginPath();

  for (i in path.points) {
    p = path.points[i];

    const x = reflect ? -p.x + canvasWidth : p.x;
    const y = p.y

    if (i == 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

  }
  ctx.strokeStyle = path.color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

}


function findxy(res, e) {
  if (res == 'down') {
      existingPenPaths.push({points:[], color: document.getElementById('color').value});
      prevX = currX;
      prevY = currY;
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;

      flag = true;
      ctx.beginPath();
      ctx.fillStyle = document.getElementById('color').value;
      ctx.fillRect(currX, currY, 2, 2);
      ctx.closePath();
  }
  if (res == 'up' || res == "out") {
      flag = false;
  }
  if (res == 'move') {
      if (flag) {
          prevX = currX;
          prevY = currY;
          currX = e.clientX - canvas.offsetLeft;
          currY = e.clientY - canvas.offsetTop;
          mark();
      }
  }
}

function drawMode() {
  return 
}