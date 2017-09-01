const colorPicker = (function (pickerElement) {

  const inUsePalette = document.getElementById('inUsePalette');
  const mainPalette =  document.getElementById('mainPalette');
  const activeColorSwatch =  document.getElementById('activeColorSwatch');

  const selectionSwatches = {
    inUse: inUsePalette.getElementsByTagName('div'),
    main: mainPalette.getElementsByTagName('td')
  }

  let lastElements;
  let currentElements;  
  let inUseColors = [];
  let activeColor = '#000000';


  function createColorPalette () {
    const palette = [];
    let index = 0;
    for (let r = 0; r < 8; r++) {
      for (let g = 0; g < 8; g++) {
        for (let b = 0; b < 4; b++) {
          palette[index++] = `rgb(${r << 5}, ${g << 5}, ${b << 6})`;
        }
      }
    } 
    return palette;
  }

  function createMainPalette() {
    let row;
    let e;
    const colorPalette = createColorPalette();
    let swatches = document.createDocumentFragment();
    colorPalette.forEach((color, index) => {

      let swatch = document.createElement("div");
      swatch.style.color = color;
      swatch.style.backgroundColor = color;
      swatch.style.borderColor = color;

      swatches.appendChild(swatch);   
    });
    mainPalette.appendChild(swatches);
  }

  // function loadMainPalette() {
  //   let row;
  //   let e;
  //   const palette = createColorPalette();
  //   let swatches = document.createDocumentFragment();
    
  //   palette.forEach((color, index) => {
  //     if (index % 16 == 0){
  //       row = document.createElement("tr");
  //       swatches.appendChild(row);
  //       e = document.createElement("td");
  //       row.appendChild(e);
  //       e.style.color = color;
  //     } else {
  //       e = document.createElement("td");
  //       row.appendChild(e);
  //       e.style.color = color;
  //     } 
  //     e.style.backgroundColor =  color;
  //     e.style.borderColor = color;
   
  //   });
  //   mainPalette.appendChild(swatches);
  // }

  function setBorder(color, previousColor) {
    Array.prototype.forEach.call(selectionSwatches.inUse, (element) => {
      if (element.style.color === previousColor) {
        element.style.borderColor = element.style.color;
      }
      if (element.style.color === color) {
        element.style.borderColor = '#000000';
      }
    });
    Array.prototype.forEach.call(selectionSwatches.main, (element) => {
      if (element.style.color === previousColor) {
        element.style.borderColor = element.style.color;
      }
      if (element.style.color === color) {
        element.style.borderColor = '#000000';
      }      
    });
  }

  function addToInUsePalette(color) {
    if (inUseColors.includes(color) || inUseColors.length === 25 ||
        color === '#000000') {
      return;
    }
    let e = document.createElement("div");
    inUsePalette.appendChild(e);
    e.style.color = color;
    e.style.backgroundColor = color;
    e.style.borderColor = '#000000';
    inUseColors.push(color);
  }

  function clearInUsePalette() {
    while (inUsePalette.firstChild) {
      inUsePalette.removeChild(inUsePalette.firstChild);
    }
    //empty the array
    inUseColors.length = 0;
  }

  function mouseDown(evt) {
    //border logic is still funky. Will fail if called before new
    //drawing color is set
    //style.color returns an rgb encoded color in Chrome and IE. Maybe all browsers?
    activeColorSwatch.style.color = evt.target.style.color;
    setBorder(evt.target.style.color, activeColor);
    activeColor = evt.target.style.color;
    addToInUsePalette(activeColor);
  }

  function mouseOver(evt) {
    activeColorSwatch.style.backgroundColor = evt.target.style.color;
  }
  
  function mouseLeave(evt) {
    activeColorSwatch.style.backgroundColor = activeColor;
  }

  pickerElement.addEventListener('mousedown', mouseDown, false);
  pickerElement.addEventListener('mouseover', mouseOver, false);
  pickerElement.addEventListener('mouseleave', mouseLeave, false);

  const module = {};

  module.getActiveColor = function () {return activeColor;};

  createMainPalette();

  return module;


}(document.getElementById('colorPicker')));



