import React, { Component } from 'react'
import { connect } from 'react-redux'

class ArrivalInfo extends Component {
  constructor (props) {
    super(props)
    this.kph = 20
    this.stops = []
    this.state = {
      stops: []
    }
  }

  getArrivingMessage (distance) {
    let time = (distance / this.kph) * 60
    let msg = '--'
    let min = Math.floor(time)
    let sec = Math.floor((time - min) * 60)
    if (time === 0) {
      msg = 'Arrived'
    } else if (time < 0.3) {
      msg = 'Arriving now'
    } else if (time < 1.5) {
      msg = 'Arriving in 1 min'
    } else {
      msg = `Arriving in ${min}:${(sec < 10 ? '0' : '') + sec} mins`
    }
    return msg
  }

  getRollingListStatus (distance, next) {
    let time = (distance / this.kph) * 60
    let src = next ? 'roller-list-stop-next' : 'roller-list-stop'
    if (time === 0) {
      src = 'roller-list-stop-arriving'
    } else if (time < 0.3) {
      src = 'roller-list-stop-next'
    }
    return src
  }

  initArrivals (route) {
    this.stops = (route.stops || []).map((stop, index) => {
      // let time = route.stops[]
      return {
        id: 'stop-' + index,
        coord: stop.coordinates,
        name: stop.name,
        distance: route.stopDistances[index]
      }
    })

    this.setState({
      stops: this.stops.map((stop, index) => {
        let d = 0
        for (var i = index;  i > 0; i--) {
          d += route.stopDistances[i]
        }
        return {
          id: stop.id,
          name: stop.name,
          arriving: this.getArrivingMessage(d),
          status: this.getRollingListStatus(d)
        }
      })
    })
  }

  updateArrivalInfo (position) {
    let dist = position.distanceRemaining
    let next = (position.nextStop || position.currentStop).coordinates

    let index = this.stops.findIndex(stop => {
      return stop.coord[0] === next[0] && stop.coord[1] === next[1]
    })

    if (index > -1) {
      let stops = this.stops.slice()
      for (var i = 0; i < index; i++) {
        stops.push(stops.shift())
      }

      if (!position.position && !position.nextStop) {
        // trip_end
        this.setState({
          stops: stops.map((stop, index) => {
            return {
              id: stop.id,
              name: stop.name,
              arriving: index === 0 ? this.getArrivingMessage(dist) : '--',
              status: index === 0 ? this.getRollingListStatus(dist, index === 0) : this.getRollingListStatus(99999)
            }
          }).sort((a, b) => {
            return a.id.localeCompare(b.id)
          })
        })
      } else {
        // geo_position or trips_end
        this.setState({
          stops: stops.map((stop, index) => {
            let d = dist
            for (var j = index; j > 0; j--) {
              d += stops[j].distance
            }
            return {
              id: stop.id,
              name: stop.name,
              arriving: this.getArrivingMessage(d),
              status: this.getRollingListStatus(d, index === 0)
            }
          }).sort((a, b) => {
            return a.id.localeCompare(b.id)
          })
        })
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.olliRoute !== this.props.olliRoute) {
      this.initArrivals(nextProps.olliRoute)
    }
    if (nextProps.olliPosition !== this.props.olliPosition) {
      this.updateArrivalInfo(nextProps.olliPosition)
    }
  }

  render () {
    if (this.state.stops.length === 0) {
      return <div>Stops not yet available</div>
    } else {
      return (
        <ul className="arrival-stops">
          {this.state.stops.map(stop =>
            <li key={stop.id}>
              <div className="arrival-stop-img"><img src={'img/' + stop.status + '.png'} alt={stop.status}/></div>
              <div className="arrival-stop-info">
                <div>{stop.name}</div>
                <span>{stop.arriving}</span>
              </div>
            </li>
          )}
        </ul>
      )
    }
  }
}

function mapStateToProps (state) {
  return {
    olliPosition: state.olliPosition,
    olliRoute: state.olliRoute
  }
}

export default connect(mapStateToProps)(ArrivalInfo)
