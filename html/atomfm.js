(function(exports) {
  var fs = require("fs");

  var selectedItems = [];
  var activeItem = null;

  var AtomFileManagerItemElementPrototype = Object.create(HTMLElement.prototype)

  AtomFileManagerItemElementPrototype.createdCallback = function(el) {
    var self = this;
    this.addEventListener("click", function(e) {
      console.log(e);
      if(e.ctrlKey) {

      } else
      if(e.shiftKey) {

      } else {
        for(var i=0; selectedItems.length > i; i++) {
          if(selectedItems[i]) {
            selectedItems[i].classList.remove("selected");
          }
        }
        selectedItems = [];
      }
      if(activeItem) activeItem.classList.remove("active");
      activeItem = self;
      self.classList.add("selected");
      self.classList.add("active");
      selectedItems.push(this);
    });
  };

  window.addEventListener("click", function(e) {
    
    if(e.srcElement instanceof AtomFileManagerItemElement) return;
    for(var i=0; selectedItems.length > i; i++) {
      var selectedItem = selectedItems[i];
      if(selectedItems) selectedItem.classList.remove("selected");
    }
    if(activeItem) activeItem.classList.remove("active");
    selectedItems = [];
  });

  var AtomFileManagerListElement = document.registerElement("atomfm-list");
  var AtomFileManagerItemElement = document.registerElement("atomfm-item",{
    prototype: AtomFileManagerItemElementPrototype
  });

  exports.AtomFileManagerListElement = AtomFileManagerListElement;

  var activeListEl = null;

  function loadDirectory(dir) {
    if(!activeListEl) return;
    var dir = dir || process.cwd();
    fs.readdir(dir, function(err, paths) {
      for(var i=0; paths.length > i; i++) {

        (function() {
          var filePath = paths[i];
          var pathEl = document.createElement("atomfm-item");
          pathEl.textContent = filePath;
          activeListEl.appendChild(pathEl);
          fs.stat(filePath, function(err, stats) {
            var pathType = "unknown";
            if(stats.isFile()) pathType = "file";
            else if(stats.isDirectory()) pathType = "directory";
            else if(stats.isBlockDevice()) pathType = "block-device";
            else if(stats.isCharacterDevice()) pathType = "character-device";
            else if(stats.isSymbolicLink()) pathType = "symbolic-link";
            else if(stats.isFIFO()) pathType = "fifo";
            else if(stats.isSocket()) pathType = "socket";
            pathEl.setAttribute("type", pathType);
          });
        }());
      }
    });
  }

  document.addEventListener("readystatechange", function() {
    if(document.readyState == "complete") {
      activeListEl = document.getElementsByTagName("atomfm-list")[0];
      loadDirectory(process.cwd());
    }
  });

}(window));
