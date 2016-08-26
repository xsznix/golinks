'use strict';

let tag = decodeURIComponent(window.location.hash.substr(1));

function $(id) {
  return document.getElementById(id);
}

function init() {
  updateTitle();
  const $tag = $('tag');
  $tag.value = tag;
  $tag.addEventListener('input', onTagChange);
  $('form').onsubmit = submit;
  $('url').focus();
}

function onTagChange() {
  tag = this.value;
  updateTitle();
}

function submit() {
  const url = $('url').value;
  chrome.storage.sync.set({[tag]: {url, lastUpdated: +new Date}});
  close();
  return false;
}

document.addEventListener('DOMContentLoaded', init);

function updateTitle() {
  document.title = `${tag} – Golinks`; 
  chrome.storage.sync.get(tag, obj => {
    if (chrome.runtime.lastError) {
      return;
    }
    if (obj[tag]) {
      $('title').innerText = 'Edit Golink';
    } else {
      $('title').innerText = 'Create Golink';
    }
  });
}
