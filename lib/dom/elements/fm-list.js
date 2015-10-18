"use strict";

const FileManagerFrameChildElement = require("./fm-frame-child.js");

class FileManagerListElement extends FileManagerFrameChildElement {

  createdCallback() {

  }

};

document.registerElement("fm-list", FileManagerListElement);
module.exports = FileManagerListElement;
