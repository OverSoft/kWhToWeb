# kWhToWeb

## Synopsis
Web application that shows live readouts from Modbus enabled kWh meters (using Websockets) and logs them.
Includes default support for the Eastron SDM630 (because that's what i have ;))
The default setup includes power generation data for use in solar power installations.
Runs fine on a raspberry pi (raspbian).

## Screenshots
![Screenshot 1](/readme/screenshot1.jpg?raw=true "Screenshot 1")

## Requirements
- Any linux version
- node.js v6+
- A USB to RS485 adapter with drivers for your platform
- A Modbus enabled kWh meter

## Installation
- Check that you can access the RS485 adapter (usually it's available at /dev/ttyUSB0)
- Install node.js (use a precompiled binary if installing on a Raspberry Pi)
- Extract this repository or git clone it.
- Run "npm install" to install the required libraries
- Run "node server.js" to start serving and logging (it's available at IP:3000 by default)

## Changing default settings
- If you want to change the serial settings (like baudrate, stopbits, etc...) edit main.js.
- If you want to change the modbus device address (it's 1 by default) edit sdm630.js.
- If you want to change the modbus register mapping for your device, feel free to edit sdm630.js or make a copy and edit that.
- It's very much made for my installation, so if you want to add, remove or change any gauges on the main page, feel free to edit public/index.html

## Used libraries
node.js:
- express
- socket.io
- modbusrtu
- moment
- node-cleanup

index.html
- [socket.io](https://socket.io/)
- [jQuery](http://jquery.com/)
- [d3.js](https://d3js.org/)
- [Vizuly radial progress](http://vizuly.io/product/radial-progress/)
- [Chart.js](http://www.chartjs.org/)

## Running on boot
If you want to run this program on boot, just add the following lines to /etc/rc.local
- cd /path/to/app
- nohup node server.js &

In some weird cases, the serial port settings don't stick the first time "stty" set them.
In that case, remove the -e from the hashbang of rc.local and run the stty command before the node command above.
For example:
- stty -F /dev/ttyUSB0 "0:0:8be:0:0:0:0:0:0:1:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0"
(This sets the serial port to 19200 baud, 8n1, hardware flow control)

## Support
No, not really, i made this just for fun.

## License
This piece of software is available under the GNU GPL.
This basically means that you can do whatever you want with it: modify it, sell it, whatever, as long as you mention me as an author and provide the source code to any changes to my code.
