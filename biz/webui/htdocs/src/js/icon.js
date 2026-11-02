var React = require('react');

var BOOTSTRAP_ICONS = {
  'arrow-down': 'arrow-down',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  'chevron-down': 'chevron-down',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevron-up': 'chevron-up',
  cog: 'gear',
  console: 'terminal',
  copy: 'clipboard',
  'download-alt': 'download',
  edit: 'pencil',
  'eye-open': 'eye',
  export: 'box-arrow-up',
  file: 'file-earmark',
  filter: 'funnel',
  'folder-close': 'folder-fill',
  'folder-open': 'folder',
  globe: 'globe2',
  import: 'box-arrow-in-down',
  list: 'list-ul',
  link: 'link-45deg',
  lock: 'lock',
  'menu-left': 'chevron-left',
  'menu-right': 'chevron-right',
  minus: 'dash',
  'minus-sign': 'dash-lg',
  'new-window': 'box-arrow-up-right',
  'ok-circle': 'check-circle',
  plus: 'plus-lg',
  'question-sign': 'question-circle',
  remove: 'x-lg',
  repeat: 'arrow-repeat',
  refresh: 'arrow-clockwise',
  'resize-full': 'arrows-angle-expand',
  stats: 'bar-chart-line',
  'save-file': 'floppy',
  send: 'send',
  star: 'star-fill',
  stop: 'stop-fill',
  'th-large': 'grid-3x3-gap-fill',
  transfer: 'arrow-left-right',
  trash: 'trash3',
  'tree-conifer': 'diagram-3'
};

var Icon = React.createClass({
  shouldComponentUpdate: function (nextProps) {
    var props = this.props;
    return props.name !== nextProps.name || props.className !== nextProps.className
      || props['data-name'] !== nextProps['data-name']
      || props['data-clipboard-text'] !== nextProps['data-clipboard-text']
      || props.title !== nextProps.title
      || props.onClick !== nextProps.onClick;
  },
  render: function() {
    var props = this.props;
    var className = props.className;
    var biName = BOOTSTRAP_ICONS[props.name];

    return <span
      className={
        (biName ? 'bi bi-' + biName + ' glyphicon' : 'glyphicon glyphicon-' + props.name) +
        (className ? ' ' + className : '')
      }
      data-name={props['data-name']}
      data-clipboard-text={props['data-clipboard-text']}
      title={props.title}
      onClick={props.onClick}
    />;
  }
});

module.exports = Icon;
