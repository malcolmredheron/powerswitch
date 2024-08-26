// popup.js

chrome.tabs.getCurrent(function(this_tab) {
    let selected_index = 0;
    let matching_tabs = [];

    const input = document.getElementById("input");

    const onKeyPress = (event) => {
        console.log('onKeyPress');
        let is_up_or_down = false;

        if (event.keyCode === 38) { // up arrow
            if (selected_index > 0) {
                selected_index--;
            }
            is_up_or_down = true;
        } else if (event.keyCode === 40) { // down arrow
            if (selected_index + 1 < matching_tabs.length) {
                selected_index++;
            }
            is_up_or_down = true;
        } else if (event.keyCode === 13) { // enter
            selectTab(matching_tabs[selected_index]);
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

    input.addEventListener('keydown', onKeyPress, false);
    input.autocomplete = 'off';

    const selectTab = (tab) => {
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
        chrome.tabs.remove(this_tab.id);
    };

    const updateAndDisplayMatchingTabs = () => {
        console.log('updateAndDisplayMatchingTabs');
        const tabs_list_div = document.getElementById('tabs_list');
        const filter_text = input.value.toLowerCase();

        // Request ordered_tab_ids from the background script
        chrome.runtime.sendMessage({ action: 'getOrderedTabIds' }, function(response) {
            if (!response || !response.ordered_tab_ids) {
                console.error('Failed to get ordered tabs from background script');
                return;
            }

            const ordered_tab_ids = response.ordered_tab_ids;

            chrome.windows.getAll({ populate: true }, function(windows) {
                const current_tab_map = {};
                windows.forEach(function(window) {
                    window.tabs.forEach(function(tab) {
                        current_tab_map[tab.id] = tab;
                    });
                });

                tabs_list_div.innerHTML = "";

                const shouldShowTab = (tab) => {
                    return tab.title.toLowerCase().includes(filter_text) ||
                           tab.url.toLowerCase().includes(filter_text);
                };

                const other_tabs = ordered_tab_ids.filter(tab_id => tab_id !== this_tab.id)
                                                  .map(tab_id => current_tab_map[tab_id]);

                matching_tabs = other_tabs.filter(tab => shouldShowTab(tab));

                matching_tabs.forEach((old_tab, tab_index) => {
                    const tab = current_tab_map[old_tab.id];
                    const tab_div = document.createElement('div');
                    const icon_img = document.createElement('img');
                    icon_img.src = tab.favIconUrl || '';
                    const name_span = document.createElement('div');
                    name_span.innerText = tab.title;
                    name_span.className = 'name';
                    tab_div.appendChild(icon_img);
                    tab_div.appendChild(name_span);

                    tab_div.className = 'tab' + (tab_index === selected_index ? ' selected' : '');
                    tabs_list_div.appendChild(tab_div);

                    tab_div.onclick = () => selectTab(tab);
                    if (tab_index === selected_index) {
                        tab_div.scrollIntoView();
                    }
                });
            });
        });
    };

    // Initialize the popup
    setTimeout(() => {
        updateAndDisplayMatchingTabs();
        input.focus();
        input.addEventListener("input", () => {
            selected_index = 0;
            updateAndDisplayMatchingTabs();
        }, false);
    }, 1);
});
