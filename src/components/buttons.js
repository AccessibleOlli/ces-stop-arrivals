import React, { Component } from 'react';
import Talk from './talk';
import ToggleRoute from './toggle_route';

export default class Buttons extends Component {

  render() {
    return (
      <div style={{ margin: 10 }} className="pill">
        <Talk />
        <ToggleRoute />
      </div>
    );
  }
}