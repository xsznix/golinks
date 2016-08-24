'use strict';

window.Golinks = (() => {
  let theLinks = {};

  // Initial load.
  chrome.storage.sync.get(null, links => {
    if (chrome.runtime.lastError) {
      return;
    } else {
      theLinks = links;
    }
  });

  // Subsequent updates.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') {
      return;
    }

    for (const tag in changes) {
      const {newValue} = changes[tag];
      if (newValue !== void 0) {
        theLinks[tag] = changes[tag].newValue;
        Object.freeze(theLinks[tag]);
      }
    }
  });

  function list() {
    const output = [];
    for (const tag in theLinks) {
      const {url, lastUpdated} = theLinks[tag];
      output.push({tag, url, lastUpdated});
    }
    return output;
  }

  function get(tag) {
    return theLinks[tag];
  }

  function set(tag, url) {
    const oldValue = theLinks[tag];
    const newValue = {url, lastUpdated: +new Date};
    Object.freeze(newValue);
    theLinks[tag] = newValue;
    chrome.storage.sync.set({[tag]: newValue}, () => {
      if (chrome.runtime.lastError) {
        if (oldValue === void 0) {
          delete theLinks[tag];
        } else {
          theLinks[tag] = oldValue;
        }
      }
    });
  }

  function remove(tag) {
    const oldValue = theLinks[tag];
    delete theLinks[tag];
    chrome.storage.sync.remove(tag, () => {
      if (chrome.runtime.lastError) {
        if (oldValue !== void 0) {
          theLinks[tag] = oldValue;
        }
      }
    });
  }

  return {list, get, set, remove};
})();
