'use strict';

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const {url} = Golinks.get(text) || {};
  if (url) {
    chrome.omnibox.setDefaultSuggestion({
      description: `<match>${text}</match> <url>${url}</url>`,
    });

    suggest([{
      content: getEditSuggestion(text),
      description: `Edit Golink for <match>${text}</match>`,
    }, {
      content: getRemoveSuggestion(text),
      description: `Delete Golink for <match>${text}</match>`,
    }].concat(Golinks.getSuggestions(text)));
  } else {
    chrome.omnibox.setDefaultSuggestion({
      description: `Create Golink for <match>${text}</match>`,
    });

    // Try to find a golink whose tag starts with what has been entered.
    const suggestions = Golinks.getSuggestions(text);
    suggest(suggestions);
  }
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  let destination;
  let isEdit = false;
  if (isRemoveSuggestion(text)) {
    Golinks.remove(text.substr(9));
  } else {
    const {url} = Golinks.get(text) || {};
    const editTag = getEditTag(text);
    if (editTag) {
      destination = getEditURL(editTag);
      isEdit = true;
    } else if (!url) {
      destination = getEditURL(text);
      isEdit = true;
    } else {
      destination = url;
      Golinks.mark(text);
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

const commandPrefix = '\u200b\u200b';

function getCreateSuggestion(tag) {
  return `${commandPrefix}create ${tag}`;
}

function getEditSuggestion(tag) {
  return `${commandPrefix}edit ${tag}`;
}

function getRemoveSuggestion(tag) {
  return `${commandPrefix}delete ${tag}`;
}

function getEditURL(tag) {
  return chrome.extension.getURL(`edit.html#${encodeURIComponent(tag)}`);
}

function getRemoveURL(tag) {
  return chrome.extension.getURL(`remove.html#${encodeURIComponent(tag)}`);
}

function getEditTag(text) {
  return text.indexOf(`${commandPrefix}edit `) === 0 && text.substr(7) || 
         text.indexOf(`${commandPrefix}create `) === 0 && text.substr(9);
}

function isRemoveSuggestion(text) {
  return text.indexOf(`${commandPrefix}delete `) === 0;
}
