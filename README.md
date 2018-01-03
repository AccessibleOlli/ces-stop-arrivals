# #AccessibleOlli bus stop arrivals board

## Overview

## Installing

1. Install [Node](https://nodejs.org)
2. Clone this repo
  - *change to directory where you want to install*
  - `git clone git@github.com:AccessibleOlli/ces-stop-arrivals.git`
3. Install node modules
  - `cd ces-stop-arrivals`
  - `npm install`
4. Create a text file in the root directory called `.env` and insert this:

```
REACT_APP_REMOTE_TELEMETRY_DB=http://admin:password@127.0.0.1:5984/telemetry_transitions
REACT_APP_REMOTE_EVENT_DB=http://admin:password@127.0.0.1:5984/rule_event_transitions
REACT_APP_OLLI_STOP_IDX=3
```

## Running

1. `npm start`