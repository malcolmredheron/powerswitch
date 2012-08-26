// TODO:
// - prettier window (fullscreen?)
// - prettier window contents
// - stack is not always correct (reader)

var notify = function(string) {
  webkitNotifications.createNotification('', 'notify', string).show();
};

var ordered_tab_ids = [];

var showPopup = function() {
  var window_width = 850;
  var window_height = 400;
  var window_left =
      (window.screen.availWidth - window_width) / 2 +
          window.screen.availLeft;
  var window_top =
      (window.screen.availHeight - window_height) / 2 +
          window.screen.availTop;

  window.open(
      "popup.html", undefined,
      "location=no,chrome=no,fullscreen=yes,resizable=no," +
          "height=" + window_height + ",width=" + window_width + "," +
          "top=" + window_top + ",left=" + window_left);
};

chrome.browserAction.onClicked.addListener(function(tab) {
  showPopup();
});

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
      if (request.action === 'showPopup') {
        showPopup();
      } else {
        debugger;
      }
      sendResponse({});
    });

chrome.windows.getAll({populate: true}, function(windows) {
  windows.forEach(function(window) {
    window.tabs.forEach(function(tab) {
      ordered_tab_ids.push(tab.id);
    });
  });
});

var removeTabWithId = function(tab_id) {
  // xcxc simplify
  for (var i = 0; i < ordered_tab_ids.length; i++) {
    var ordered_tab_id = ordered_tab_ids[i];
    if (tab_id === ordered_tab_id) {
      ordered_tab_ids = ordered_tab_ids.filter(function(ordered_tab_id) {
        return ordered_tab_id !== tab_id;
      });
      return;
    }
  }

  notify('tab not found: ' + tab_id);
  debugger;
};

chrome.tabs.onCreated.addListener(function(tab) {
//    notify('onCreated');
  ordered_tab_ids = concat([tab.id], ordered_tab_ids);
});

chrome.tabs.onRemoved.addListener(function(tab_id, remove_info) {
//    notify('onRemoved');
  removeTabWithId(tab_id);
});

chrome.tabs.onSelectionChanged.addListener(function(tab_id, select_info) {
  removeTabWithId(tab_id);
  ordered_tab_ids = concat([tab_id], ordered_tab_ids);
});

chrome.windows.onFocusChanged.addListener(function(window) {
  chrome.tabs.getSelected(undefined, function(tab) {
    removeTabWithId(tab.id);
    ordered_tab_ids = concat([tab.id], ordered_tab_ids);
  });
});
