'use strict';

function $(id) {
  return document.getElementById(id);
}

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  if (tabs.length !== 1) {
    console.error(`${tabs.length} tabs returned. wtf?`);
    return;
  }

  $('url').value = tabs[0].url;
});

function submit() {
  const tag = $('tag').value;
  const url = $('url').value;
  if (tag.length === 0) {
    return;
  }
  chrome.storage.sync.set({[tag]: {url, lastUpdated: +new Date}});
  close();
  return false;
}

function openManager() {
  chrome.tabs.create({
    url: chrome.extension.getURL('/manager.html'),
  });
}

(() => {
  $('form').onsubmit = submit;
  $('tag').focus();
  $('manager-link').onclick = openManager;
})();
