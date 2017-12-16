import React, { Component } from 'react';

export default class StopHeader extends Component {

  render() {
    let stopName = 'TBD';
    if (this.props.stop && this.props.stop.properties) {
        stopName = this.props.stop.properties.name;
    }
    return (
        <div className="stop-name-div">
          <h1 className="stop-name">{stopName}</h1>
        </div>
    );
  }

}
