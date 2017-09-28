

const drawingCanvas = (function (canvasElement) {


  function getMousePos (evt) {
    const rect = canvasElement.getBoundingClientRect();
    return {
      x : evt.clientX - rect.left,
      y : evt.clientY - rect.top
    };
  }

  function coordinatesToPixelIndex (mouseCoords, pixelSize) {
    const x = Math.floor(mouseCoords.x / pixelSize);
    const y = Math.floor(mouseCoords.y / pixelSize);
    return y * canvas.cols + x;
  }

  function color8bitTo24bitRGB(color) {
    const red = color & 0b11100000;
    const green = color & 0b00011100;
    const blue = color & 0b00000011;

    return `rgb(${red}, ${green}, ${blue})`;
  }

  const canvas = {
    element: canvasElement,
    ctx : canvasElement.getContext('2d'),
//create image on demand instead of update a property    
//     image: (imageId, dataBuffer, imageWidth) => {
//       {id: imageId, data: dataBuffer, width: imageWidth}; 
//     }
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
      this.element.addEventListener('mousedown', this.mouseDown.bind(this));
      this.element.addEventListener('mouseup', this.mouseUp.bind(this));
      this.image.data.length = r * c;
      this.image.data.fill('rgb(0, 0, 0)');
    },
//     const clear = (context, canvas) => {
//       context.clearRect(0, 0, canvas.width, canvas.height);
//     }
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
      this.image.data.fill('rgb(0, 0, 0)');
      this.image.width = 30;
      this.clear();
    },
    loadImage: function(buff) {

    },
    //a more general drawable():
//     const contained = (coord, width, height, scale) {
//       return (coord.x < scale * width && coord.y < scale * height);
//     }

//     drawable: function (mousePos, pixelSize, cols) {
//       return (mousePos.x < pixelSize * cols && mousePos.y < pixelSize * rows);
//     }
    drawable: function (mousePos) {
      return (mousePos.x < this.pixelSize * this.cols && mousePos.y < this.pixelSize * this.rows);
    },
    drawPixel: function (index, color) {
      this.ctx.fillStyle = color;
      const x = index % this.cols;
      const y = Math.floor(index / this.cols);
      this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
      this.image.data[index] = color;
    },
//     const queryString = (params) => {
//       qs = '';
//       for (key in params) {
//         qs += `${key}=${params[key]}&`;
//       }
//       //now remove last '&' like qs.replace(/&$/);
//       return qs;
//     }
    get queryString() {
      const pixels = this.image.data.slice();
      pixels.map(rgbStringTo8Bit);

      return `name=/img/${this.image.id}
              &width=${this.image.width}
              &image=${pixels.join()}`
    }, 
    mouseMove: function(evt) {
      //check if lmb is pressed
      if (evt.buttons === 1) {
        const mousePos = getMousePos(evt);
        const index = coordinatesToPixelIndex(mousePos, this.pixelSize);
        if (this.drawable(mousePos)){
          this.drawPixel(index, this.drawingColor);
        }
      } else {
        //only got here is lmb was released outside of page- remove listener
        this.element.removeEventListener('mousemove', this.mouseMove)
      }
    },
    mouseDown: function(evt) {
      this.element.addEventListener('mousemove', this.mouseMove.bind(this));
      const mousePos = getMousePos(evt);

      if (this.drawable(mousePos)) {
        this.drawPixel(
          coordinatesToPixelIndex(mousePos, this.pixelSize),
          this.drawingColor
          );
      }
    },
    mouseUp: function(evt) {
      this.element.removeEventListener('mousemove', this.mouseMove);
    }
  }
  
  function rgbStringTo8Bit(color) {
    if (color === 'rgb(0, 0, 0)') {
      return 0;
    } else {
      const rgb = color.match(/[0-9]+/g);        
      return (+rgb[0] | (+rgb[1] >> 3) | (+rgb[2] >> 6));
    }
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
      canvas.image.id = canvas.image.id === 0
                        ? Date.now()
                        : canvas.image.id; 
      fileBrowser.add(canvas.image);
      canvas.reset();
      
  //     Client.post('http://192.168.42.81/saveFile', canvas.queryString)
  //     .then(function (res) {
  //       console.log(res);
  //       //if image successfully saved, add to file list
  //       fileBrowser.add(image);
  //       resetCanvas();
  //     }, function (err) {
  //       console.log(err);
  //     });
  //   }    
    }
  }
  saveButton.element.addEventListener('click', saveButton.saveFile.bind(saveButton));


  const module = {};



  module.loadImage = function (image) {
//    canvas.image = Object.assign({}, image);
    canvas.image = {
      id: image.id,
      data: image.data.slice(),
      width: image.width
    }
    canvas.redraw();
  }

  module.setDrawingColor = function(color) {
    canvas.setColor(color);
  }

  module.initialize = function (r, c) {
    canvas.initialize(r, c);
  }

  return module;

}(document.getElementById("drawingCanvas")));




