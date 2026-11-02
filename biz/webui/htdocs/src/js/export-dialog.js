var React = require('react');
var Dialog = require('./dialog');
var ShareViaUrlBtn = require('./share-via-url-btn');
var util = require('./util');
var ModalHeader = require('./modal-header');
var ModalFooter = require('./modal-footer');

function getDefaultSuffix(name) {
  return name === 'console' || name === 'server' ? '.log' : '.txt';
}

function getDisplaySuffix(name, filename) {
  var match = /(\.[a-z0-9]{1,10})$/i.exec(filename || '');
  return match ? match[1].toLowerCase() : getDefaultSuffix(name);
}

var ExportDialog = React.createClass({
  getInitialState: function () {
    return {
      filename: '',
      suffix: getDefaultSuffix('network')
    };
  },
  show: function (name, data) {
    var self = this;
    self.refs.dialog.show();
    setTimeout(function () {
      util.focus(self.refs.input);
    }, 500);
    name = name || 'network';
    self.setState({
      name: name,
      title: util.getDialogTitle(name, 'Export'),
      data: data,
      suffix: getDisplaySuffix(name, self.state.filename)
    });
  },
  getInputValue: function() {
    return util.formatFilename(this.refs.input.value.trim());
  },
  getFilename: function () {
    var name = this.state.name;
    var suffix = getDefaultSuffix(name);
    var filename = this.getInputValue();
    if (filename) {
      if (!/\.[a-z0-9]{1,10}$/i.test(filename)) {
        filename += suffix;
      }
      return filename;
    }
    switch (name) {
    case 'networkSettings':
      filename = 'network_settings_';
      break;
    case 'composer':
      filename = 'composer_';
      break;
    case 'console':
      filename = 'console_';
      break;
    case 'server':
      filename = 'server_';
      break;
    case 'rulesSettings':
      filename = 'rules_settings_';
      break;
    case 'valuesSettings':
      filename = 'values_settings_';
      break;
    case 'mock':
      filename = 'rules_items_';
      break;
    default:
      filename = 'network_';
    }
    return filename + util.formatDate() + suffix;
  },
  hide: function () {
    this.refs.dialog.hide();
  },
  export: function(e) {
    if (util.checkSubmit(e)) {
      return;
    }
    var self = this;
    var data = self.state.data;
    if (util.isFunc(data)) {
      data = data();
    }
    self.hide();
    util.download(data, self.getFilename());
    self.refs.input.value = '';
  },
  filterFilename: function (e) {
    var filename = util.formatFilename(e.target.value);
    this.setState({
      filename: filename,
      suffix: getDisplaySuffix(this.state.name, filename)
    });
  },
  onShare: function(err) {
    if (!err) {
      this.hide();
      this.refs.input.value = '';
    }
  },
  shouldComponentUpdate: util.scuDlg,
  render: function () {
    var self = this;
    var state = self.state;

    return (
      <Dialog ref="dialog" wstyle="w-ie-dialog w-export-dialog">
        <ModalHeader>
          {state.title}
        </ModalHeader>
        <div className="modal-body">
          <div className="w-export-filename-row">
            <div className="input-group w-export-filename-group">
              <input
                ref="input"
                value={state.filename}
                onChange={self.filterFilename}
                onKeyDown={self.export}
                placeholder="Enter filename (optional)"
                className="form-control"
                aria-label="Export filename"
                maxLength="64"
              />
              <span className="input-group-text w-export-suffix">
                {state.suffix}
              </span>
            </div>
            <span className="w-export-filename-hint">
              The extension is added automatically.
            </span>
          </div>
        </div>
        <ModalFooter>
          <ShareViaUrlBtn type={state.name} data={state.data} getFilename={self.getInputValue} onComplete={self.onShare} />
          <button
            type="button"
            className="btn btn-primary"
            data-bs-dismiss="modal"
            onClick={self.export}
          >
            Export
          </button>
        </ModalFooter>
      </Dialog>
    );
  }
});

module.exports = ExportDialog;
