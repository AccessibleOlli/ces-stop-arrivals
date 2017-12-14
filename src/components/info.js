import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

const THIS_STOP = [-92.467148454828,44.022351687354];

const mapboxglaccessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
var mapboxdirections = axios.create({
    baseURL: 'https://api.mapbox.com/directions/v5/mapbox/driving'
});

class Info extends Component {

    constructor() {
        super();
        this.state = {
            loadingdirections: false,
            directions: []
        }
    }

    updateDirections() {
        if (!this.props.poi) 
            this.setState({
                loadingdirections: false, 
                directions: []
            });
        let lon = this.props.poi.geometry.coordinates[0];
        let lat = this.props.poi.geometry.coordinates[1];
        let dirurl = "/"+THIS_STOP[0]+","+THIS_STOP[1]+";"+lon+","+lat; //-92.466,44.024";
        dirurl += "?access_token="+mapboxglaccessToken+"&overview=false&steps=true&annotations=distance";
        // pk.eyJ1IjoibWFwb2xsaSIsImEiOiJjajBzd25hZ2EwNTh1MzJvNW56aHkybTN3In0.ZuZ_XILook5zfWBaSFaeqg

        this.setState({loadingdirections: true});
        mapboxdirections.get(dirurl)
            .then(response => {
                // console.log("Got directions!!");
                let steps = response.data.routes[0].legs[0].steps;
                let stepdirections = [];
                for (let i = 0; i < steps.length; i++) {
                    const step = steps[i];
                    let d = step.maneuver.instruction;
                    if ( step.distance > 2 )
                        d += " and travel "+step.distance+" meters";
                    stepdirections.push(d);
                }
                this.setState({
                    loadingdirections: false, 
                    directions: stepdirections
                })
            })
            .catch(error => {
                this.setState({loadingdirections: false, directions: JSON.stringify(error)});
                console.log("Error getting directions: "+error);
            });
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return !this.loadingdirections;
    // }

    render() {
        if (!this.props.message || !this.props.message.messageHtml) {
            let msg = {__html: "<h2>Welcome. Where would you like to go?</h2><p>Select a stop on the map.</p>"};
            return (
                <div className="convo">
                    <div dangerouslySetInnerHTML={msg} />
                </div>
            );
        }
        // console.log(JSON.stringify(this.props.poi));
        // const steps = this.state.directions.map((step, index) =>
        //     <li key={index}>{step}</li>
        // );

        let stuff = 0;
        if (this.props.message.poiNames) stuff = this.props.message.poiNames.length;

        return (
            <div className="convo">
                {/* <h3 key={this.props.poi.properties.name}>{this.props.poi.properties.name}</h3>
                <button className="bx--btn bx--btn--secondary" 
                        onClick={() => this.updateDirections()}>Get Directions</button>
                <ol>{steps}</ol> */}
                <div dangerouslySetInnerHTML={this.props.message.messageHtml} />
                <div>{stuff}</div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        message: state.mapMsg
    };
  }
  
export default connect(mapStateToProps)(Info);
