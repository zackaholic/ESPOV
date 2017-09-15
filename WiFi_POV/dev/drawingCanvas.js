

const drawingCanvas = (function (canvas) {
  const ctx = canvas.getContext('2d');
  const image = {
    id: 0,
    data: [],
    width: 30
  }
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

  function drawPixel (index, color) {
    ctx.fillStyle = color;

    let x = index % cols;
    let y = Math.floor(index / cols);
    if (x <= cols && y <= rows){
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  function isDrawable (mousePos) {
    return (mousePos.x < pixelSize * cols && mousePos.y < pixelSize * rows);
  }
  
  function redrawCanvas (buff) {
    clearCanvas();
    image.data.forEach((value, index) => {
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
    if (color === 'rgb(0, 0, 0)' || color === undefined) {
      //shave a little time- most images contain mostly black
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
    const pixelString = image.data.map(color24To8Bit).join();
    return '&width=' + cols + '&image=' + pixelString;
  }

  function mouseMove(evt) {
    //check if lmb is pressed
    if (evt.buttons === 1) {
      const mousePos = getMousePos(evt);
      if (isDrawable(mousePos)){
        const pixelIndex = pixelIndexFromCoordinates(mousePos);

        if (image.data[pixelIndex] !== drawingColor) {
          image.data[pixelIndex] = drawingColor;
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

    if (isDrawable(mousePos)) {
      const pixelIndex = pixelIndexFromCoordinates(mousePos);

      if (image.data[pixelIndex] === drawingColor) {
        return;
      }
      
      image.data[pixelIndex] = drawingColor;
      drawPixel(pixelIndex, drawingColor);
    }
  }

  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);

//preview sends image data with a predefined filename- overwriting last preview file
  const previewButton = {
    reqURL: 'http://192.168.42.81/saveFile',
    element: document.getElementById('filePreviewButton'),
    loadPreview: function() {
      const path = 'name=/img/preview';
      const data =  path + drawingCanvas.getImageString();
      Client.post(this.reqURL, data).then(function (res) {
        console.log(res);
      }, function (err) {
        console.log(err);
      });
    }
  }
  previewButton.element.addEventListener('click', previewButton.loadPreview.bind(previewButton));

  const saveButton = {
    reqURL: 'http://192.168.42.81/saveFile',
    element: document.getElementById('fileSaveButton'),
    saveFile: function() {
//just here to test
        //pad up the array
        for (let i = 0; i < rows * cols; i++) {
          image.data[i] = image.data[i] === undefined
                        ? 'rgb(0, 0, 0)'
                        : image.data[i];
        }
        if (image.id === 0) {
          image.id = Date.now();
          fileBrowser.addNew(image);
          resetCanvas();
        } else {
          fileBrowser.updateExisting(image);
          resetCanvas();
        }
      // Client.post(this.reqURL, data).then(function (res) {
      //   console.log(res);
      //   //if image successfully saved, add it to file list

        // const image = drawingCanvas.getImage();
        // files.createNew(image.name, image.data, image.columns);

      // }, function (err) {
      //   console.log(err);
      // });
    }    
  }
  saveButton.element.addEventListener('click', saveButton.saveFile.bind(saveButton));


  const module = {};


  function resetCanvas() {
    image.id = 0;
    image.data.length = 0;
    image.width = 30;
    clearCanvas();
  }

  module.createImage = function() {
    image.id = image.id > 0 ? image.id : Data.now();
    return image;
  }

  module.getImageString = function () {
    return canvasToString();
  }

  module.loadFile = function (file) {
    image.id = file.id;
    image.data = file.data.slice();
    image.width = file.width;

    redrawCanvas();
  }

  module.setDrawingColor = function(color) {
    drawingColor = color;
  }

  module.initialize = function (r, c) {
    rows = r;
    cols = c;
  }

  return module;

}(document.getElementById("drawingCanvas")));




