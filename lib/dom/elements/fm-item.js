"use strict";

const FileManagerFrameChildElement = require("./fm-frame-child.js");

class FileManagerItemElement extends FileManagerFrameChildElement {

  createdCallback() {

  }

  attachedCallback() {

  }

  detachedCallback() {

  }

  open() {

  }

  get ext() {
    return this.getAttribute("ext");
  }

  set ext(val) {
    if(!val) {
      this.removeAttribute("ext");
    } else {
      this.setAttribute("ext", val);
    }
  }

  get type() {
    return this.getAttribute("type")
  }

  get mode() {
    return this.getAttribute("mode");
  }

  set mode(val) {
    if(!val) {
      this.removeAttribute("mode");
    } else {
      this.setAttribute("mode", val);
    }
  }

  get size() {
    return this.getAttribute("size");
  }

  set size(val) {
    if(!val) {
      this.removeAttribute("size");
    } else {
      this.setAttribute("size", val);
    }
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    if(!val) {
      this.removeAttribute("name");
    } else {
      this.setAttribute("name", val);
    }
  }

  set type(val) {
    if(!val) {
      this.removeAttribute("type");
    } else {
      this.setAttribute("type", val);
    }
  }
};

module.exports = FileManagerItemElement;
document.registerElement("fm-item", FileManagerItemElement);
