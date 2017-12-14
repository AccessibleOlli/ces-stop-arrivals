import React, { Component } from 'react';
import { connect } from 'react-redux';

export default class StopHeader extends Component {

  render() {
    let stopName = 'TBD';
    if (this.props.stop && this.props.stop.properties) {
        stopName = this.props.stop.properties.name;
    }
    return (
      <h1 className="stop-name"><img className="olli-logo" src="./img/olli-logo.svg" />{stopName}</h1>
    );
  }

}
