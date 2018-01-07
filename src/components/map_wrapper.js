import React, { Component } from 'react';
import Map from './map';

export default class MapWrapper extends Component {

  render() {
    return (
    <div id="mapWrapper">
        <Map stop={this.props.stop} />
    </div>
    );
  }
}
