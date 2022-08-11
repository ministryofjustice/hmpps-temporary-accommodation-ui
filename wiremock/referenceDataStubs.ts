import departureReasonsJson from './stubs/departure-reasons.json'
import moveOnCategoriesJson from './stubs/move-on-categories.json'
import destinationProvidersJson from './stubs/destination-providers.json'

const departureReasons = {
  request: {
    method: 'GET',
    url: '/reference-data/departure-reasons',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: departureReasonsJson,
  },
}

const moveOnCategories = {
  request: {
    method: 'GET',
    url: '/reference-data/move-on-categories',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: moveOnCategoriesJson,
  },
}

const destinationProviders = {
  request: {
    method: 'GET',
    url: '/reference-data/destination-providers',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: destinationProvidersJson,
  },
}

export { departureReasons, moveOnCategories, destinationProviders }
