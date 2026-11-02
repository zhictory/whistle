var React = require('react');
var Icon = require('./icon');

var Tabs = React.createClass({
  render: function() {
    var props = this.props;
    var tabs = props.tabs || [];
    var onChange = props.onChange;

    return (
      <ul className="nav nav-tabs w-tabs" role="tablist">
        {
          tabs.map(function(tab, index) {
            var handleClick = function() {
              if (!tab.active && onChange) {
                onChange(tab);
              }
            };
            return (
              <li key={index} className="nav-item" role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!!tab.active}
                  className={'nav-link' + (tab.active ? ' active' : '')}
                  onClick={handleClick}
                >
                  {tab.icon ? <Icon name={tab.icon} /> : null}
                  {tab.name}
                </button>
              </li>
            );
          })
        }
      </ul>
    );
  }
});

module.exports = Tabs;
