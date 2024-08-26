// background.js (Manifest V3 Service Worker)

// This array will keep track of the ordered tab IDs
let ordered_tab_ids = [];

// Function to show the popup window
const showPopup = () => {
    // Use chrome.system.display.getInfo to get screen dimensions
    chrome.system.display.getInfo((displays) => {
        if (displays.length > 0) {
            const display = displays[0]; // Use the primary display
            const window_width = 850;
            const window_height = 400;
            const window_left = (display.workArea.width - window_width) / 2 + display.workArea.left;
            const window_top = (display.workArea.height - window_height) / 2 + display.workArea.top;

            chrome.windows.create({
                url: "popup.html",
                type: "popup",
                width: window_width,
                height: window_height,
                left: Math.floor(window_left),
                top: Math.floor(window_top),
            });
        } else {
            console.error("No displays found.");
        }
    });
};

// Handle command events (e.g., keyboard shortcuts)
chrome.commands.onCommand.addListener((command) => {
    if (command === 'switch_tab') {
        showPopup();
    }
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showPopup') {
        showPopup();
        sendResponse({});
    } else if (request.action === 'getOrderedTabIds') {
        sendResponse({ ordered_tab_ids });
    }
    return true; // Required to keep the message channel open for asynchronous responses
});

// On startup, populate the ordered_tab_ids array
chrome.windows.getAll({ populate: true }).then((windows) => {
    windows.forEach((window) => {
        window.tabs.forEach((tab) => {
            ordered_tab_ids.push(tab.id);
        });
    });
});

// Function to remove a tab by ID from the ordered list
const removeTabWithId = (tab_id) => {
    const tab_index = ordered_tab_ids.indexOf(tab_id);
    if (tab_index !== -1) {
        ordered_tab_ids.splice(tab_index, 1);
    }
};

// Update the ordered tab list when the current tab changes
const updateOrderedTabsWithCurrentTab = () => {
    chrome.windows.getLastFocused().then((window) => {
        chrome.tabs.query({ active: true, windowId: window.id }).then((tabs) => {
            if (tabs.length > 0) {
                const tab = tabs[0];
                removeTabWithId(tab.id);
                ordered_tab_ids.unshift(tab.id);
            }
        });
    });
};

// Add event listeners for tab creation, removal, selection changes, and window focus changes
chrome.tabs.onCreated.addListener((tab) => {
    ordered_tab_ids.unshift(tab.id);
});

chrome.tabs.onRemoved.addListener((tab_id) => {
    removeTabWithId(tab_id);
});

chrome.tabs.onActivated.addListener(() => {
    updateOrderedTabsWithCurrentTab();
});

chrome.windows.onFocusChanged.addListener((window_id) => {
    if (window_id !== chrome.windows.WINDOW_ID_NONE) {
        updateOrderedTabsWithCurrentTab();
    }
});

chrome.tabs.onReplaced.addListener((added_tab_id, removed_tab_id) => {
    removeTabWithId(removed_tab_id);
    ordered_tab_ids.unshift(added_tab_id);
});
