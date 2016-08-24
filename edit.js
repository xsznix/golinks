let tag;
function init() {
  tag = decodeURIComponent(window.location.hash.substr(1));
  document.title = `${tag} – Golinks`;
  document.getElementById('title').innerText = `Edit Golink for "${tag}"`;
  document.getElementById('form').onsubmit = submit;
  document.getElementById('url').focus();
}

function submit() {
  const url = document.getElementById('url').value;
  chrome.storage.sync.set({[tag]: {url, lastUpdated: +new Date}});
  close();
  return false;
}

document.addEventListener('DOMContentLoaded', init);
