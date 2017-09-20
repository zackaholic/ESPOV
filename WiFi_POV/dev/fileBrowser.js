const fileBrowser = (function (containerElement) {


  const files = {
    fileArray: [],
    createNew: function(image) {
      const entry = Object.create(fileEntry);
      entry.setup(image);
      this.fileArray.push(entry);
      containerElement.appendChild(entry.container);

      storage.save(newFile.name, newFile.image);

    }, 
    exists: function(id) {
      return this.fileArray.findIndex(function(e) {
        return e.image.id === id;
      });
    },
    add: function(newFile){

    },
    updateImage: function(file, index) {
      this.fileArray[index].replaceImage(file.data.slice(), file.width);
      //also overwrite local storage
      storage.save(file.id, file);

    },
    remove: function(name) {
      let i;
      if (i = this.exists(name) > -1) {
        this.fileArray.splice(i, 1);
      }
      storage.delete(name);
    },
    refresh: function () {
      //get list of filenames from server
      //compare with local storage
      //create file object if necessary with name only
      //later async load image data
      Client.get('http://192.168.42.81/getSavedFiles')
      .then(function (res) {       
        res.split('\n')
        .filter(function(e) {
          return e.length > 0})
        .map(function(e) {
          return e.replace('/img/', '')})
        .forEach(function(e) {
          if (files.exists(e) == -1) {
            files.createNew(e);     
          }         
        });        
      }, function (err) {
        console.log(err);
      });
    },     
  }

//this needs to happen async for every file created by name only
  function loadImageData(file) {
    console.log('Im getting image data for ' + file.name);
      console.log('loading: ' + file.name);
      Client.post('http://192.168.42.81/getImageData', `name=/img/${this.image.id}`)
      .then(function(res) {
        console.log(res);
        //try this out!
        //let data = res.split(',');
        //data.map(JSON.parse());
        //console.log(data);
        //file.image.data = data.slice();

        //now render preview canvas
      }, function (err) {
        console.log(err);
      });
    }      


  const fileEntry = { 
    setup: function(image) {
      //this seems fine?
      this.image = Object.assign({}, image);
      // this.image = {
      //   id: image.id,
      //   data: image.data.slice(),
      //   width: image.width,
      // };
      this.container = document.getElementsByClassName('fileEntryTemplate')[0].cloneNode(true);
      this.container.className = 'fileEntry';
      //inherited style from html overrides style from css file, making this step necessary
      this.container.style = ''; 
      this.innerElements = this.container.getElementsByTagName("*");
      this.previewCanvas = this.innerElements[0];

      this.innerElements[2].addEventListener('click', () => {this.edit()});
      this.innerElements[3].addEventListener('click', () => {this.load()});
      this.innerElements[4].addEventListener('click', () => {this.delete()});
      
      this.renderPreviewCanvas();

    },
    delete: function() {
      //TESTING//////////////////////////////////////// 
        //containerElement.removeChild(this.container);  
      //TESTING////////////////////////////////////////              
        //localStorage.removeItem(this.image.id);
      const file = this;
      Client.post('http://192.168.42.81/deleteFile', `name=/img/${file.image.id}`)
      .then(function (res) {
        console.log(res);
        console.log('deleting', file);        
        files.remove(file.image.id);
        containerElement.removeChild(file.container); 
      }, function (err) {
        console.log('Delete failed: ' + err);
      });
    },
    edit: function() {
      drawingCanvas.loadFile(this.image);
      console.log('editing', this);
    },   
    replaceImage: function(data, width) {
      this.image.data = data;
      this.image.width = width;

      this.renderPreviewCanvas();
    },
    load: function() {
      const file = this;
      console.log('loading', `name=/img/${file.image.id}`);
      Client.post('http://192.168.42.81/displaySaved', `name=/img/${file.image.id}`)
      .then(function (res) {
        console.log(res);
      }, function (err) {
        console.log(err);
      })
    },
    color8To24Bit: function(color) {
      const red = color & 0b11100000;
      const green = color & 0b00011100;
      const blue = color & 0b00000011;
      return `rgb(${red}, ${green}, ${blue})`;
    },
    renderPreviewCanvas: function() {
      const ctx = this.previewCanvas.getContext('2d');
      const scale = 2;
      this.image.data.forEach((value, index) => {
        ctx.fillStyle = value;
        ctx.fillRect(index % this.image.width * scale,
                     Math.floor(index / this.image.width) * scale,
                     scale, scale);
      });
    }
  }

  function newFileEntry(file) {
    const newEntry = Object.create(fileEntry);
    newEntry.setup(file.id, file.data.slice(), file.width);
    newEntry.add();
  }


  const module = {};

  module.addNew = function(image) {
    files.createNew(image);

  }

  module.updateExisting = function(image) {
    const index = files.exists(image.id);
    if (index > -1) {
      files.updateImage(image, index);
    } else {
      throw new Error('File cannot be updated because it doesn\'t exist');
    }
  }

  //module.refresh = fileList.refresh.bind(fileList);

  return module;

})(document.getElementById('fileBrowser'));

