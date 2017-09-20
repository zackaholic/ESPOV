const colorPicker = (function (pickerElement) {

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

  function createSwatch(color, parent) {
    const swatch = document.createElement('div');
    swatch.style.color = color;
    swatch.style.backgroundColor = color;
    swatch.style.borderColor = color;
    parent.appendChild(swatch);
  }

  const mainPalette = {
    element : document.getElementById('mainPalette'),
    palette : createColorPalette(),
    createSwatches: function() {
      for (let i = 0; i < this.palette.length; i++) {
        createSwatch(this.palette[i], this.element);
      }
    },
    setup: function() {
      this.createSwatches();
    }
  }

  function addToInUsePalette(color) {

    let e = document.createElement("div");
    inUsePalette.appendChild(e);
    e.style.color = color;
    e.style.backgroundColor = color;
    e.style.borderColor = '#000000';
    inUseColors.push(color);
  }


  const inUsePalette = {
    element: document.getElementById('inUsePalette'),
    colors: [], 
    add: function(color) {
      /* How should this actually be handled?*/
      if (this.colors.includes(color) || color === 'rgb(0, 0, 0)') {
        return;
      }      
      createSwatch(color, this.element);
      this.colors.push(color);
    },
    clear: function() {
      this.colors.length = 0;
      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
    }
    
  }

  const activeSwatch ={
    element: document.getElementById('activeColorSwatch'),
    activeColor: 'rgb(0, 0, 0)',
    get color() {
      return this.activeColor;
    },
    set color(color) {
      this.activeColor = color;
      this.element.style.color = color;
    },
    display: function(color) {
      //which one???
      this.element.style.color = color;
      this.element.style.backgroundColor = color;
    }
  }



  // const selectionSwatches = {
  //   inUse: inUsePalette.getElementsByTagName('div'),
  //   main: mainPalette.getElementsByTagName('div')
  // }

  // let lastElements;
  // let currentElements;  
  // let inUseColors = [];
  // let activeColor = '#000000';


  //hi this is terrible
  // function setBorder(color, previousColor) {
  //   Array.prototype.forEach.call(selectionSwatches.inUse, (element) => {
  //     if (element.style.color === previousColor) {
  //       element.style.borderColor = element.style.color;
  //     }
  //     if (element.style.color === color) {
  //       element.style.borderColor = '#000000';
  //     }
  //   });
  //   Array.prototype.forEach.call(selectionSwatches.main, (element) => {
  //     if (element.style.color === previousColor) {
  //       element.style.borderColor = element.style.color;
  //     }
  //     if (element.style.color === color) {
  //       element.style.borderColor = '#000000';
  //     }      
  //   });
  // }



  function mouseDown(evt) {
    //border logic is still funky. Will fail if called before new
    //drawing color is set
    const newActive = evt.target.style.color;
    //style.color returns an rgb encoded color in Chrome and IE. Maybe all browsers?
    activeSwatch.color = newActive;
    //setBorder(evt.target.style.color, activeColor);
    //activeColor = evt.target.style.color;
    inUsePalette.add(newActive);
    drawingCanvas.setDrawingColor(newActive);
  }

  function mouseOver(evt) {
    activeSwatch.display(evt.target.style.color);
  }
  
  function mouseLeave(evt) {
    activeSwatch.display(activeSwatch.color);
  }

  pickerElement.addEventListener('mousedown', mouseDown, false);
  pickerElement.addEventListener('mouseover', mouseOver, false);
  pickerElement.addEventListener('mouseleave', mouseLeave, false);

  const module = {};

  module.getActiveColor = function () {return activeSwatch.color;};

  //like this: initializePalette(function(){return palette;});
  mainPalette.setup();

  return module;


}(document.getElementById('colorPicker')));



