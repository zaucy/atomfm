"use strict";

const fs = require("fs");
const path = require("path");

const EventEmitter = require("events");

class FileManagerFrameElement extends HTMLDivElement {

  createdCallback() {
    this._doneLoadingDirectory = false;
  }

  attachedCallback() {

  }

  detachedCallback() {

  }

  get currentDirectory() {
    return this.getAttribute("current-directory") || process.cwd();
  }

  set currentDirectory(val) {
    var newdir = path.isAbsolute(val) ? val : path.resolve(this.currentDirectory, val);
    fs.stat(newdir, function(err, stats) {
      if(err) {
        console.log(err);
        return;
      }

      if(stats.isDirectory()) {
        this.setAttribute("current-directory", newdir);
        this.dispatchEvent(new Event("directory-changed"));
      }
    }.bind(this));
  }

  _loadCurrentDirectory(cb) {
    if(!this._doneLoadingDirectory) return;
    this._doneLoadingDirectory = false;

    let currentDirectory = this.currentDirectory;
    let listEl = this.querySelector("fm-list");

    this._populateList(listEl, currentDirectory);
  }

  _reorganizeList(list) {
    for(let i=0; list.children.length > i; i++) {
      let child = list.children[i];
      while(child.previousElementSibling && child.previousElementSibling.type != "directory") {

      }
    }
  }

  _populateList(list, directory) {
    if(!list) return;
    if(list.parentFrame !== this) return;

    fs.readdir(function(err, files) {
      if(cb && err) { cb(err); return; }
      else if(err) { throw err; }

      let completeFiles = 0;
      for(let i=0; files.length > i; i++) {
        const file = files[i];
        let itemEl = document.createElement("fm-item");
        itemEl.textContent = file;
        itemEl.name = file;
        item.ext = path.extname(file);

        fs.stat(directory + "/" + file, function(err, stats) {
          if(err) throw err;
          let type = "unknown";

          if(stats.isFile()) type = "file";
          else if(stats.isDirectory()) type = "directory";
          else if(stats.isBlockDevice()) type = "block-device";
          else if(stats.isCharacterDevice()) type = "character-device";
          else if(stats.isSymbolicLink()) type = "symbolic-link";
          else if(stats.isFIFO()) type = "fifo";
          else if(stats.isSocket()) type = "socket";

          itemEl.type = type;
          itemEl.mode = stats.mode;
          itemEl.size = stats.size;

          completeFiles++;
          if(completeFiles == files.length) {
            this._reorganizeList(list);
          }

        }.bind(this));

        list.appendChild(itemEl);
      }
    }.bind(this));
  }

  openItem(item) {
    if(!item) return;
    if(item.type == "directory") {
        if(item.name == "..") {
          if(item.root == item.directory) {
            loadDrives();
            return;
          }
        }
        this.currentDirectory = `${this.currentDirectory}/${item.textContent}`;
        this._loadCurrentDirectory();
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
          this.currentDirectory = item.textContent + "\\";
          this._loadCurrentDirectory();
          break;
        default:
          this.currentDirectory = item.getAttribute("mountpoint");
          this._loadCurrentDirectory();
          break;
      }
    }
  }
};

module.exports = FileManagerFrameElement;
document.registerElement("fm-frame", FileManagerFrameElement);
