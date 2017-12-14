import React, { Component } from 'react';
import { connect } from 'react-redux';

class Progress extends Component {

  constructor() {
    super();
    this.stopIndex = 0;
  }
  render() {
    if (! this.props.olliPosition) {
      return <div />;
    }
    else {
      let stop1String = '';
      let stop2String = '';
      if (this.props.olliPosition.currentStop) {
        stop1String = `ARRIVED: ${this.props.olliPosition.currentStop.name}`;
      }
      else if (this.props.olliPosition.previousStop) {
        stop1String = `PREVIOUS: ${this.props.olliPosition.previousStop.name}`;
      }
      if (this.props.olliPosition.nextStop) {
        stop2String += `NEXT: ${this.props.olliPosition.nextStop.name}`;
      }
      let coords = `${(this.props.olliPosition.coordinates[0]+" ").slice(0,6)}, ${(this.props.olliPosition.coordinates[1]+" ").slice(0,6)}`;
      return (
        <div className="progresswin">
          <ul>
            <p>Coords: {coords}</p>
            <p>{stop1String}</p>
            <p>{stop2String}</p>
            <p>progress: {Math.round(this.props.olliPosition.nextStopProgress * 100)}%</p>
          </ul>
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    olliPosition: state.olliPosition
  };
}

export default connect(mapStateToProps)(Progress);