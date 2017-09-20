//Hi I store objects
const storage = (function() {
  const module = {
    save: function(k, v) {
      const value = JSON.stringify(v);  //what will this break?

      localStorage.setItem(k, value);
    },
    read: function(k) {
      const value = localStorage.getItem(k);

      return JSON.parse(value);
    },
    delete: function(k) {
      localStorage.removeItem(k);
    },
    clear: function() {
      //???
    }
  };

  return module;
})();