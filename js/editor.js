var canvasWidth = getCanvasSize();
var canvasHeight = getCanvasSize();
var canvas = null;
var bounds = null;
var ctx = null;
var hasLoaded = false;

var startX = 0;
var startY = 0;
var mouseX = 0;
var mouseY = 0;
var isDrawing = false;
var paths = [];  

const ONE_THIRD_PI = 1.047198;
const PI = 3.14159;

var numPoints = 6;
var reflect = true;
var lineWidth = 2;


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


    if (isDrawing) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
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

  for (i in paths) {

    const path = paths[i];
    const ROTATE2 = PI / (path.numAxii / 2);
  
    for (var j = 0; j < path.numAxii; j++) {

      ctx.translate( canvasWidth / 2, canvasHeight / 2 );
      ctx.rotate(ROTATE2 * j);
      ctx.translate( -canvasWidth / 2, -canvasHeight / 2 );
  
      ctx.beginPath();

      drawPenPath(path);
      
      if (path.reflect) {
        drawPenPath(path, true);
      }
  
      ctx.stroke();

      // Reset transformation matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
}


function drawMode() {
  return document.getElementById('line').checked ? 'line' : 'pen'
}


function startDraw(x, y) {
  if (drawMode() == 'line') {
    if (!isDrawing) {
      startX = x - bounds.left;
      startY = y - bounds.top;

      isDrawing = true;
    }
  }
  mouseDown = true;

  if (drawMode() == 'pen') {
    findxy('down', x, y);
  }

  draw();
}

function endDraw(x, y) {
  if (isDrawing) {

    var path = {points: []};
    path.points.push({
      x: startX,
      y: startY
    });
    path.points.push({
  
      x: mouseX,
      y: mouseY
    });

    path.color = document.getElementById('color').value;
    path.reflect = reflect;
    path.numAxii = numPoints;

    paths.push(path);
    isDrawing = false;
  }

  draw();
  mouseDown = false;

  if (drawMode() == 'pen') {
    findxy('up', x, y);
  }
}

function movePen(x, y) {
  if (hasLoaded) {
    mouseX = x - bounds.left;
    mouseY = y - bounds.top;


    if (drawMode() == 'line' && isDrawing) {
      draw();
    }

    if (drawMode() == 'pen') {
      findxy('move', x, y);
      draw();
    }
  }
}

function onKeypress(e) {

  // delete last line
  if (e.code == 'KeyU') {
    paths.pop();
    draw();
  }

}

flag = false,
prevX = 0,
currX = 0,
prevY = 0,
currY = 0;


function mark() {
  var currentPenPath = paths[paths.length - 1];
  currentPenPath.points.push({
    
    x: currX,
    y: currY
  });

  currentPenPath.reflect = reflect;
  currentPenPath.numAxii = numPoints;
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


function findxy(res, x, y) {
  if (res == 'down') {
      paths.push({points:[], color: document.getElementById('color').value});
      prevX = currX;
      prevY = currY;
      currX = x - canvas.offsetLeft;
      currY = y - canvas.offsetTop;

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
          currX = x - canvas.offsetLeft;
          currY = y - canvas.offsetTop;
          mark();
      }
  }
}

window.onload = function() {
  canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.onmousedown = function(e) {
    if (hasLoaded && e.button === 0) {
      startDraw(e.clientX, e.clientY);
    }
  };
  canvas.onmouseup = function(e) {
    if (hasLoaded && e.button === 0) {
      endDraw(e.clientX, e.clientY);
    }
  };
  canvas.onmousemove = function(e) {
    movePen(e.clientX, e.clientY);
  };

  canvas.addEventListener("touchstart", function(e) { 
    const touch = e.changedTouches[0];
    startDraw(touch.pageX, touch.pageY);
  });
  canvas.addEventListener("touchend", function(e) { 
    const touch = e.changedTouches[0];
    endDraw(touch.pageX, touch.pageY);
  });
  canvas.addEventListener("touchmove", function(e) {  
    const touch = e.changedTouches[0];
    movePen(touch.pageX, touch.pageY);
  });

  canvas.addEventListener("mouseout", function (e) {
    findxy('out', e)
  }, false);
  
  document.addEventListener("keypress", onKeypress);

  document.getElementById('points').value = numPoints;
  document.getElementById('reflect').checked = reflect;
  document.getElementById('line').checked = true;
  document.getElementById('color').value = color

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

function getCanvasSize() {
  return window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
}