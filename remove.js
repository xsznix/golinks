'use strict';

let tag = decodeURIComponent(window.location.hash.substr(1));

function $(id) {
  return document.getElementById(id);
}

function init() {
  $('title').innerText = `Delete “${tag}”?`;
  $('cancel').onclick = close;
  $('form').onsubmit = submit;
}

function submit() {
  chrome.storage.sync.remove(tag);
  close();
  return false;
}

document.addEventListener('DOMContentLoaded', init);
