"use strict";

const FileManagerFrameElement = require("./fm-frame.js");

class FileManagerFrameChildElement extends HTMLDivElement {

  get parentFrame() {
    let parentFrameElement = this.parentElement;
    while(parentFrameElement && !parentFrameElement instanceof FileManagerFrameElement) {
      parentFrameElement = parentFrameElement.parentElement;
    }
    return parentFrameElement;
  }
};

module.exports = FileManagerFrameChildElement;
