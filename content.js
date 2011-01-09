console.log('content.js is loading');

var onKeyPress = function(event) {
  if (event.keyCode === 69 && event.metaKey) {
    console.log('onKeyPress');
    chrome.extension.sendRequest({action: "showPopup"});
  }
};
document.addEventListener('keydown', onKeyPress, /*useCapture=*/ true);