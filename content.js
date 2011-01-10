console.log('content.js is loading');

var onKeyPress = function(event) {
  if (event.keyCode === 69 && event.metaKey) {
    chrome.extension.sendRequest({action: "showPopup"});
  }
};
window.addEventListener('keydown', onKeyPress, /*useCapture=*/ true);