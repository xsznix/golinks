'use strict';

const {Component, h, render} = preact;

function $(id) {
  return document.getElementById(id);
}

const Link = ({tag, url, lastUpdated}) => {
  return h('div', {class: 'link-row list-body'},
    h('div', {class: 'link-tag list-body', title: tag}, tag),
    h('div', {class: 'link-url list-body', title: url},
      h('a', {class: 'link-url-link list-body', href: url,
              target: '_blank', rel: 'noreferrer noopener'}, url)),
    h('div', {class: 'link-actions list-body'},
      h('a', {href: `/edit.html#${encodeURIComponent(tag)}`,
              target: '_blank', rel: 'noreferrer noopener'}, 'Edit'),
      h('a', {class: 'link-action-delete',
              href: `/remove.html#${encodeURIComponent(tag)}`,
              target: '_blank', rel: 'noreferrer noopener'}, 'Delete')));
}

const App = ({links}) => {
  const linkElements = links.map(({tag, url, lastUpdated}) => {
    return h(Link, {key: tag, tag, url, lastUpdated});
  })
  return h('div', {class: 'link-list'},
    h('div', {class: 'link-row list-header'},
      h('div', {class: 'link-tag list-header'}, 'Short Link'),
      h('div', {class: 'link-url list-header'}, 'Destination')),
    linkElements);
}

(() => {
  let $el = null;
  function update(links) {
    if ($el) {
      render(h(App, {links}), $('app'), $el);
    } else {
      render(h(App, {links}), $('app'));
      $el = $('app').lastElementChild;
    }
  }

  Golinks.addLoadListener(links => {
    if (links === null) {
      console.error('something bad has happened');
      return;
    }

    links.sort((a, b) => a.tag > b.tag ? 1 : -1);
    update(links);
  });

  Golinks.addChangeListener((changes, links) => {
    links.sort((a, b) => a.tag > b.tag ? 1 : -1);
    update(links);
  });
})();
