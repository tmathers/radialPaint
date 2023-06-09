var canvasWidth = 0;
var canvasHeight = 0;
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
var bgColor = "#000";
var color = "#fff";

var currentPath = new Path2D();


var mouseDown = false;

function draw() {

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.strokeStyle = color
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
      ctx.strokeStyle = document.getElementById('color').value;
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

      drawPenPath(path);

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
    let path = new Path2D();
    path.moveTo(mouseX, mouseY);
    paths.push({points:[], color: document.getElementById('color').value, path: path});

    if (reflect) {
      let reflectedPath = new Path2D();
      reflectedPath.moveTo(canvasWidth - mouseX, mouseY);
      paths[paths.length - 1]['reflectedPath'] = reflectedPath;
    }
  }

  draw();
}

function endDraw(x, y) {
  if (isDrawing) {

    var path = {};
    path.color = document.getElementById('color').value;
    path.reflect = reflect;
    path.numAxii = numPoints;

    path.path = new Path2D();
    path.path.moveTo(startX, startY);
    path.path.lineTo(mouseX, mouseY);

    if (reflect) {
      path.reflectedPath = new Path2D();
      path.reflectedPath.moveTo(canvasWidth - startX, startY);
      path.reflectedPath.lineTo(canvasWidth - mouseX, mouseY);
    }

    paths.push(path);
    isDrawing = false;
  }

  draw();
  mouseDown = false;
}

function movePen(x, y) {
  if (hasLoaded) {
    mouseX = x - bounds.left;
    mouseY = y - bounds.top;

    if (drawMode() == 'line' && isDrawing) {
      draw();
    }

    if (drawMode() == 'pen' && mouseDown) {
      mark();
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


function mark() {

  var currentPenPath = paths[paths.length - 1];

  currentPenPath.path.lineTo(mouseX, mouseY);

  if (reflect) {
    currentPenPath.reflectedPath.lineTo(canvasWidth - mouseX, mouseY);
  }

  currentPenPath.reflect = reflect;
  currentPenPath.numAxii = numPoints;
}

function drawPenPath(path, reflect = false) {
  ctx.beginPath();
  ctx.strokeStyle = path.color;
  ctx.lineWidth = lineWidth;
  ctx.stroke(path.path);

  if ('reflectedPath' in path) {
    ctx.beginPath();
    ctx.stroke(path.reflectedPath);
  }
}

window.onload = function() {
  canvas = document.getElementById("canvas");
  setCanvasSize();
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
    mouseDown = false;
  }, false);
  
  document.addEventListener("keypress", onKeypress);

  document.getElementById('points').onchange = function(e) {
    numPoints = e.target.value;
  }
  document.getElementById('reflect').onchange = function(e) {
    reflect = e.target.checked;
  }

  document.getElementById('clear').onclick = function(e) {
    paths = [];
    draw();
  }
  document.getElementById('undo').onclick = function(e) {
    paths.pop();
    draw();
  }
  document.getElementById('bg-color').onchange = (e) => {
    bgColor = e.target.value;
    draw();
  }

  document.getElementById('points').value = numPoints;
  document.getElementById('reflect').checked = reflect;
  document.getElementById('line').checked = true;
  document.getElementById('bg-color').value = bgColor;

  bounds = canvas.getBoundingClientRect();
  ctx = canvas.getContext("2d");
  hasLoaded = true;

  draw();
}

function setCanvasSize() {

  const viewport = document.getElementById('viewport');
  const navbar = document.getElementById('navbar');
  const canvas = document.getElementById('canvas');

  const controls = document.getElementById('controls');
  const innerControls = document.getElementById('inner-controls');

  

  const width = viewport.clientWidth 
    
    //- getTotalWidth(controls)
    - 2; //border
  const height = window.innerHeight
    - navbar.clientHeight
    - getAdditionalHeight(navbar)
    - getAdditionalWidth(viewport)
    - 2; //border

  const margin = parseInt(getComputedStyle(viewport).getPropertyValue('padding-right'));

  const viewWidth = window.innerWidth - getAdditionalWidth(navbar);
  const viewHeight = window.innerHeight;

  
  // portrait
  if (viewWidth <  viewHeight) {
    canvasHeight = height - innerControls.clientHeight - getAdditionalHeight(innerControls) - margin;
    canvasWidth = width - getAdditionalWidth(viewport);

    controls.style.minWidth = "100%";
    controls.classList.add("mt-2");
    controls.classList.add("mt-sm-3");
    
  // Landscape
  } else {
    console.log("land")
    canvasHeight = height;
    canvasWidth = width - controls.clientWidth - getAdditionalWidth(controls) - margin - 2;
    controls.classList.add("ms-3");
  }


  //return width < height ? width : height;
}

function getAdditionalWidth(el) {
  return parseInt(getComputedStyle(el).getPropertyValue('padding-left')) 
    + parseInt(getComputedStyle(el).getPropertyValue('padding-right')) 
    + parseInt(getComputedStyle(el).getPropertyValue('margin-left')) 
    + parseInt(getComputedStyle(el).getPropertyValue('margin-right'))
    + parseInt(getComputedStyle(el).getPropertyValue('border-left-width'))
    + parseInt(getComputedStyle(el).getPropertyValue('border-right-width'));

}

function getAdditionalHeight(el) {
  return parseInt(getComputedStyle(el).getPropertyValue('padding-top')) 
    + parseInt(getComputedStyle(el).getPropertyValue('padding-bottom')) 
    + parseInt(getComputedStyle(el).getPropertyValue('margin-top')) 
    + parseInt(getComputedStyle(el).getPropertyValue('margin-bottom'))
    + parseInt(getComputedStyle(el).getPropertyValue('border-top-width'))
    + parseInt(getComputedStyle(el).getPropertyValue('border-bottom-width'));

}