require('../css/btn-group.css');
var React = require('react');
var util = require('./util');
var Icon = require('./icon');

var BtnGroup = React.createClass({
  handleClick: function (btn) {
    if (btn.active || btn.disabled) {
      return;
    }
    var self = this;
    var onClick = self.props.onClick;
    self.clearSelection();
    btn.active = true;
    if (!onClick || onClick(btn)) {
      self.setState({
        curBtn: btn
      });
    }
  },
  clearSelection: function() {
    var list = this.props.tabs || this.props.btns;
    list.forEach(function (btn) {
      btn.active = false;
    });
  },
  onDoubleClick: function (e) {
    var onDoubleClick = this.props.onDoubleClick;
    onDoubleClick && onDoubleClick(e);
    e.stopPropagation();
  },
  render: function () {
    var self = this;
    var props = self.props;
    var tabs = props.tabs;
    var isSmall = props.type === 's';
    var list = tabs || props.btns;
    var disabled = util.getBool(props.disabled);

    return (
      <div
        onDoubleClick={props.onDoubleClickBar}
        className={
          (tabs ? 'nav w-tabs-sm' : 'btn-group btn-group-sm w-btn-group-sm') +
          (isSmall ? ' small' : '')
        }
        role={tabs ? 'tablist' : null}
      >
        {list.map(function (btn) {
          btn.disabled = disabled;
          btn.key = btn.key || util.getKey();

          return (
            <button
              onClick={function () {
                self.handleClick(btn);
              }}
              onDoubleClick={self.onDoubleClick}
              key={btn.key}
              type="button"
              data-name={btn.name}
              role={tabs ? 'tab' : null}
              aria-selected={tabs ? !!btn.active : null}
              style={util.getHideStyle(btn.hide)}
              title={btn.title}
              className={
                (tabs ? 'nav-link' : 'btn btn-outline-secondary') +
                (btn.active && !disabled ? ' active' : '') +
                (btn.className ? ' ' + btn.className : '')
              }
            >
              {btn.icon ? <Icon name={btn.icon} /> : null}
              {btn.display || btn.name}
            </button>
          );
        })}
        {props.appendTabs || props.appendBtns}
        {props.dockBtn}
      </div>
    );
  }
});

module.exports = BtnGroup;
