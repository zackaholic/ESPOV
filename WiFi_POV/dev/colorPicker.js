const colorPicker = (function (pickerElement) {

  function createPalette () {
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
    swatch.className = 'colorSwatch';
    parent.appendChild(swatch);
  }

  const mainPalette = {
    element : document.getElementById('mainPalette'),
    createSwatches: function(palette) {
      for (let i = 0; i < palette.length; i++) {
        createSwatch(palette[i], this.element);
      }
    },
    setup: function() {
      this.createSwatches(createPalette());
    }
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
    if (evt.target.className === 'colorSwatch') {
      const selection = evt.target.style.color;
      activeSwatch.color = selection;
      //setBorder(evt.target.style.color, activeColor);
      inUsePalette.add(selection);
      drawingCanvas.setDrawingColor(selection);
    }
  }
  //why are these named after mouse events? Pass in a function that does
  //the thing!
  function mouseOver(evt) {
//    if (evt.target != evt.currentTarget) {
     if (evt.target.className === 'colorSwatch') {
      activeSwatch.display(evt.target.style.color);
    } else {
      activeSwatch.display(activeSwatch.color);
    }
  }
  
  function mouseLeave(evt) {
    activeSwatch.display(activeSwatch.color);
  }

  pickerElement.addEventListener('mousedown', mouseDown, false);
  pickerElement.addEventListener('mouseover', mouseOver, false);
  pickerElement.addEventListener('mouseleave', mouseLeave, false);

  mainPalette.setup();

  const module = {};

  module.getActiveColor = function () {return activeSwatch.color;};

  return module;


}(document.getElementById('colorPicker')));



