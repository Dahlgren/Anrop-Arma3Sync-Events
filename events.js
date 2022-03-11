require('dotenv').config()

const arma3syncLib = require('arma3sync-lib')
const axios = require('axios')

const operationsUrl = 'http://anrop.se/api/operations'
const templatesUrl = 'https://playwithsix.anrop.se/templates'

function getJSON (url) {
  return axios.get(url).then(res => res.data)
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
  return arma3syncLib.a3sDirectory.setEvents({ list: events })
}

Promise.all([
  getJSON(operationsUrl),
  getJSON(templatesUrl)
]).then(([operations, templates]) => {
  const operationEvents = createOperationEvents(operations)
  const templateEvents = createTemplateEvents(templates)
  const events = operationEvents.concat(templateEvents)
  return writeEvents(events)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
