(function(exports) {
  var fs = require("fs");
  var os = require("os");
  var path = require("path");
  var child_process = require("child_process");
  var njds = require("nodejs-disks");

  var selectedItems = [];
  var activeItem = null;
  var activeItemIndex = 0;
  var activeListEl = null;

  var openItem = function(item) {
    if(!item) return;
    if(item.type == "directory") {
        if(item.name == "..") {

          if(item.root == item.directory) {
            loadDrives();
            return;
          }
        }
        process.chdir(process.cwd() + "/" + item.textContent);
        loadDirectory();
    } else
    if(item.type == "file") {
      var child = child_process.spawn("start \"" + process.cwd() + "/" + item.textContent + "\"", [], {
        detached: true,
        stdio: [ 'ignore' ]
      });

      child.unref();
    } else
    if(item.type == "drive") {
      switch(os.platform().toLowerCase()) {
        case 'win32':
          process.chdir(item.textContent + "\\");
          loadDirectory();
          break;
      }
    }
  };

  var deselectAll = function() {
    for(var i=0; selectedItems.length > i; i++) {
      selectedItems[i].classList.remove("selected");
    }

    selectedItems = [];
  };

  var selectItem = function(item) {
    if(!item) return;
    selectedItems.push(item);
    item.classList.add("selected");
  };

  var getItemIndex = function(item) {
    if(item.parentElement != activeListEl) return -1;
    var c = activeListEl.firstElementChild;
    var i=0;
    while(c) {
      if(c == item) break;
      i++;
      c = c.nextElementSibling;
    }

    return i;
  };

  var setActiveItem = function(el) {
    if(el.parentElement == activeListEl) {
      if(activeItem) activeItem.classList.remove("active");
      activeItem = el;
      activeItem.classList.add("active");
      activeItem.focus();

      var i=0;
      var c = activeListEl.firstElementChild;
      while(c) {
        if(c == el) break;
        i++;
        c = c.nextElementSibling;
      }

      activeItemIndex = i;
    }
  };

  var AtomFileManagerItemElementPrototype = Object.create(HTMLElement.prototype);

  Object.defineProperty(AtomFileManagerItemElementPrototype, "type", {
    get: function() {
      return this.getAttribute("type");
    },
    set: function(val) {
      if(val == "") {
        this.removeAttribute("type");
      } else {
        this.setAttribute("type", val);
      }
    }
  });

  Object.defineProperty(AtomFileManagerItemElementPrototype, "path", {
    get: function() {
      return path.format({
        root: this.getAttribute("root"),
        dir: this.getAttribute("directory"),
        ext: this.getAttribute("ext"),
        name: this.getAttribute("name")
      });
    },

    set: function(val) {
      var parsedPath = path.parse(val);
      this.setAttribute("root", parsedPath.root);
      this.setAttribute("directory", parsedPath.dir);
      this.setAttribute("ext", parsedPath.ext);
      this.setAttribute("name", parsedPath.name);
    }
  });

  Object.defineProperties(AtomFileManagerItemElementPrototype, {
    "root": {
      get: function() {
        return this.getAttribute("root");
      },
      set: function(val) {
        if(val == "") this.removeAttribute("root");
        else this.setAttribute("root", val);
      }
    },
    "directory": {
      get: function() {
        return this.getAttribute("directory");
      },
      set: function(val) {
        if(val == "") this.removeAttribute("directory");
        else this.setAttribute("directory", val);
      }
    },
    "ext": {
      get: function() {
        return this.getAttribute("ext");
      },
      set: function(val) {
        if(val == "") this.removeAttribute("ext");
        else this.setAttribute("ext", val);
      }
    },
    "name": {
      get: function() {
        return this.getAttribute("name");
      },
      set: function(val) {
        if(val == "") this.removeAttribute("name");
        else this.setAttribute("name", val);
      }
    },
  });

  AtomFileManagerItemElementPrototype.createdCallback = function(el) {
    var self = this;
    this.addEventListener("click", function(e) {
      if(e.ctrlKey) {

      } else
      if(e.shiftKey) {
        var currentIndex = getItemIndex(self);
        var activeIndex = activeItemIndex;
        deselectAll();
        if(currentIndex < activeIndex) {
          for(var i=currentIndex; i < activeIndex; i++) {
            selectItem(activeListEl.children[i]);
          }
          selectItem(activeItem);
        } else
        if(activeIndex < currentIndex) {
          for(var i=activeIndex; i < currentIndex; i ++) {
            selectItem(activeListEl.children[i])
          }
          selectItem(activeItem);
        }



      } else {
        deselectAll();
        selectedItems = [];
      }

      setActiveItem(self);
      self.classList.add("selected");
      self.classList.add("active");
      selectedItems.push(this);
    });

    this.addEventListener("dblclick", function(e) {
      openItem(this);
    });
  };

  window.addEventListener("popstate", function(e) {
    process.chdir(e.state);
    loadDirectory(e.state);
  });

  window.addEventListener("click", function(e) {

    if(e.srcElement instanceof AtomFileManagerItemElement) return;

    for(var i=0; selectedItems.length > i; i++) {
      var selectedItem = selectedItems[i];
      if(selectedItems) selectedItem.classList.remove("selected");
    }

    selectedItems = [];
  });

  window.addEventListener("keydown", function(e) {

    // Escape key
    if(e.which == 27) {
      if(activeItem) {
        activeItem.classList.remove("active");
        activeItem = null;
        deselectAll();
      }
    } else
    // Return key
    if(e.which == 13) {
      if(selectedItems.length > 1) {
        openItem(activeItem || activeListEl.firstElementChild);
      } else {
        openItem(selectedItems[0] || activeListEl.firstElementChild);
      }
    } else
    // F5 key
    if(e.which == 116) {
      loadDirectory();
    } else
    // Up Arrow
    if(e.which == 38) {
      if(!e.shiftKey && !e.ctrlKey) deselectAll();
      if(activeItemIndex > 0) {
        setActiveItem(activeListEl.children[activeItemIndex -1]);
      } else
      if(activeItemIndex == 0) {
        setActiveItem(activeListEl.children[activeItemIndex]);
      }
      if(!e.ctrlKey) {
        selectItem(activeItem);
      }

      e.preventDefault();

    } else
    // Down Arrow
    if(e.which == 40) {
      if(!e.shiftKey && !e.ctrlKey) deselectAll();
      if(activeItemIndex + 1 < activeListEl.children.length) {
        setActiveItem(activeListEl.children[activeItemIndex + 1]);
      }
      if(!e.ctrlKey) {
        selectItem(activeItem);
      }

      e.preventDefault();
    }
  });

  var AtomFileManagerListElement = document.registerElement("atomfm-list");
  var AtomFileManagerItemElement = document.registerElement("atomfm-item",{
    prototype: AtomFileManagerItemElementPrototype
  });

  exports.AtomFileManagerListElement = AtomFileManagerListElement;

  function loadDirectory(dir) {
    if(!activeListEl) return;
    var dir = dir || process.cwd();

    activeItemIndex = 0;
    activeItem = null;
    activeListEl.innerHTML = "";
    history.pushState(dir, "", dir);

    fs.readdir(dir, function(err, paths) {
      paths.unshift("..");
      for(var i=0; paths.length > i; i++) {

        (function() {
          var filePath = paths[i];
          var pathEl = document.createElement("atomfm-item");
          pathEl.textContent = filePath;
          pathEl.path = dir + "/" + filePath;
          activeListEl.appendChild(pathEl);
          fs.stat(filePath, function(err, stats) {
            if(err) {
              return;
            }
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

  function loadDrives() {
    if(!activeListEl) return;

    njds.drives(function(err, drives) {
      for(var i=0; drives.length > i; i++) {
        njds.drivesDetail(drives, function(err, details) {
          activeListEl.innerHTML = "";
          for(var i=0; details.length > i; i++) {
            var driveDetail = details[i];

            var driveEl = document.createElement("atomfm-item");
            driveEl.type = "drive";
            driveEl.textContent = driveDetail.drive;

            activeListEl.appendChild(driveEl);
          }
        });

      }
    })
  }

  document.addEventListener("readystatechange", function() {
    if(document.readyState == "complete") {
      activeListEl = document.getElementsByTagName("atomfm-list")[0];
      loadDirectory(process.cwd());
    }
  });

}(window));
