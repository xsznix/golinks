'use strict';

const MAX_SUGGESTIONS = 5;

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

  function getSuggestions(tag) {
    const suggestions = [];
    Object.keys(theLinks).forEach(key => {
      const link = theLinks[key];
      if (key.indexOf(tag) !== 0) {
        return;
      }
      let i;
      for (i = 0; i < suggestions.length; i++) {
        if (link.lastAccessed > suggestions[i].lastAccessed) {
          suggestions.splice(i, 0, suggest());
          break;
        }
      }
      if (i === suggestions.length && suggestions.length < MAX_SUGGESTIONS) {
        suggestions.push(suggest());
      }

      function suggest() {
        return {
          content: key,
          description: `<match>${key}</match> <url>${link.url}</url>`,
        };
      }
    });

    return suggestions;
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

  function mark(tag) {
    if (!theLinks[tag]) {
      return;
    }

    const oldValue = theLinks[tag];
    const newValue = Object.assign({}, oldValue, {lastAccessed: +new Date});
    Object.freeze(newValue);
    theLinks[tag] = newValue;
    chrome.storage.sync.set({[tag]: newValue}, () => {
      if (chrome.runtime.lastError) {
        theLinks[tag] = oldValue;
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

  return {list, get, getSuggestions, set, mark, remove};
})();
