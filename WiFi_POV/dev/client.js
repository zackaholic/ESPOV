const Client = (function client() {
  const module = {};

  module.get = function(url) {
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

  module.post = function(url, data) {
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

  return module;
})();