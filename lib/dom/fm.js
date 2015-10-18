"use strict";

window.fm = {};

// This enabled document.createElement for the File Manager's custom elements.
require("./elements.js");


(function() {

  const querystring = require("querystring");

  var parsedSearch = querystring.parse(location.search.substr(1));
  var configDir = parsedSearch.home + "/.atomfm";

  Object.defineProperty(fm, "configDir", {
    value: configDir
  });

  fm.createFrame = function createFileManagerFrame(options) {
    const frameEl = document.createElement("fm-frame");
    const pathEl = document.createElement("fm-path");
    const listEl = document.createElement("fm-list");
    const searchEl = document.createElement("fm-search-bar");

    frameEl.appendChild(pathEl);
    frameEl.appendChild(pathEl);
    frameEl.appendChild(listEl);
    frameEl.appendChild(searchEl);

    return frameEl;
  };

}());
