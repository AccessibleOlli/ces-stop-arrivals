# #AccessibleOlli bus stop arrivals board

## Overview

## Prerequisites

ces-arrivals-board requires [olli-stop-backend](https://github.com/AccessibleOlli/olli-stop-backend).
Follow the instructions to install olli-stop-backend before proceeding.

## Installing

1. Install [Node](https://nodejs.org)
2. Clone this repo
  - *change to directory where you want to install*
  - `git clone git@github.com:AccessibleOlli/ces-stop-arrivals.git`
3. Install node modules
  - `cd ces-stop-arrivals`
  - `npm install`
4. Copy the `.env.template` file to `.env`
  - `cp .env.template .env`
  
The file should look similar to the following:

```
PORT=44002
BROWSER=startChrome.js
REACT_APP_REMOTE_TELEMETRY_DB=http://admin:password@127.0.0.1:5984/telemetry_transitions
REACT_APP_REMOTE_EVENT_DB=http://admin:password@127.0.0.1:5984/rule_event_transitions
REACT_APP_OLLI_STOP_IDX=3
```

5. Change the CouchDB database urls to point to your CouchDB instance (with the appropriate credentials)

## Running

1. Make sure your proxy setting in `package.json` is configured properly to point to olli-stop-backend. It should look something like this:

```
"proxy": "http://localhost:44000"
```

2. Ensure you are running [olli-stop-backend](https://github.com/AccessibleOlli/olli-stop-backend)
3. `npm start`
