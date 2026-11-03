var React = require('react');
var Dialog = require('./dialog');
var ModalHeader = require('./modal-header');
var Textarea = require('./textarea');
var ModalFooter = require('./modal-footer');

var TextDialog = React.createClass({
  getInitialState: function () {
    return {};
  },
  show: function (value, base64, name) {
    if (value) {
      var self = this;
      self.setState({ value: value, base64: base64, name: name }, function () {
        self.refs.dialog.show();
      });
    }
  },
  render: function () {
    var state = this.state;
    var value = state.value;
    return (
      <Dialog ref="dialog" wstyle="w-text-dialog">
        <ModalHeader>{state.name || 'Text'}</ModalHeader>
        <div className="modal-body">
          <div
            className="v-box"
            style={{ width: 860, height: 560 }}
          >
            <Textarea
              className="fill"
              value={value}
              base64={state.base64}
              defaultName={state.name}
            />
          </div>
        </div>
        <ModalFooter>
          <button
            type="button"
            className="btn btn-primary w-copy-text-with-tips"
            data-clipboard-text={value}
          >
            Copy
          </button>
        </ModalFooter>
      </Dialog>
    );
  }
});

var TextDialogWrap = React.createClass({
  shouldComponentUpdate: function () {
    return false;
  },
  show: function (value, base64, name) {
    this.refs.dialog.show(value, base64, name);
  },
  render: function () {
    return <TextDialog ref="dialog" />;
  }
});

module.exports = TextDialogWrap;
