var $ = require('jquery');
var Modal = require('bootstrap/js/dist/modal');

// Load the Bootstrap 5 dropdown data API used by legacy frame composer menus.
require('bootstrap/js/dist/dropdown');

function getModal(element, options) {
  element = element && element.jquery ? element[0] : element;
  if (!element) {
    return null;
  }
  return Modal.getOrCreateInstance(element, options || {});
}

function showModal(element, options) {
  element = element && element.jquery ? element[0] : element;
  var instance = getModal(element, options);
  if (instance) {
    instance.show();
  }
}

function hideModal(element) {
  element = element && element.jquery ? element[0] : element;
  var instance = getModal(element);
  if (instance) {
    instance.hide();
  }
}

function disposeModal(element) {
  element = element && element.jquery ? element[0] : element;
  var instance = element && Modal.getInstance(element);
  if (instance) {
    instance.dispose();
  }
}

/*
 * Bootstrap 5 removed the jQuery plugin API. Keep the small `.modal('show')`
 * surface used by legacy modules, backed by the Bootstrap 5 Modal instance.
 * Bootstrap registers its own plugin on DOMContentLoaded, so install after it.
 */
function installModalCompat() {
  $.fn.modal = function(option) {
    return this.each(function() {
      var options = option && typeof option === 'object' ? option : {};
      if (option === 'show') {
        showModal(this, options);
      } else if (option === 'hide') {
        hideModal(this);
      } else if (option === 'toggle') {
        var instance = getModal(this, options);
        instance.toggle();
      } else if (option === 'dispose') {
        disposeModal(this);
      } else if (options.show) {
        showModal(this, options);
      }
    });
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installModalCompat);
} else {
  installModalCompat();
}

document.addEventListener('click', function(event) {
  var target = event.target;
  var dismiss = target && target.closest
    ? target.closest('[data-dismiss="modal"]') : null;
  if (!dismiss) {
    return;
  }
  var modal = dismiss.closest('.modal');
  if (modal) {
    setTimeout(function() {
      hideModal(modal);
    }, 0);
  }
});

exports.Modal = Modal;
exports.getModal = getModal;
exports.show = showModal;
exports.hide = hideModal;
exports.dispose = disposeModal;
