"use strict";

// Requirements
const Sdm630      = require("./sdm630.js").Sdm630;
const express     = require("express");
const app         = express();
const http        = require('http').Server(app);
const io          = require('socket.io')(http);
const moment      = require('moment');
const fs          = require('fs');
const nodeCleanup = require('node-cleanup');

// Variable init
let lastData      = null;
let chartData     = [];
let kwhAtMidnight = 0;

// Write current chart data to a log file on exit
nodeCleanup(function () {
    let logFile = __dirname + "/log/" + moment().format("YYYY-MM-DD") + ".json";
    fs.writeFileSync(logFile, JSON.stringify(chartData), 'utf8');
});

// Load existing log file for today on start up (if it exists)
let logFile = __dirname + "/log/" + moment().format("YYYY-MM-DD") + ".json";
try {
    fs.accessSync(logFile, fs.constants.R_OK);
    chartData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    if (chartData[0] !== null) {
        kwhAtMidnight = chartData[0].totals.export.wh;
    }
} catch (err) {

}

// Tell webserver to server public directory
app.use(express.static('public'));

// Connect over serial to the modbus device
const sdm630 = new Sdm630("/dev/ttyUSB0", 19200, "8n1", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Initialize daily kWh start point
    if (kwhAtMidnight === 0) {
        kwhAtMidnight = data.totals.export.wh;
    }

    // Get data and transmit it to connected websockets
    lastData           = data;
    data.kwhAtMidnight = kwhAtMidnight;
    io.emit("data", data);

    // Start polling every second
    sdm630.startPolling(1000, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        // Get data and transmit it to connected websockets
        lastData           = data;
        data.kwhAtMidnight = kwhAtMidnight;
        io.emit("data", data);
    });
});

// Start charting every 5 minutes
let startTimeout = (((5 - (moment().minutes() % 5)) * 60) - moment().seconds()) + 2;
setTimeout(()=>{
    writeChart();
    setInterval(writeChart, 300000);
}, startTimeout * 1000);
console.log("Starting charting in " + startTimeout + "s");

function writeChart() {
    let now = moment();
    // Write log file of "yesterday" at midnight and clean chart
    if (now.hours() === 0 && now.minutes() === 0) {
        let logFile = __dirname + "/log/" + now.subtract(12, "hours").format("YYYY-MM-DD") + ".json";
        fs.writeFile(logFile, JSON.stringify(chartData), 'utf8');
        chartData     = [];
        kwhAtMidnight = lastData.totals.export.wh;
    }
    // Add current data to chart and transmit it to connected websockets
    chartData[Math.round((now.hours() * 12) + (now.minutes() / 5))] = JSON.parse(JSON.stringify(lastData));
    io.emit("chart", chartData);
}

// Handle websocket connections
io.on('connection', function (socket) {
    socket.emit("data", lastData);
    socket.emit("chart", chartData);
    socket.on('disconnect', function () {
    });
});

// Start webserver, change the first argument to run on a different port
http.listen(3000, function () {
    console.log('listening on *:3000');
});
