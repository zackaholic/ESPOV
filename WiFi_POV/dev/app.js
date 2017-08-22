/*
Main app manages building and storing the actual image 
and communicating with the drawing / loading modules
*/

/*Create an array of undefineds of a specified length
(instead of empty array with a length value):
  cost a = Array.apply( null, { length: 3 } );
*/

const imageBuffer = [];

function canvasMouseMove(evt) {
  //could this event be throttled? Is this even a performace issue?

  //only called if mouse button is down
  //this check would be sufficient for draw/not draw but
  //unregistering listener is better for performance?
  //also necessary in case button is released off screen
  if (evt.buttons === 1) {
    const mouse = getMousePos(drawingCanvas.getElement(), evt);
    const pixelIndex = drawingCanvas.pixelIndexFromCoordinates(mouse.x, mouse.y);
    //everything from here on is duplicated in mouseDown...
    const drawingColor = colorPicker.getDrawingColor();
    if (imageBuffer[pixelIndex] === drawingColor) {
      return;
    }
    imageBuffer[pixelIndex] = drawingColor;
    drawingCanvas.drawPixel(pixelIndex, drawingColor);
  }
}

function canvasMouseUp() {
  drawingCanvas.getElement().removeEventListener("mousemove", canvasMouseMove);
}

function canvasMouseDown(evt) {
  const mouse = getMousePos(drawingCanvas.getElement(), evt);
  const pixelIndex = drawingCanvas.pixelIndexFromCoordinates(mouse.x, mouse.y);
  const drawingColor = colorPicker.getDrawingColor();
  //only listen for move event while mouse button is down
  drawingCanvas.getElement().addEventListener("mousemove", canvasMouseMove);
  
  if (imageBuffer[pixelIndex] === drawingColor) {
    return;
  }
  
  imageBuffer[pixelIndex] = drawingColor;
  drawingCanvas.drawPixel(pixelIndex, drawingColor);
}

function getMousePos(element, evt) {
  const rect = element.getBoundingClientRect();
  return {
    x : evt.clientX - rect.left,
    y : evt.clientY - rect.top
  };
}

const filesList = document.getElementById('fileDropdown');
const saveButton = document.getElementById('fileSaveButton');
const loadButton = document.getElementById('fileLoadButton');
const deleteButton = document.getElementById('fileDeleteButton');
saveButton.addEventListener('click', console.log);
loadButton.addEventListener('click', console.log);
deleteButton.addEventListener('click', console.log);


drawingCanvas.initializeCanvas(30, 20);
drawingCanvas.getElement().addEventListener('mousedown', canvasMouseDown);
drawingCanvas.getElement().addEventListener('mouseup', canvasMouseUp);

/*
        const clearButton = document.getElementById('fileUploadButton');    
        document.getElementById("clearButton").onclick = function() {
          Pixels.resetCanvas();
          Picker.clearColorsInUse();
        }  


        this.uploadPixels = function(pixelArray) {
         var fileName = document.getElementById("fileNameField").value;
         if (fileName.length > 70) {
           alert('File name must not exceed 70 characters');
           return;
         }       
         if (fileName.length === 0) {
           alert('Please enter a file name');
           return;
         } 
         if (document.getElementById(fileName)) {
           alert('A file by that name already exists');
           return;
         }
*/





