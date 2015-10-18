"use strict";

const FileManagerFrameChildElement = require("./fm-frame-child.js");

class FileManagerPathElement extends FileManagerFrameChildElement {

  createdCallback() {
    
  }

};

document.registerElement("fm-path", FileManagerPathElement);
module.exports = FileManagerPathElement;
