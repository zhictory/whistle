var React = require('react');

var CloseBtn = React.createClass({
  shouldComponentUpdate: function (nextProps) {
    var props = this.props;
    return props.onClick !== nextProps.onClick || props.className !== nextProps.className;
  },
  render: function() {
    var onClick = this.props.onClick;
    return <button
            type="button"
            className={'btn-close ' + (this.props.className || '')}
            data-bs-dismiss={onClick ? null : 'modal'}
            aria-label="Close"
            onClick={onClick}></button>;
  }
});

module.exports = CloseBtn;
