import React, { Component } from 'react';

export default class StopHeader extends Component {

  render() {
    let stopName = 'TBD';
    let stopDescription = 'TBD';
    if (this.props.stop && this.props.stop.properties) {
      stopDescription = this.props.stop.properties.description;
      stopName = this.props.stop.properties.name;
    }
    return (
      <div className="stop-info">
        <h2>Explore {stopName}</h2>
        <div><img className="stop-picture" src="./img/pic_placeholder.png" /></div>
        <p>{stopDescription}</p>
      </div>
    );
  }

}
