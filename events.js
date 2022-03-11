require('dotenv').config()

const arma3syncLib = require('arma3sync-lib')
const request = require('request')

function fetchOperations (cb) {
  request.get({ url: 'http://anrop.se/api/operations', json: true }, function (err, res) {
    cb(err, res.body)
  })
}

function fetchTemplates (cb) {
  request.get({ url: 'https://playwithsix.anrop.se/templates', json: true }, function (err, res) {
    cb(err, res.body)
  })
}

function createOperationEvents (operations) {
  return operations.filter(function (operation) {
    return operation.pws && operation.pws.length > 0
  }).map(function (operation) {
    const addons = {}

    operation.pws.forEach(function (addon) {
      addons[addon.name] = false
    })

    return {
      name: 'Operation - ' + operation.title,
      description: operation.datetime,
      addonNames: addons,
      userconfigFolderNames: {}
    }
  })
}

function createTemplateEvents (templates) {
  return templates.map(function (template) {
    const addons = {}

    template.mods.forEach(function (mod) {
      addons[mod] = false
    })

    return {
      name: 'Template - ' + template.title,
      description: '',
      addonNames: addons,
      userconfigFolderNames: {}
    }
  })
}

function writeEvents (events) {
  arma3syncLib.a3sDirectory.setEvents({ list: events })
}

fetchOperations(function (err, operations) {
  if (err) {
    console.log(err)
  } else {
    const operationEvents = createOperationEvents(operations)
    fetchTemplates(function (err, templates) {
      if (err) {
        console.log(err)
      } else {
        const templateEvents = createTemplateEvents(templates)
        const events = operationEvents.concat(templateEvents)
        writeEvents(events)
      };
    })
  }
})
