'use strict';
let logger = require('tracer')
let fs = require('fs')
const methods=logger.colorConsole({
        format: [
            '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})', // default format
            {
                error: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}', // error format
            },
        ],
        dateformat: 'HH:MM:ss.L',
        preprocess: function(data) {
            data.title = data.title.toUpperCase();
        },
    });

module.exports={methods}