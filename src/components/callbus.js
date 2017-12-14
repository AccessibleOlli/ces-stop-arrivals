import React, { Component } from 'react';

export default class CallBus extends Component {

  render() {
    return (
      <div className="stop-panel">
        <h2>Hail Olli</h2>
        <button className='bx--btn bx--btn--secondary btn--bigaction'>
          <img src="./img/noun_1015710_cc.png" alt="Press to call Olli" height="48px" />
        </button>
      </div>
    );
  }
}
