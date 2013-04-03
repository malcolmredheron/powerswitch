var background = chrome.extension.getBackgroundPage();
chrome.tabs.getCurrent(function(this_tab) {

  var selected_index = 0;
  var matching_tabs = [];

  var input = document.getElementById("input");
  var onKeyPress = function(event) {
    console.log('onKeyPress');

    var is_up_or_down = false;
    if (event.keyCode === 38) { // up
      if (selected_index > 0) {
        selected_index--;
      }
      is_up_or_down = true;
    } else if (event.keyCode === 40) { // down
      if (selected_index + 1 < matching_tabs.length) {
        selected_index++;
      }
      is_up_or_down = true;
    } else if (event.keyCode === 13) { // enter
      selectTab(matching_tabs[selected_index].id);
      event.stopPropagation();
      event.preventDefault();
    } else if (event.keyCode === 27) { // escape
      chrome.tabs.remove(this_tab.id);
    }

    if (is_up_or_down) {
      updateAndDisplayMatchingTabs();
      event.stopPropagation();
      event.preventDefault();
    }
  };
  input.addEventListener('keydown', onKeyPress, /*useCapture=*/ false);
  input.autocomplete = 'off';

  var selectTab = function(tab_id) {
    chrome.tabs.update(tab_id, {active: true});
    chrome.tabs.remove(this_tab.id);
  };

  var updateAndDisplayMatchingTabs = function() {
    console.log('updateAndDisplayMatchingTabs');
    var tabs_list_div = document.getElementById('tabs_list');

    var filter_text = input.value.toLowerCase();

    chrome.windows.getAll({populate: true}, function(windows) {
      var current_tab_map = {};
      windows.forEach(function(window) {
        window.tabs.forEach(function(tab) {
          current_tab_map[tab.id] = tab;
        });
      });

      tabs_list_div.innerHTML = "";

      var shouldShowTab = function(tab) {
        return (tab.title.toLowerCase().indexOf(filter_text) !== -1) ||
            (tab.url.toLowerCase().indexOf(filter_text) !== -1);
      };

      var other_tabs = background.ordered_tab_ids.filter(function(tab_id) {
        return tab_id !== this_tab.id;
      }).map(function(tab_id) {
            return current_tab_map[tab_id];
          });

      if (other_tabs.length > 0) {
        other_tabs.push(other_tabs[0]);
        other_tabs = other_tabs.slice(1);
      }

      matching_tabs = other_tabs.filter(function(tab) {
        return shouldShowTab(tab);
      });

      matching_tabs.forEach(function(old_tab, tab_index) {
        var tab = current_tab_map[old_tab.id];
        var tab_div = document.createElement('div');
        var icon_img = document.createElement('img');
        icon_img.src = tab.favIconUrl ? tab.favIconUrl : '';
        var name_span = document.createElement('div');
        name_span.innerText = tab.title;
        name_span.className = 'name';
        tab_div.appendChild(icon_img);
        tab_div.appendChild(name_span);

        var class_value = 'tab';
        if (tab_index === selected_index) {
          class_value += ' selected';
        }
        tab_div.className = class_value;

        tabs_list_div.appendChild(tab_div);
        tab_div.onclick = function(event) {
          selectTab(tab.id);
        };
      });
    });
  };

  setTimeout(function() {
    updateAndDisplayMatchingTabs();
    var input = document.getElementById("input");
    input.focus();
    input.addEventListener("input", function(event) {
      selected_index = 0;
      updateAndDisplayMatchingTabs();
    }, /*useCapture=*/ false);
  }, 1);
});