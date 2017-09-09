const fileBrowser = (function (containerElement) {

  const files = [];

  // const deleteButton = {
  //   reqURL: 'http://192.168.42.81/deleteFile',
  //   element: document.getElementById('fileDeleteButton'),
  //   requestDelete: function () {
  //       const fileName = document.getElementById('fileDropdown').value;
  //       const data = 'image=/img/' + fileName; 
  //     Client.post(this.reqURL, data).then(function (res) {
  //       console.log(res);
  //       fileList.remove(fileName);
  //     }, function (err) {
  //       console.log('Delete failed: ' + err);
  //     });
  //   }
  // }
  // deleteButton.element.addEventListener('click', deleteButton.requestDelete.bind(deleteButton));

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
      const name = document.getElementById('fileNameField').value;
      const data = 'name=/img/' + name + drawingCanvas.getImageString();
//just here to test
        const image = drawingCanvas.getImage();
        newFileEntry(image.name, image.data, image.columns);

      // Client.post(this.reqURL, data).then(function (res) {
      //   console.log(res);
      //   //if image successfully saved, add it to file list
      //   //(name will probably end up being Unix timestamp);
      //   const image = drawingCanvas.getImage();
      //   newFileEntry(image.name, image.data, image.columns);
      //   document.getElementById('fileNameField').value = '';         
      // }, function (err) {
      //   console.log(err);
      // });
    }    
  }
  saveButton.element.addEventListener('click', saveButton.saveFile.bind(saveButton));

  // const loadSavedButton = {
  //   reqURL: 'http://192.168.42.81/getFile',
  //   element: document.getElementById('fileLoadButton'),
  //   loadSave: function() {
  //     const path = 'name=/img/' + document.getElementById('fileDropdown').value;
  //     console.log('loading: ' + path);
  //     Client.post(this.reqURL, path).then(function(res) {
  //       console.log(res);
  //       //now load into drawing canvas?
  //     }, function (err) {
  //       console.log(err);
  //     });
  //   }
  // }
  // loadSavedButton.element.addEventListener('click', loadSavedButton.loadSave.bind(loadSavedButton));


  const fileEntry = { 
    setup: function(name, imageBuffer, cols) {
      this.name = name;
      this.image = {
        data: imageBuffer,
        columns: cols,
        rows: 0
      };
      this.container = document.getElementsByClassName('fileEntryTemplate')[0].cloneNode(true);
      this.container.className = 'fileEntry';
      //inherited style from html overrides style from css file, making this step necessary
      this.container.style = ''; 
      this.innerElements = this.container.getElementsByTagName("*");
      this.previewCanvas = this.innerElements[0];
//An arrow function does not create its own this, the this value of the enclosing execution context is used.      
      this.innerElements[2].addEventListener('click', () => {this.edit()});
      this.innerElements[3].addEventListener('click', () => {this.load()});
      this.innerElements[4].addEventListener('click', () => {this.delete()});

      this.renderPreviewCanvas();
    },
    loadImageData: function() {
      console.log('Im getting image data for ' + imagePath);
      //make server request
    },
    add: function() {
      files.push(this);
      containerElement.appendChild(this.container);
    },
    delete: function() {
      console.log('deleting', this);
    },
    edit: function() {
      drawingCanvas.loadImage(this.name, this.image);
      console.log('editing', this);
    },
    load: function() {
      console.log('loading', this);
    },
    color8To24Bit: function(color) {
      const red = color & 0b11100000;
      const green = color & 0b00011100;
      const blue = color & 0b00000011;
      return `rgb(${red}, ${green}, ${blue})`;
    },
    renderPreviewCanvas: function() {
      const ctx = this.previewCanvas.getContext('2d');
      this.image.data.forEach((value, index) => {
        ctx.fillStyle = value;
        //2 here is 2 pixels per data point. Maybe turn this into a property
        ctx.fillRect(index % this.image.columns * 2,
                     Math.floor(index / this.image.columns) * 2,
                     2, 2);
      });
    }
  }

  function newFileEntry(name, imageBuffer, cols) {
    const newEntry = Object.create(fileEntry);
    newEntry.setup(name, imageBuffer, cols);
    newEntry.add();
  }

  const fileList = {
    reqURL: 'http://192.168.42.81/getSavedFiles',
    element: document.getElementById('fileDropdown'),
    files: [],
    refresh: function () {
      Client.get(this.reqURL).then(function (res) {       
        res.split('\n')
        .filter(function(e) {
          return e.length > 0})
        .map(function(e) {
          return e.replace('/img/', '')})
        .forEach(function(e) {
          fileList.add(e);              
        });        
      }, function (err) {
        console.log(err);
      });
    },
    remove: function (filePath) {
      let index;
      if ((index = this.files.indexOf(filePath)) > -1) {
        this.files.splice(index, 1);
        this.element.remove(index);
      }
    },
    add: function (filePath) {
      this.files.push(filePath);
      const file = document.createElement('option');
      file.text = filePath;
      this.element.add(file);
    }
  }

  const module = {};

  module.refresh = fileList.refresh.bind(fileList);

  return module;

})(document.getElementById('fileBrowser'));

