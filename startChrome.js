const chromeLauncher = require('chrome-launcher');

chromeLauncher.launch({
    startingUrl: 'http://localhost:' + process.env.PORT,
    chromeFlags: ['--kiosk','--no-default-browser-check']
}).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
});