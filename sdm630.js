/**
 * Created by Laurens on 3-6-2017.
 */
"use strict";

const Modbus = require("modbusrtu").Modbus;

exports.Sdm630 = Sdm630;

function Sdm630(serialPort, baudRate, bitSettings, initComplete) {
    let curObj        = this;
    this.interval     = null;
    this.dataBuffer   = {
        lastUpdate:  Date.now(),
        frequency:   50,
        volts:       {
            p1: 0,
            p2: 0,
            p3: 0
        },
        power:       {
            p1:    0,
            p2:    0,
            p3:    0,
            total: 0
        },
        amp:         {
            p1:    0,
            p2:    0,
            p3:    0,
            total: 0
        },
        va:          {
            p1:    0,
            p2:    0,
            p3:    0,
            total: 0
        },
        var:         {
            p1:    0,
            p2:    0,
            p3:    0,
            total: 0
        },
        powerFactor: {
            p1: 0,
            p2: 0,
            p3: 0
        },
        phaseAngle:  {
            p1: 0,
            p2: 0,
            p3: 0
        },
        totals:      {
            import: {
                wh:  0,
                var: 0
            },
            export: {
                wh:  0,
                var: 0
            }
        }
    };
    /*
       This function updates the current data
       This maps the modbus registers to the data object
    */
    this.updateModbus = (complete) => {
        modbus.readInpRegs(1, 0, 80, (err, data) => {
            if (err) {
                complete(err);
                return;
            }
            this.dataBuffer.volts.p1          = getRegister(data, 0);
            this.dataBuffer.volts.p2          = getRegister(data, 1);
            this.dataBuffer.volts.p3          = getRegister(data, 2);
            this.dataBuffer.amp.p1            = getRegister(data, 3);
            this.dataBuffer.amp.p2            = getRegister(data, 4);
            this.dataBuffer.amp.p3            = getRegister(data, 5);
            this.dataBuffer.amp.total         = this.dataBuffer.amp.p1 + this.dataBuffer.amp.p2 + this.dataBuffer.amp.p3;
            this.dataBuffer.power.p1          = getRegister(data, 6);
            this.dataBuffer.power.p2          = getRegister(data, 7);
            this.dataBuffer.power.p3          = getRegister(data, 8);
            this.dataBuffer.power.total       = this.dataBuffer.power.p1 + this.dataBuffer.power.p2 + this.dataBuffer.power.p3;
            this.dataBuffer.va.p1             = getRegister(data, 9);
            this.dataBuffer.va.p2             = getRegister(data, 10);
            this.dataBuffer.va.p3             = getRegister(data, 11);
            this.dataBuffer.va.total          = this.dataBuffer.va.p1 + this.dataBuffer.va.p2 + this.dataBuffer.va.p3;
            this.dataBuffer.var.p1            = getRegister(data, 12);
            this.dataBuffer.var.p2            = getRegister(data, 13);
            this.dataBuffer.var.p3            = getRegister(data, 14);
            this.dataBuffer.var.total         = this.dataBuffer.var.p1 + this.dataBuffer.var.p2 + this.dataBuffer.var.p3;
            this.dataBuffer.powerFactor.p1    = getRegister(data, 15);
            this.dataBuffer.powerFactor.p2    = getRegister(data, 16);
            this.dataBuffer.powerFactor.p3    = getRegister(data, 17);
            this.dataBuffer.phaseAngle.p1     = getRegister(data, 18);
            this.dataBuffer.phaseAngle.p2     = getRegister(data, 19);
            this.dataBuffer.phaseAngle.p3     = getRegister(data, 20);
            this.dataBuffer.frequency         = getRegister(data, 35);
            this.dataBuffer.totals.import.wh  = getRegister(data, 36);
            this.dataBuffer.totals.export.wh  = getRegister(data, 37);
            this.dataBuffer.totals.import.var = getRegister(data, 38);
            this.dataBuffer.totals.export.var = getRegister(data, 39);
            this.dataBuffer.lastUpdate        = Date.now();
            complete(null, this.dataBuffer);
        });
    };
    this.startPolling = (pollInterval, callback) => {
        this.interval = setInterval(() => {
            curObj.updateModbus(callback)
        }, pollInterval);
    };
    this.stopPolling  = () => {
        clearInterval(this.interval);
        this.interval = null;
    };

    let modbus = new Modbus(serialPort, {
            baud:    baudRate,
            fmt:     bitSettings,
            timeout: 500
        }, (err) => {
            if (!err) {
                this.updateModbus(initComplete);
            } else {
                initComplete("Modbus constructor error: " + err);
            }
        }
    );

}


// Various functions to convert raw bytes to floating point values
function to16bitHex(val) {
    let hexVal = "" + val.toString(16);
    for (let i = hexVal.length; i < 4; i++) {
        hexVal = "0" + hexVal;
    }
    return hexVal;
}
function convDataToFloat(data, offset) {
    let hex = to16bitHex(data[offset]) + to16bitHex(data[offset + 1]);
    let buf = Buffer.from(hex, "hex");
    return buf.readFloatBE(0);
}
function getRegister(data, regVal) {
    return convDataToFloat(data, regVal * 2);
}
