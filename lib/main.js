"use strict";

const app = require("app");
const fs = require("fs");

const BrowserWindow = require("browser-window");

function getUserHomePath() {
  return process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;
}

function getLayoutPath() {

}

const fmOptions = {
  openOptions() {

  },

  gotoConfig() {
    if(parsedSearch.home) {
      let pathname = `${parsedSearch.home}/.atomfm`;
      try {
        process.chdir(pathname);
      } catch(err) {
        console.log(err);
        fs.mkdirSync(pathname);
        process.chdir(pathname);
      }
      loadDirectory();
    }
  }
};

app.on("window-all-closed", function() {
  app.quit();
});

app.on("ready", function() {
  const win = new BrowserWindow({});
  const webContents = win.webContents;

  var Menu = require("menu");

  var template = JSON.parse(fs.readFileSync(__dirname + "/menu-template.json"));

  for(let i=0; template.length > i; i++) {
    let templateItem = template[i];
    if(templateItem.click) {
      templateItem.click = fmOptions[templateItem.click];
    }

    if(templateItem.submenu) {
      for(let n=0; templateItem.submenu.length > n; n++) {
        let templateItemSubmenuItem = templateItem.submenu[n];
        if(templateItemSubmenuItem.click) {
          templateItemSubmenuItem.click = fmOptions[templateItemSubmenuItem.click];
        }
      }
    }
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  win.loadUrl("file://" + __dirname + "/layout.html?home=" + getUserHomePath());
  win.toggleDevTools();

  webContents.on("dom-ready", function() {
    webContents.executeJavaScript(fs.readFileSync(`${__dirname}/user-inject.js`));
  });

  webContents.on("will-navigate", function(e, url) {
    e.preventDefault();
    win.loadUrl("file://" + __dirname + "/layout.html?home=" + getUserHomePath());
  });

  webContents.on("did-finish-load", function() {

  });
});
