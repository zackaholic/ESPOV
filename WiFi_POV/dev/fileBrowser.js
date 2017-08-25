const fileBrowser = (function (containerElement) {
  const refreshFilesURL = 'getSavedFiles';
  const deleteFileURL = 'deleteFile';
  const saveFileURL = 'saveFile';
  const loadFileURL = 'loadFile';

  const fs = {
    get: function (url) {
      return new Promise(function (resolve, reject) {
        let req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function() {
          if (req.status === 200) {
            resolve(req.response);
          }
          else {
            reject(Error(req.statusText));
          }
        };

        req.onerror = function() {
          reject(Error('Error connecting to server'));
        };

        req.send();
      });
    },

    post: function (url, data) {
      return new Promise(function(resolve, reject) {
        let req = new XMLHttpRequest();
        req.open('POST', url);

        req.onload = function() {
          if (req.status === 200) {
            resolve(req.response);
          }
          else {
            reject(Error(req.statusText));
          }
        };

        req.onError = function() {
          reject(Error('Error connecting to server'));
        };

        req.send(data);
      });
    }
  }

  const deleteButton = Object.create(fs);
  deleteButton.element = document.getElementById('fileDeleteButton');
  deleteButton.deleteFile = function (filePath) {
    this.post(deleteFileURL, filePath).then((response) => {
      fileList.remove(filePath);
      console.log(response);
      //remove file from dropdown
    }, (error) => {
      console.log(error);
    });
  };
  deleteButton.element.addEventListener('click', deleteButton.deleteFile.bind(deleteButton));

//'save' is confusing here- this button is labeled 'upload'
  const saveButton = Object.create(fs);
  saveButton.element = document.getElementById('fileSaveButton');
  saveButton.saveFile = function (filePath, fileData) {
    const file = 'compose file here';
    this.post(saveFileURL, file).then((response) => {
      fileList.add(filePath);
      console.log(filePath);
    }, (error) => {
      console.log(error);

    });
  };
  saveButton.element.addEventListener('click', saveButton.saveFile.bind(saveButton));

  const loadSavedButton = Object.create(fs);
  loadSavedButton.element = document.getElementById('fileLoadButton');
  loadSavedButton.loadSaved = function (filePath) {
    console.log(this);
    this.get(loadFileURL).then((response) => {
      console.log(response);
      //drawingCanvas.loadImageFromBuffer(response) or something like that
    }, (error) => {
      console.log(error);
      return error;
    });
  };
  loadSavedButton.element.addEventListener('click', loadSavedButton.loadSaved.bind(loadSavedButton));

  const fileList = Object.create(fs);
  fileList.element = document.getElementById('fileDropdown');
  fileList.files = [];
  fileList.refresh = function () {
    this.get(refreshFilesURL).then((response) => {
      console.log(response);
      //response.split.forEach(this.addFile) or something
    }, (error) => {
      console.log(error);
    });
  }
  fileList.remove = function (filePath) {
    //will the array index of a file always match the dropdown index?
    let index;
    if ((index = this.files.indexOf(filePath)) > -1) {
      this.files.splice(index, 1);
    }
    this.element.remove(index);
  };
  fileList.add = function (filePath) {
    this.files.push(filePath);
    const file = document.createElement('option');
    file.text = filePath;
    this.element.add(file);
  };

  const module = {};
  module.refreshFileList = fileList.refresh;

  return module;

})(document.getElementById('fileBrowser'));

/*
 From App:
 
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