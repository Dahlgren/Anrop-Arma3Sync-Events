var path = require('path')
var spawn = require('child_process').spawn

var config = require('./config')

function build () {
  var java = [
    '-jar',
    path.resolve(__dirname, 'arma3sync.jar')
  ]

  var args = [
    'build',
    '--repository',
    config.repository,
    '--path',
    config.path
  ]

  var childProcess = spawn(config.java, java.concat(args), {
    cwd: config.arma3sync, env: process.env
  })

  childProcess.stdout.on('data', function (data) {
    console.log(data.toString())
  })

  childProcess.stderr.on('data', function (data) {
    console.log(data.toString())
  })

  childProcess.on('close', function (code) {
    process.exit(code)
  })

  childProcess.on('error', function (code) {
    console.log(code)
  })
}

build()
