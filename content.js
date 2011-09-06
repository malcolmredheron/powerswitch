var descendentsMatchingXpath = function(parent, xpath) {
  var iter = document.evaluate(xpath, parent, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var nodes = [];
  while (true) {
    var node = iter.iterateNext();
    if (node === null) {
      break;
    } else {
      nodes.push(node);
    }
  }
  return nodes;
};

var onKeyPress = function(event) {
  if (event.keyCode === 75 && event.metaKey) { // command-K
    chrome.extension.sendRequest({action: "showPopup"});
    event.stopPropagation();
  }
};
window.addEventListener('keydown', onKeyPress, /*useCapture=*/ true);

// Iframes with a src attribute will run their own copy of the
// extension but frames with no src attribute will not (just like
// empty pages). Since Gmail's compose view works like this we need to
// do something about it. Extensions can't get to frame.contentWindow
// but they can get to frame.contentDocument, which is enough to
// install a listener.
//
// References:
// - http://code.google.com/p/chromium/issues/detail?id=20773
// - http://blog.afterthedeadline.com/2010/05/14/how-to-jump-through-hoops-and-make-a-chrome-extension/
var addListenerToIframes = function() {
  descendentsMatchingXpath(document, '//iframe[not(@src)]')
  .concat(descendentsMatchingXpath(document, '//iframe[starts-with(@src, "javascript:")]'))
  .forEach(function(iframe) {
      if (iframe.__power_switch_handler_set === undefined) {
        iframe.contentDocument.addEventListener('keydown', onKeyPress, /*useCapture=*/ true);
        iframe.__power_switch_handler_set = true;
      }
    });
};
addListenerToIframes();
setInterval(addListenerToIframes, 1000);
