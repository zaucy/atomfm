
function getUserHomePath() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

var userStyleLinkEl = document.createElement("link");
userStyleLinkEl.rel = "stylesheet";
userStyleLinkEl.href= "file://" + getUserHomePath() + ".atomfm/style.css";

document.head.appendChild(userStyleLinkEl);

console.log("PRELOAD");

window.addEventListener("load", function() {
  console.log("preload load");
});
