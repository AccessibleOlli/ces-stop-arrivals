import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setPOICategory } from '../actions/index'

class TogglePOICategory extends Component {

  selectCategory(category) {
    if (category === this.props.poiCategory) {
      this.props.setPOICategory(null);
    }
    else {
      this.props.setPOICategory(category);
    }
  }

  renderButton(category, imgpath) {
    return (
      <button className='bx--btn bx--btn--secondary' 
        onClick={() => this.selectCategory(category)}>{category} 
        <img src={imgpath} height="24" alt={category}/>
      </button>
    )
  }

  render() {
    return (
      <div className="stop-panel">
        <h2>Points of Interest</h2>
        {this.renderButton('Health', './img/noun_854071_cc.png')}
        {this.renderButton('Food', './img/noun_1012350_cc.png')}
        {this.renderButton('Attractions', './img/noun_1012350_cc.png')}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    poiCategory: state.poiCategory
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setPOICategory: setPOICategory
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TogglePOICategory);