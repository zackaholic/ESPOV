const fileBrowser = (function (containerElement) {

  const deleteButton = {
    reqURL: 'http://192.168.42.81/deleteFile',
    element: document.getElementById('fileDeleteButton'),
    requestDelete: function () {
        const fileName = document.getElementById('fileDropdown').value;
        const data = 'image=/img/' + fileName; 
      Client.post(this.reqURL, data).then(function (res) {
        console.log(res);
        fileList.remove(fileName);
      }, function (err) {
        console.log('Delete failed: ' + err);
      });
    }
  }
  deleteButton.element.addEventListener('click', deleteButton.requestDelete.bind(deleteButton));


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
      Client.post(this.reqURL, data).then(function (res) {
        console.log(res);
        fileList.add(name);
        document.getElementById('fileNameField').value = '';         
      }, function (err) {
        console.log(err);
      });
    }    
  }
  saveButton.element.addEventListener('click', saveButton.saveFile.bind(saveButton));

  const loadSavedButton = {
    reqURL: 'http://192.168.42.81/getFile',
    element: document.getElementById('fileLoadButton'),
    loadSave: function() {
      const path = 'name=/img/' + document.getElementById('fileDropdown').value;
      console.log('loading: ' + path);
      Client.post(this.reqURL, path).then(function(res) {
        console.log(res);
        //now load into drawing canvas?
      }, function (err) {
        console.log(err);
      });
    }
  }
  loadSavedButton.element.addEventListener('click', loadSavedButton.loadSave.bind(loadSavedButton));


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

