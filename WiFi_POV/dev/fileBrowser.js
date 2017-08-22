const fileBrowser = (function (containerElement) {
  const module = {};
  const refreshFilesURL = 'getSavedFiles';
  const deleteFileURL = 'deleteFile';
  const saveFileURL = 'saveFile';
  const loadFileURL = 'loadFile';

  function get(url) {
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
  }

  function post(url, data) {
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

  module.refreshFileList = function() {
    get(refreshFilesURL).then((response) => {
      console.log(response);
    }, (error) => {
      console.log(error);
    });
  }

  module.deleteFile = function(filePath) {
    post(deleteFileURL, filePath).then((response) => {
      console.log(response);
    }, (error) => {
      console.log(error);
    });
  }

  module.saveFile = function(filePath, fileData) {
    post(saveFileURL, file).then((response) => {
      console.log(response);
    }, (error) => {
      console.log(error);
    });
  }

  module.loadSavedFile = function(filePath) {
    get(loadFileURL).then((response) => {
      console.log(response);
      return response;
    }, (error) => {
      console.log(error);
      return error;
    });
  }

  return module;

})(document.getElementById('fileBrowser'));

/*



         var httpRequest = new XMLHttpRequest();

//adding fileSystem element to dropdown...

         httpRequest.onreadystatechange = function() {
           if (httpRequest.readyState === XMLHttpRequest.DONE) {
             if (httpRequest.status === 200) {
               console.log(httpRequest.responseText);
               var option = document.createElement('option');
               option.value = '/img/' + fileName;
               option.innerHTML = option.id = fileName;
               fileList.insertBefore(option, fileList.firstChild); 
             } else {
               console.log(httpRequest.responseText);
             }
           }
         }; 

         console.log(Pixels.generateUploadString(fileName));

        };        


      }
*/