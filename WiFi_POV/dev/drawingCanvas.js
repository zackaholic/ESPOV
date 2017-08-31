/*
All canvas drawing and interaction done here
Module API:
  -setup canvas based on physical hardware
  -get current image as pixel data 
  -load image from pixel data
*/

const drawingCanvas = (function (canvas) {
  const ctx = canvas.getContext('2d');
  const imageBuffer = [];  
  let pixelSize = 20;
  let drawingColor = 'rgb(0, 0, 0)';
  let rows;
  let cols;

  function getMousePos (evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x : evt.clientX - rect.left,
      y : evt.clientY - rect.top
    };
  }

  function pixelIndexFromCoordinates (mouseCoords) {
    const x = Math.floor(mouseCoords.x / pixelSize);
    const y = Math.floor(mouseCoords.y / pixelSize);
    return y * cols + x;
  }

  function setPixelSize (size) {
    pixelSize = size;
  }

  function clearCanvas () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);    
  }

  function drawPixel (index) {
    ctx.fillStyle = drawingColor;

    let x = index % cols;
    let y = Math.floor(index / cols);
    if (x <= cols && y <= rows){
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  function isDrawable (mousePos) {
    return (mousePos.x < pixelSize * cols && mousePos.y < pixelSize * rows);
  }
  
  function drawCanvasFromBuffer (buff) {
    buff.forEach((value, index) => {
      const color = color24BitToString(color8to24bit(value));
      drawPixel(index, value);
    }) 
  }

  function color8bitTo24bitRGB(color) {
    const red = color & 0b11100000;
    const green = color & 0b00011100;
    const blue = color & 0b00000011;

    return `rgb(${red}, ${green}, ${blue})`;
  }

  function color24To8Bit(color) {
    //color comes in 'rgb(255, 255, 255)' string
    //images will be mostly black- save some effort
    if (color === 'rgb(0, 0, 0)') {
      return 0;
    }
    const rgb = color.match(/[0-9]+/g);        
    var red = +rgb[0];
    var green = +rgb[1];
    var blue = +rgb[2];
    var color8 = (rgb[0]) | (green >> 3) | blue >> 6;
    return color8;
  }

  function canvasToString() {
    const pixelString = imageBuffer.map(color24To8Bit).join();
    return '&width=' + cols + '&image=' + pixelString;
  }

  function mouseMove(evt) {
    //check if lmb is pressed
    if (evt.buttons === 1) {
      const mousePos = getMousePos(evt);
      if (isDrawable(mousePos)){
        const pixelIndex = pixelIndexFromCoordinates(mousePos);

        if (imageBuffer[pixelIndex] !== drawingColor) {
          imageBuffer[pixelIndex] = drawingColor;
          drawPixel(pixelIndex, drawingColor);
        }
      }
    } else {
      //only got here is lmb was released outside of page- remove listener
      canvas.removeEventListener('mousemove', mouseMove)
    }
  }

  function mouseUp() {
    canvas.removeEventListener('mousemove', mouseMove);
  }

  function mouseDown(evt) {
    canvas.addEventListener('mousemove', mouseMove);
    const mousePos = getMousePos(evt);
    //set drawing color in case mouse moves into drawable area
    drawingColor = colorPicker.getActiveColor();
    
    if (isDrawable(mousePos)) {
      const pixelIndex = pixelIndexFromCoordinates(mousePos);

      if (imageBuffer[pixelIndex] === drawingColor) {
        return;
      }
      
      imageBuffer[pixelIndex] = drawingColor;
      drawPixel(pixelIndex, drawingColor);
    }
  }

  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);


  const module = {};

  module.getImageString = function () {
    return canvasToString();
  }

  module.loadImage = function (data) {
    drawCanvasFromBuffer(data);
  }

  module.initialize = function (r, c) {
    rows = r;
    cols = c;
    for (let i = 0; i < rows * cols; i++) {
      imageBuffer[i] = 'rgb(0, 0, 0)';
    }
  }

  return module;

}(document.getElementById("drawingCanvas")));




