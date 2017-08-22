/*
Drawing canvas module manages displaying the image and
the canvas drawing interface. The actual image data is 
managed by the main app module
*/
const drawingCanvas = (function (canvas) {
  const module = {};
  const ctx = canvas.getContext('2d');
  let pixelSize = 30;
  let width;
  let height;

  module.getElement = () => {
    return canvas;
  }

  module.pixelIndexFromCoordinates = (xCanvasCoord, yCanvasCoord) => {
    const x = Math.floor(xCanvasCoord / pixelSize);
    const y = Math.floor(yCanvasCoord / pixelSize);
    return y * width + x;
  }

  module.setPixelSize = (size) => {
    //use pixelsize to implement scaling- increase size and redraw
    //offset pixels vertically or horizontally to achieve scrolling
    pixelSize = size;
  }

  module.clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);    
  }

  module.initializeCanvas = (xPixels, yPixels) => {
    //pixels here refers to giant drawing pixels, not screen pixels
    width = xPixels;
    height = yPixels;
  }

  module.drawPixel = (index, color) => {
    ctx.fillStyle = color;
    let x = index % width;
    let y = Math.floor(index / width);
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }

  module.drawCanvasFromBuffer = (buff) => {
    buff.forEach((value, index) => {
      module.drawPixel(index, value);
    }) 
  }

  return module;

}(document.getElementById("drawingCanvas")));

       // function drawingCanvas(rows, cols, canvas) {
       //   const pixelBuffer = new Uint8Array(rows * cols);
       //   const canvas = canvas;
//         const ctx = canvas.getContext('2d');
//         let pixelSize = 30;
//         const canvasRows = rows;
            //rows and columns set by app???

//         var imgWidth = cols; //display width measured in 'pov pixels' (not screen pixels)
//         const canvasColumns = cols;
         // let drawing;
         // let drawColor;

         // this.generateUploadString = function(fileName) {
         //   var imgString = 'name=' + '/img/' + fileName + '&image=' + 
         //     this.getImgWidth() + '\n' + pixelsToString();
         //   return imgString;
         // }




