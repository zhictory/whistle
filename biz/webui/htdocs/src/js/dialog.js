var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var ModalFooter = require('./modal-footer');
var bootstrapV5 = require('./bootstrap-v5');
var isFunc = require('./util').isFunc;

var Dialog = React.createClass({
  getInitialState: function () {
    return {};
  },
  componentDidMount: function () {
    var self = this;
    var props = self.props;
    var container = $(document.createElement('div'));
    self.container = container;
    var clazz = props.fullCustom ? ' w-custom-dialog' : '';
    var wstyle = props.wstyle;
    container.addClass('modal fade' + clazz + (wstyle ? ' ' + wstyle : ''));
    document.body.appendChild(container[0]);
    self.componentDidUpdate();
    if (isFunc(props.customRef)) {
      props.customRef(self);
    }
    var element = container[0];
    if (isFunc(props.onClose)) {
      element.addEventListener('hidden.bs.modal', props.onClose);
    }
    element.addEventListener('hide.bs.modal', function() {
      self._isVisible = false;
    });
    element.addEventListener('show.bs.modal', function() {
      self._isVisible = true;
    });
    if (isFunc(props.onShow)) {
      element.addEventListener('shown.bs.modal', function() {
        props.onShow(self);
      });
    }
  },
  componentDidUpdate: function () {
    var self = this;
    ReactDOM.unstable_renderSubtreeIntoContainer(
      self,
      self.getDialogElement(),
      self.container[0]
    );
  },
  getDialogElement: function () {
    var props = this.props;
    var style;
    if (props.width) {
      style = style || {};
      style.width = props.width;
    }
    if (props.fullCustom && props.height) {
      style = style || {};
      style.height = props.height;
    }
    return (
      <div
        style={style}
        className={'modal-dialog ' + (props.wclassName || '')}
      >
        <div className="modal-content">
          {props.children}
          {props.closable ? <ModalFooter /> : null}
        </div>
      </div>
    );
  },
  componentWillUnmount: function () {
    this.container && bootstrapV5.dispose(this.container[0]);
    var container = this.container[0];
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  },
  show: function () {
    var self = this;
    var container = self.container;
    if (container.hasClass('show')) {
      return;
    }
    self._isVisible = true;
    bootstrapV5.show(container[0], {
      backdrop: self.props.disableBackdrop ? false : true
    });
  },
  isVisible: function () {
    return this._isVisible;
  },
  hide: function () {
    bootstrapV5.hide(this.container[0]);
  },
  destroy: function () {
    var self = this;
    if (self._isVisible) {
      self.container.one('hidden.bs.modal', function() {
        self.componentWillUnmount();
      });
      self.hide();
    } else {
      self.componentWillUnmount();
    }
  },
  render: function () {
    return null;
  }
});

module.exports = Dialog;
