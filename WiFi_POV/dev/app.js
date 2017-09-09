
const App = (function () {
  const module = {};

  function qsToObject(qs) {
    const obj = {};
    const pairs = qs.match(/(\w+=[\w|\d]+)/g);

    pairs.forEach(function(e) {
      keyVal = e.split('=');
      obj[keyVal[0]] = keyVal[1];
    });
    return obj;
  }

    //here just for testing
     drawingCanvas.initialize(36, 30);


  module.initialize = function () {
    Client.get('http://192.168.42.81/canvasInit')
    .then(function (res) {
      const canvasInit = qsToObject(res);
      drawingCanvas.initialize(canvasInit.rows, 30);
      //don't need to return anything here, right??? this is chaining not forking???
    }, 
    function (err) {
      console.log(err);
    })
    //initialize file system
    .then(function() {
      /*ESP8266 probably can't create a string containing ALL file data,
        so probably get all file names, then get image data for each asyncronously
        (think I already have methods for doing so)
      */
      fileBrowser.refresh();
    }, 
    function (err) {
      console.log(err);
    });
  }

  return module;
}());

//App.initialize();
