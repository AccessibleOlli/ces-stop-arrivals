import React, { Component } from 'react';
import axios from 'axios';
import OLLI_ROUTE from '../data/route.json'

export default class Weather extends Component {
    constructor(props) {
        super(props);

        this.timer = null;
        this.ts = null;

        this.state = {
            temp: '--',
            feel: '--',
            humidity: '--',
            time: '--',
            icon: 'na',
            lat: OLLI_ROUTE.features[0].geometry.coordinates[0][1],
            lon: OLLI_ROUTE.features[0].geometry.coordinates[0][0]
        }
    }

    static defaultProps = {
        // serviceurl: window.location.origin + '/weather/{lat}/{lon}',
        refreshrate: 10
    }

    updateTime() {
        let now = (new Date()).getTime()
        let passed = Math.round((now - (this.ts ? this.ts : now)) / (1000 * 60))
        this.setState({
            time: passed
        })
    }

    getWeather() {
        let now = (new Date()).getTime()
        let passed = Math.round((now - (this.ts ? this.ts : now)) / (1000 * 60))

        if (passed > 0 && passed < this.props.refreshrate) {
            this.setState({
                time: passed
            })
        } else {
            let url = this.props.serviceurl.replace('{lat}', this.state.lat).replace('{lon}', this.state.lon)
            axios.get(url)
                .then((response) => {
                    let data = response.data.observation
                    console.log('weather api response:', data)
                    this.ts = (new Date()).getTime()
                    this.setState({
                        temp: data.temp,
                        feel: data.feels_like,
                        humidity: data.rh,
                        time: 0,
                        icon: data.wx_icon < 10 ? ('0' + data.wx_icon) : data.wx_icon
                    })
                })
                .catch((err) => {
                    console.error('weather api error:', err)
                })
        }
    }

    componentDidMount () {
        if (this.props.serviceurl) {
            // commented out to save on our rate-limited weather service requests
            // this.getWeather();
            // this.timer = setInterval(() => this.getWeather(), 10 * 1000 * 60); // every 10 min
        }
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        return (
            <div className="weather">
                <img src={"img/weather/" + this.state.icon + ".png"} alt="weather icon"/>
                <div className="forecast">
                    <span>{this.state.temp}&deg; F</span>
                    <span>Feels like {this.state.feel}&deg;</span>
                    <span>Humidity {this.state.humidity}%</span>
                    <span>Updated {this.state.time} min ago</span>
                </div>
            </div>
        );
    }
}
