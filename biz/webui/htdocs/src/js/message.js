var $ = require('jquery');
var Toast = require('bootstrap/js/dist/toast');

var cache = {};
var container;

function getContainer() {
  if (!container) {
    container = $('<div class="toast-container w-message-container p-3"></div>');
    container.appendTo(document.body);
  }
  return container;
}

$(document).on('click', '.w-message', function () {
  var toast = Toast.getInstance(this);
  toast && toast.hide();
});

function showMessage(msg, level) {
  if (level === 'warn') {
    level = 'warning';
  } else if (level === 'error') {
    level = 'danger';
  }
  var elem = cache[level];
  if (!elem) {
    elem = $(
      '<div class="toast w-message w-message-' + level + '" role="status" aria-live="polite" aria-atomic="true">' +
        '<div class="toast-body"></div>' +
      '</div>'
    );
    cache[level] = elem;
  }
  elem.find('.toast-body').text(msg);
  elem.appendTo(getContainer());
  Toast.getOrCreateInstance(elem[0], {
    autohide: true,
    delay: 3200
  }).show();
  return elem;
}

['error', 'warn', 'info', 'success'].forEach(function (level) {
  exports[level] = function (msg) {
    return showMessage(msg, level);
  };
});
