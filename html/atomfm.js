"use strict";

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

  var pathHistory = [];

  var currentSearchString = "";

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
        clearSearch();
        loadDirectory();
    } else
    if(item.type == "file") {
      switch(os.platform().toLowerCase()) {

        case "linux":
          // Linux handles opening files differently. It's defined by
          // the window managers / desktop environments / whatever they
          // choose to run their software from...
          //break;
        case "win32":
        default:
          var child = child_process.exec(item.textContent);
          child.unref();
          break;
      }
    } else
    if(item.type == "drive") {
      switch(os.platform().toLowerCase()) {
        case 'win32':
          process.chdir(item.textContent + "\\");
          loadDirectory();
          break;
        default:
          process.chdir(item.getAttribute("mountpoint"));
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

  var deselectAllExcept = function(inExceptions) {
    let exceptions = Array.isArray(inExceptions) ? inExceptions : arguments;

    deselectAll();
    for(let i=0; exceptions.length > i; i++) {
      const item = exceptions[i];
      selectItem(item);
    }
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
    if(el === null) {
      if(activeItem) {
        activeItem.classList.remove("active");
        activeItem = null;
      }
    } else
    if(el.parentElement == activeListEl) {
      if(activeItem) activeItem.classList.remove("active");
      activeItem = el;
      activeItem.classList.add("active");
      activeItem.focus();
      activeItem.scrollIntoViewIfNeeded();

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

  var updateSearch = function() {
    var items = document.querySelectorAll("atomfm-item");

    document.querySelector("#atomfm-search-bar").textContent = currentSearchString;

    let selit = null;
    let numItemsFound = 0;

    deselectAll();

    for(let i=0; items.length > i; i++) {
      let item = items[i];
      const itemText = item.textContent.trim();
      if(itemText.startsWith(currentSearchString)) {
        numItemsFound += 1;
        if(selit === null) {
          selit = item;
          selectItem(selit);
          setActiveItem(selit);
        }
        item.innerHTML = "";
        let hlEl = document.createElement("span");
        hlEl.classList.add("searched-text");
        hlEl.textContent = currentSearchString;
        item.appendChild(hlEl);
        item.appendChild(document.createTextNode(itemText.substr(currentSearchString.length)));
      } else {
        item.innerHTML = item.textContent;
      }
    }

    if(numItemsFound == 0) {

    }

  };

  var clearSearch = function() {
    currentSearchString = "";
    updateSearch();
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

    this.addEventListener("focus", function(e) {
      this.scrollIntoView();
      console.log(e);
    });
  };

  window.addEventListener("popstate", function(e) {
    if(e.state) {
      process.chdir(e.state);
      loadDirectory(e.state, false);
    }
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
      setActiveItem(null);
      clearSearch();

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
    } else
    // Right Arrow
    if(e.which == 39) {
      if(e.altKey) {
        history.forward();
      }
    } else
    // Left Arrow
    if(e.which == 37) {
      if(e.altKey) {
        history.back();
      }
    } else
    // Backspace
    if(e.which == 8) {
      if(currentSearchString.length > 0) {
        currentSearchString = currentSearchString.substr(0, currentSearchString.length-1);
        updateSearch();
      }
    }

  });

  window.addEventListener("keypress", function(e) {
    if(e.ctrlKey || e.altKey) return;

    currentSearchString += String.fromCharCode(e.charCode);
    updateSearch();
  });

  var AtomFileManagerListElement = document.registerElement("atomfm-list");
  var AtomFileManagerItemElement = document.registerElement("atomfm-item",{
    prototype: AtomFileManagerItemElementPrototype
  });

  exports.AtomFileManagerListElement = AtomFileManagerListElement;

  function loadDirectory(dir, affectHistory) {
    if(!activeListEl) return;
    var dir = dir || process.cwd();

    activeItemIndex = 0;
    activeItem = null;
    activeListEl.innerHTML = "";
    if(affectHistory !== false) {
      history.pushState(dir, "", dir);
    }
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

        clearSearch();
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
            driveEl.setAttribute("mountpoint", driveDetail.mountpoint);

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
