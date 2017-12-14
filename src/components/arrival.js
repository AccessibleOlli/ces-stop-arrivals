import React, { Component } from 'react';
import { connect } from 'react-redux';

class Arrival extends Component {
    render() {
        return (
            <div>
                <span>next Olli in: </span>
                <span className="clock">4 minutes{this.props.arrivaltime}</span>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        arrivaltime: state.arrivaltime
    };
  }
  
export default connect(mapStateToProps)(Arrival);
