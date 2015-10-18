"use strict";

(function() {

  const fs = require("fs");
  const path = require("path");

  const configDir = fm.configDir;

  let styleEls = {
    css: null,
    less: null,
    sass: null,
    styl: null
  };

  const styleUpdaters = {
    css(linkEl, pathname, done) {
      linkEl.href = "file://" + pathname;
      done();
    },

    less(linkEl, pathname, done) {
      const less = require("less");
      const dirname = path.dirname(pathname);
      const basename = path.basename(pathname);
      const data = fs.readFile(pathname, function(err, data) {
        if(err) throw err;

        less.render(data.toString(), {
          paths: ['.']
        }, function(err, output) {
          if(err) console.log(err);

          const compiledPath = `${dirname}/_${basename}.css`;
          fs.writeFile(compiledPath, output.css, function() {
            linkEl.href = `file://${compiledPath}`;
            done();
          });
        });
      });
    },

    sass(linkEl, pathname, done) {

    },

    styl(linkEl, pathname, done) {
      const stylus = require("stylus");
      const dirname = path.dirname(pathname);
      const basename = path.basename(pathname);
      const data = fs.readFile(pathname, function(err, data) {
        stylus.render(data.toString(), {
          paths: ['.']
        }, function(err, css) {
          if(err) console.log(err);

          const compiledPath = `${dirname}/_${basename}.css`;
          fs.writeFile(compiledPath, css, function() {
            linkEl.href = `file://${compiledPath}`;
            done();
          });
        });

      });
    }
  };

  function updateStyle(name) {
    let ext = name.substr(name.lastIndexOf(".")+1);
    switch(name) {
      case "style.css":
      case "style.less":
      case "style.sass":
      case "style.styl":
        let styleElId = `${ext}-style`;
        let styleEl = styleEls[ext];
        if(styleEl === null) {
          styleEl = document.createElement("link");
          styleEl.rel = "stylesheet";
          styleEl.type= "text/css";
          styleEl.id = styleElId;
          styleEls[ext] = styleEl;
        }

        styleEl.remove();
        styleUpdaters[ext](styleEl, `${configDir}/${name}`, function() {
          document.head.appendChild(styleEl);
        });

        break;
    }
  }

  let files = fs.readdirSync(configDir);
  for(let i=0; files.length > i; i++) {
    let file = files[i];
    updateStyle(file);
  }

  fs.watch(configDir, function(e, filename) {
    updateStyle(filename);
  });


}());
