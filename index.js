const express = require('express');
const fs = require('node:fs');
const morgan = require('morgan');
const winston = require('./logger');

const app = express();             
const port = 5000;

app.use(morgan('combined', { stream: winston.stream }));

async function readLines(input, func, res) {
    var remaining = '';
  
    input.on('data', function(data) {
      remaining += data;
      var index = remaining.indexOf('\n');
      var last  = 0;
      while (index > -1) {
        var line = remaining.substring(last, index);
        last = index + 1;
        func('\n<p>' + line + '</p>');
        index = remaining.indexOf('\n', last);
      }
  
      remaining = remaining.substring(last);
      return false;
    });
  
    input.on('end', function() {
      if (remaining.length > 0) {
        func('\n<p>' + remaining + '</p>');
        res.sendFile('index.html', {root: __dirname});
      }
    });
  };

  function writeLines(data) {
    fs.appendFileSync('index.html', data, (err) => {
        if (err) {
          return
        }
    });
  }

app.get('/text', async (req, res) => {
    const input = fs.createReadStream('file.txt');
    await readLines(input, writeLines, res);
});

app.get('/', (req, res) => { 
    res.sendFile('index.html', {root: __dirname});
});

app.listen(port, () => {
    console.log(`Server works on port ${port}`); 
});