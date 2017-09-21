

const drawingCanvas = (function (canvasElement) {


  function getMousePos (evt) {
    const rect = canvasElement.getBoundingClientRect();
    return {
      x : evt.clientX - rect.left,
      y : evt.clientY - rect.top
    };
  }

  function pixelIndexFromCoordinates (mouseCoords) {
    const x = Math.floor(mouseCoords.x / canvas.pixelSize);
    const y = Math.floor(mouseCoords.y / canvas.pixelSize);
    return y * canvas.cols + x;
  }


  


  function color8bitTo24bitRGB(color) {
    const red = color & 0b11100000;
    const green = color & 0b00011100;
    const blue = color & 0b00000011;

    return `rgb(${red}, ${green}, ${blue})`;
  }

  function padArray(arr, len) {
    const paddedArr = arr.slice();
    for(let i = 0; i < len; i++) {
      if (paddedArr[i] === undefined) {
        paddedArr[i] = 'rgb(0, 0, 0)';
      }    
    }
    return paddedArr;    
  }

  const canvas = {
    element: canvasElement,
    ctx : canvasElement.getContext('2d'),
    image : {
      id: 0,
      data: [],
      width: 30
    },
    pixelSize: 20,
    drawingColor: 'rgb(0, 0, 0)',
    rows: 0,
    cols: 0,

    initialize: function(r, c) {
      this.rows = r;
      this.cols = c;
      this.element.addEventListener('mousedown', this.mouseDown);
      this.element.addEventListener('mouseup', this.mouseUp);
    },
    clear: function() {
      this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    },
    setColor: function(color) {
      this.drawingColor = color;
    },
    redraw: function() {
      this.clear();
      this.image.data.forEach((value, index) => {
        this.drawPixel(index, value);
      })
    },
    reset: function() {
      this.image.id = 0;
      this.image.data.length = 0;
      this.image.width = 30;
      this.clear();
    },
    loadImage: function(buff) {

    },
    drawable: function (mousePos) {
      return (mousePos.x < this.pixelSize * this.cols && mousePos.y < this.pixelSize * this.rows);
    },
    drawPixel: function (index) {
      if (this.image.data[index] !== this.drawingColor) {
        this.ctx.fillStyle = this.drawingColor;

        const x = index % this.cols;
        const y = Math.floor(index / this.cols);
//      if (x <= cols && y <= rows){
        this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
        this.image.data[index] = this.drawingColor;
//      }
      }
    },
    mouseMove: function(evt) {
      //check if lmb is pressed
      if (evt.buttons === 1) {
        const mousePos = getMousePos(evt);
        const index = pixelIndexFromCoordinates(mousePos);
        if (canvas.drawable(mousePos)){
          this.drawPixel(index);

          //const pixelIndex = pixelIndexFromCoordinates(mousePos);
          // if (image.data[pixelIndex] !== drawingColor) {
          //   image.data[pixelIndex] = drawingColor;
          //   drawPixel(pixelIndex, drawingColor);
          // }
        }
      } else {
        //only got here is lmb was released outside of page- remove listener
        this.removeEventListener('mousemove', this.mouseMove)
      }
    },
    mouseDown: function(evt) {
      //'this' value is canvas element
      this.addEventListener('mousemove', this.mouseMove);
      const mousePos = getMousePos(evt);

      if (canvas.drawable(mousePos)) {
        canvas.drawPixel(pixelIndexFromCoordinates(mousePos));

        // if (image.data[pixelIndex] === drawingColor) {
        //   return;
        // }
        
        // image.data[pixelIndex] = drawingColor;
        // drawPixel(pixelIndex, drawingColor);
      }
    },
    mouseUp: function(evt) {
      this.removeEventListener('mousemove', this.mouseMove);
    }
  }
  
  function exportImage() {
    //image data array will be ragged- loop through every index
    const pixels = image.data.slice();

    for(let i = 0; i < rows * cols; i++) {
      if (pixels[i] === undefined || pixels[i] === 'rgb(0, 0, 0)') {
        pixels[i] = 0;
      } else {
        const rgb = pixels[i].match(/[0-9]+/g);        
        var red = +rgb[0];
        var green = +rgb[1];
        var blue = +rgb[2];
        var color8 = (rgb[0]) | (green >> 3) | blue >> 6;
        pixels[i] = color8;        
      }
    }
    return `name=/img/${image.id}
            &width=${image.width}
            &image=${pixels.join()}`
  }





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

    element: document.getElementById('fileSaveButton'),
    saveFile: function() {
      //TESTING//////////////////////////////////////
      // for (let i = 0; i < rows * cols; i++) {
      //   image.data[i] = image.data[i] === undefined
      //                 ? 'rgb(0, 0, 0)'
      //                 : image.data[i];
      // }
      // if (image.id === 0) {
      //   image.id = Date.now();
      //   fileBrowser.addNew(image);
      //   resetCanvas();
      // } else {
      //   fileBrowser.updateExisting(image);
      //   resetCanvas();
      // }
      //TESTING////////////////////////////////////// 
      padImageForSaving();

      let overwriting = false;
      if (image.id > 0) {
        overwriting = true;        
      } else {
        image.id = Date.now();
      }

      Client.post('http://192.168.42.81/saveFile', createUploadString())
      .then(function (res) {
        console.log(res);
        //if image successfully saved, add it to file list or update existing
        if (overwriting) {
          fileBrowser.updateExisting(image);
          resetCanvas();
        } else {
          fileBrowser.addNew(image);
          resetCanvas();          
        }
      }, function (err) {
        console.log(err);
      });
    }    
  }
  saveButton.element.addEventListener('click', saveButton.saveFile.bind(saveButton));


  const module = {};



  module.loadFile = function (file) {
    image.id = file.id;
    image.data = file.data.slice();
    image.width = file.width;

    redrawCanvas();
  }

  module.setDrawingColor = function(color) {
    canvas.setColor(color);
  }

  module.initialize = function (r, c) {
    canvas.initialize(r, c);
  }

  return module;

}(document.getElementById("drawingCanvas")));




