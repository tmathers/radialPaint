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

const ONE_THIRD_PI = 1.047198;

var reflect = true;

function draw() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  // mark center point
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, canvasHeight / 2, 1, 0, 2 * Math.PI, true);
  ctx.stroke();


  for (var j = 0; j < 6; j++) {

    ctx.translate( canvasWidth / 2, canvasHeight / 2 );
    
    ctx.rotate(ONE_THIRD_PI * j);
    //ctx.translate(dx,  dy);

    ctx.translate( -canvasWidth / 2, -canvasHeight / 2 );

    ctx.beginPath();

    for (var i = 0; i < existingLines.length; ++i) {
      var line = existingLines[i];
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);

    }

    ctx.stroke();
  

  //for (var j = 0; j < 6; j++) {
  // Reset transformation matrix to the identity matrix
  //ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (isDrawing) {
      ctx.strokeStyle = "darkred";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();

      if (false) {
        ctx.translate( canvasWidth / 2, canvasHeight / 2 );
        ctx.rotate(- ONE_THIRD_PI * j);
        ctx.beginPath();
        ctx.moveTo( startX, startY);
        ctx.lineTo(- mouseX, mouseY);
        ctx.stroke();
        ctx.translate( -canvasWidth / 2, -canvasHeight / 2 );
      }
    }
  
    // Reset transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  if (reflect) {
    for (var j = 0; j < 6; j++) {

      ctx.translate( canvasWidth / 2, canvasHeight / 2 );
      ctx.rotate(ONE_THIRD_PI * j);
      ctx.translate( -canvasWidth / 2, -canvasHeight / 2 );
  
      ctx.beginPath();
  
      for (var i = 0; i < existingLines.length; ++i) {
          var line = existingLines[i];
          ctx.strokeStyle = "#FF00FF";
          ctx.moveTo( line.startX, line.startY);
          ctx.lineTo ( - line.endX + canvasWidth,   line.endY );
      }
  
      ctx.stroke();
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);


}

function onmousedown(e) {
  if (hasLoaded && e.button === 0) {
    if (!isDrawing) {
      startX = e.clientX - bounds.left;
      startY = e.clientY - bounds.top;

      isDrawing = true;
    }

    draw();
  }
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
}

function onmousemove(e) {
  if (hasLoaded) {
    mouseX = e.clientX - bounds.left;
    mouseY = e.clientY - bounds.top;

    if (isDrawing) {
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
  document.addEventListener("keypress", onKeypress);

  bounds = canvas.getBoundingClientRect();
  ctx = canvas.getContext("2d");
  hasLoaded = true;

  draw();
}