var app = require("app");
var fs = require("fs");

var BrowserWindow = require("browser-window");

function getUserHomePath() {
  return process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;
}

app.on("window-all-closed", function() {
  app.quit();
});

app.on("ready", function() {
  var window = new BrowserWindow({

  });

  window.loadUrl("file://" + __dirname + "/html/main.html?home=" + getUserHomePath());
  window.toggleDevTools();

  window.webContents.on("will-navigate", function(e, url) {
    e.preventDefault();
    window.loadUrl("file://" + __dirname + "/html/main.html?home=" + getUserHomePath());
  });

  window.webContents.on("did-finish-load", function() {
    
  });
});
