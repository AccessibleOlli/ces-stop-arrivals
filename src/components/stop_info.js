import React, { Component } from 'react';
import Siema from 'siema';

const CAROUSEL_TIME_MILLIS = 6000;

export default class StopHeader extends Component {

  componentDidMount() {
    this.siema = new Siema({
      loop: true,
      onInit: () => { this.advanceSlide(); },
      onChange: () => { this.advanceSlide(); }
    });
  }

  advanceSlide() {
    setTimeout(() => {
      this.siema.next();
    }, CAROUSEL_TIME_MILLIS);
  }

  render() {
    console.log(this.props.stop);
    let stopName = 'TBD';
    let stopDescription = 'TBD';
    let stopFactoids = [];
    if (this.props.stop && this.props.stop.properties) {
      stopDescription = this.props.stop.properties.description;
      stopName = this.props.stop.properties.name;
      stopFactoids = this.props.stop.properties.factoids;
    }
    let slides = [];
    if (stopFactoids) {
      for (let factoid of stopFactoids) {
        slides.push(<div><h3>{factoid}</h3></div>);
      }
    }
    return (
      <div className="stop-info">
        <h2>Explore {stopName}</h2>
        <div><img className="stop-picture" src="./img/discovery-square.png" /></div>
        <div class="siema" style={{width: "580px;"}}>{slides}</div>
      </div>
    );
  }

}
