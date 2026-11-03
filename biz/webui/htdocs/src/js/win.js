var $ = require('jquery');
var bootstrapV5 = require('./bootstrap-v5');

var alertDialog;
var confirmDialog;
var handleConfirm;

var DISSMISS_BTN = '<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>';

exports.DISSMISS_BTN = DISSMISS_BTN;

function isFunc(fn) {
  return typeof fn === 'function';
}

function isStr(str) {
  return typeof str === 'string';
}

function wrapDialog(title, body, footer) {
  return '<div class="modal fade w-win-dialog" tabindex="-1" role="dialog">' +
    '<div class="modal-dialog" role="document">' +
      '<div class="modal-content">' +
        '<div class="modal-header"><h4 class="modal-title">' + title + '</h4>' +
          '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
        '</div>' +
        '<div class="modal-body">' + body + '</div>' +
        '<div class="modal-footer">' + footer + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function createAlert() {
  if (!alertDialog) {
    var footer = DISSMISS_BTN + '<button type="button" class="btn btn-primary w-copy-text-with-tips" data-bs-dismiss="modal"></button>';
    alertDialog = $(wrapDialog('Alert', '<pre class="alert alert-danger"></pre>', footer));
  }
  return alertDialog;
}

function createConfirm() {
  if (!confirmDialog) {
    var footer = '<button type="button" class="btn btn-outline-secondary w-win-cancel" data-bs-dismiss="modal">Cancel</button>' +
        '<button type="button" class="btn btn-danger w-win-delete-all" data-bs-dismiss="modal">Delete All</button>' +
        '<button type="button" class="btn btn-primary w-win-confirm" data-bs-dismiss="modal">Confirm</button>';
    confirmDialog = $(wrapDialog('Confirm', '<pre></pre>', footer));
    confirmDialog.on('click', '.w-win-cancel', function () {
      if (isFunc(handleConfirm)) {
        handleConfirm(false);
      }
      handleConfirm = null;
    });
    confirmDialog.on('click', '.w-win-delete-all', function () {
      if (isFunc(handleConfirm)) {
        handleConfirm(2);
      }
      handleConfirm = null;
    });
    confirmDialog.on('click', '.w-win-confirm', function () {
      if (isFunc(handleConfirm)) {
        handleConfirm(1);
      }
      handleConfirm = null;
    });
  }
  return confirmDialog;
}

function mockAlert(msg, copyText, btnText, className) {
  createAlert();
  var pre = alertDialog.find('pre').text(msg)[0];
  pre.className = 'alert ' + (className || 'alert-danger');
  bootstrapV5.show(alertDialog[0]);
  var btn = alertDialog.find('.w-copy-text-with-tips');
  if (copyText && isStr(copyText)) {
    btn.text(btnText || 'Copy');
    btn.show().attr('data-clipboard-text', copyText);
  } else {
    btn.hide();
  }
}

function mockConfirm(msg, cb, removeAllBtn, flag) {
  createConfirm();
  if (confirmDialog.is(':visible')) {
    return;
  }
  confirmDialog.find('.w-win-delete-all')[removeAllBtn ? 'show' : 'hide']();
  handleConfirm = cb;
  confirmDialog.find('pre').text(msg);
  bootstrapV5.show(confirmDialog[0]);
  if (flag) {
    confirmDialog.attr('data-confirm-flag', flag);
  } else {
    confirmDialog.removeAttr('data-confirm-flag');
  }
}

exports.alert = mockAlert;
exports.confirm = mockConfirm;
exports.isFunc = isFunc;
exports.isStr = isStr;
