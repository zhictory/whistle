var React = require('react');

var DismissBtn = React.createClass({
  render: function () {
    return (
      <button
        type="button"
        className="btn btn-outline-secondary"
        data-bs-dismiss="modal"
      >
        Close
      </button>
    );
  }
});

module.exports = DismissBtn;
