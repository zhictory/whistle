var React = require('react');
var Dialog = require('./dialog');
var ModalHeader = require('./modal-header');
var QRCodeImg = require('./qrcode');
var Icon = require('./icon');
var util = require('./util');

var QRCodeDialog = React.createClass({
  getInitialState: function () {
    return {};
  },
  shouldComponentUpdate: util.scuDlg,
  show: function (url) {
    this.refs.dialog.show();
    this.setState({ url: url });
  },
  render: function () {
    var url = this.state.url;

    return (
      <Dialog ref="dialog" wstyle="w-qrcode-dialog" closable>
        <ModalHeader>QR Code</ModalHeader>
        <div className="modal-body">
          <div className="w-qrcode-url-wrap">
            <input readOnly value={url} />
            <Icon name="copy" className="w-copy-text-with-tips" data-clipboard-text={url} />
          </div>
          <QRCodeImg url={this.state.url} />
        </div>
      </Dialog>
    );
  }
});

module.exports = QRCodeDialog;
