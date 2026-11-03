require('../css/dropdown.css');
var React = require('react');
var BootstrapDropdown = require('bootstrap/js/dist/dropdown');
var util = require('./util');
var Icon = require('./icon');

var DropDown = React.createClass({
  getInitialState: function () {
    return { open: false };
  },
  componentDidMount: function () {
    var self = this;
    if (!self.refs.toggle) {
      return;
    }
    self._dropdown = BootstrapDropdown.getOrCreateInstance(self.refs.toggle);
    self._onShow = function () {
      var onBeforeShow = self.props.onBeforeShow;
      if (onBeforeShow) {
        onBeforeShow();
      }
    };
    self._onShown = function () {
      self.setState({ open: true });
    };
    self._onHidden = function () {
      self.setState({ open: false });
    };
    self.refs.toggle.addEventListener('show.bs.dropdown', self._onShow);
    self.refs.toggle.addEventListener('shown.bs.dropdown', self._onShown);
    self.refs.toggle.addEventListener('hidden.bs.dropdown', self._onHidden);
  },
  componentWillUnmount: function () {
    if (this.refs.toggle) {
      this.refs.toggle.removeEventListener('show.bs.dropdown', this._onShow);
      this.refs.toggle.removeEventListener('shown.bs.dropdown', this._onShown);
      this.refs.toggle.removeEventListener('hidden.bs.dropdown', this._onHidden);
    }
    if (this._dropdown) {
      this._dropdown.dispose();
    }
  },
  onChange: function (option) {
    var self = this;
    var onChange = self.props.onChange;
    if (onChange) {
      onChange(option);
    }
    if (self.props.value == null) {
      self.setState({
        selectedOption: option
      });
    }
  },
  selectOption: function (option) {
    this._dropdown && this._dropdown.hide();
    if (option === this.getSelectedOption() || option === this.state.selectedOption) {
      return;
    }
    this.onChange(option);
    this.setState({ open: false });
  },
  getSelectedOption: function () {
    var props = this.props;
    var value = props.value;
    if (value == null) {
      return;
    }
    return util.findArray(props.options, function (item) {
      return item === value || item.value === value;
    });
  },
  render: function () {
    var self = this;
    var props = self.props;
    var state = self.state;
    var help = props.help;
    var options = props.options || [];
    var firstOption = options[0] || {};
    var disabled = props.disabled;
    var selectedOption =
      this.getSelectedOption() || state.selectedOption || firstOption;

    return (
      <div
        className="dropdown w-dropdown"
      >
        <button
          ref="toggle"
          type="button"
          style={{
            color:
              selectedOption === firstOption
                ? null
                : selectedOption.color || 'var(--c-error)'
          }}
          title={selectedOption.text}
          className={
            'dropdown-toggle w-dropdown-text' + (disabled ? ' w-disabled' : '')
          }
          data-bs-toggle="dropdown"
          aria-expanded={state.open}
          disabled={disabled}
        >
          {selectedOption.icon ? <Icon name={selectedOption.icon} /> : null}
          {selectedOption.text}
        </button>
        <ul
          style={{
            padding: help ? null : 0
          }}
          className="dropdown-menu"
        >
          {options.map(function (option) {
            return (
              <li key={option.value}>
                <button
                  type="button"
                  title={option.text}
                  data-value={option.value}
                  className="dropdown-item"
                  onClick={function () {
                    self.selectOption(option);
                  }}
                >
                  {option.icon ? <Icon name={option.icon} /> : null}
                  {option.text}
                </button>
              </li>
            );
          })}
          {help ? <li><hr className="dropdown-divider" /></li> : null}
          {help ? (
            <li>
              <a
                className="dropdown-item"
                href={help}
                target="_blank"
                onClick={function () {
                  self._dropdown && self._dropdown.hide();
                }}
              >
                <Icon name="question-sign" />
                Help
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    );
  }
});

module.exports = DropDown;
