console.log('content.js is loading');

var onKeyPress = function(event) {
  if (event.keyCode === 69 && event.metaKey) {
    console.log('onKeyPress');
  }
};
document.body.addEventListener('keydown', onKeyPress, /*useCapture=*/ true);