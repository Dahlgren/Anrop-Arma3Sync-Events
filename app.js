var path = require('path');
var request = require('request');
var spawn = require('child_process').spawn;

var config = require('./config');

function fetchOperations(cb) {
  request.get({url: "http://anrop.se/api/operations", json:true}, function (err, res) {
    cb(err, res.body);
  });
}

function createEvents(operations) {
  return operations.map(function (operation) {
    var addons = {};

    operation.pws.forEach(function (addon) {
      addons[addon.name] = true;
    });

    return {
      name: operation.title,
      description: operation.datetime,
      addonNames: addons,
      userconfigFolderNames: {},
    }
  })
}

function writeEvents(events) {
  var java = [
    '-jar',
    path.resolve(__dirname, 'arma3sync.jar'),
  ];

  var args = [
    'setevents',
    '--repository',
    config.repository,
    '--path',
    config.path,
    '--json',
    '--events-json',
    JSON.stringify(events),
  ];

  var childProcess = spawn(config.java, java.concat(args), {
    cwd: config.arma3sync, env: process.env
  });

  childProcess.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  childProcess.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  childProcess.on('close', function (code) {
    process.exit(code);
  });

  childProcess.on('error', function (code) {
    console.log(code);
  });
}

fetchOperations(function (err, operations) {
  if (err) {
    console.log(err);
  } else {
    writeEvents(createEvents(operations));
  }
});
