const canvasModule = function () {
  let drawingColor = 'red';
  const module = {};

  module.getDrawColor = () => {
    return drawingColor;
  }

  module.setDrawColor = (value) => {
    drawingColor = color;
  }
  return module;
}();