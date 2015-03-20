var app = require("app");
var fs = require("fs");

var BrowserWindow = require("browser-window");

function getUserHomePath() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

app.on("window-all-closed", function() {
  app.quit();
  process.exit(0);
});

app.on("ready", function() {
  var window = new BrowserWindow({
    preload: __dirname + "/preload.js"
  });

  window.loadUrl("file://" + __dirname + "/html/main.html?home=" + getUserHomePath());
  window.toggleDevTools();

  window.webContents.on("did-finish-load", function() {

  });
});
