'use strict';

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (text.indexOf('/') !== -1) {
    suggest([]);
    return;
  }

  const {url} = Golinks.get(text) || {};
  if (url) {
    suggest([{
      content: url,
      description: `<match>${text}</match> <url>${url}</url>`,
    }, {
      content: getEditURL(text),
      description: `Edit Golink for <match>${text}</match>`,
    }, {
      content: getRemoveURL(text),
      description: `Delete Golink for <match>${text}</match>`,
    }]);
  } else {
    suggest([{
      content: getEditURL(text),
      description: `Create Golink for <match>${text}</match>`,
    }]);
  }
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  let destination;
  let isEdit = false;
  if (isRemoveURL(text)) {
    Golinks.remove(text.substr(text.indexOf('#') + 1));
  } else if (text.indexOf('/') !== -1) {
    destination = text;
    isEdit = isEditURL(text);
  } else {
    const {url} = Golinks.get(text) || {};
    if (url) {
      destination = url;
    } else {
      destination = getEditURL(text);
      isEdit = true;
    }
  }

  if (destination) {
    let active = true;
    switch (disposition) {
      case 'currentTab':
      if (isEdit) {
        chrome.tabs.create({
          active: true,
          url: destination,
        });
      } else {
        chrome.tabs.query({currentWindow: true, active: true}, tab => {
          if (tab) {
            chrome.tabs.update(tab.id, {url: destination});
          }
        });
      }
      break;

      case 'newBackgroundTab':
      active = false;
      // fall through

      case 'newForegroundTab':
      chrome.tabs.create({
        active,
        url: destination,
      });
    }
  }
});

function getEditURL(tag) {
  return chrome.extension.getURL(`edit.html#${encodeURIComponent(tag)}`);
}

function getRemoveURL(tag) {
  return chrome.extension.getURL(`remove.html#${encodeURIComponent(tag)}`);
}

function isEditURL(text) {
  return text.indexOf(chrome.extension.getURL('edit.html') === 0);
}

function isRemoveURL(text) {
  return text.indexOf(chrome.extension.getURL('remove.html')) === 0;
}
