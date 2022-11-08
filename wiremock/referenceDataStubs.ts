import departureReasonsJson from './stubs/departure-reasons.json'
import moveOnCategoriesJson from './stubs/move-on-categories.json'
import destinationProvidersJson from './stubs/destination-providers.json'
import cancellationReasonsJson from './stubs/cancellation-reasons.json'
import lostBedReasonsJson from './stubs/lost-bed-reasons.json'
import keyWorkersJson from './stubs/keyworkers.json'
import characteristicsJson from './stubs/characteristics.json'
import localAuthoritiesJson from './stubs/local-authorities.json'

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

const cancellationReasons = {
  request: {
    method: 'GET',
    url: '/reference-data/cancellation-reasons',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: cancellationReasonsJson,
  },
}

const lostBedReasons = {
  request: {
    method: 'GET',
    url: '/reference-data/lost-bed-reasons',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedReasonsJson,
  },
}

const keyWorkers = {
  request: {
    method: 'GET',
    url: '/reference-data/key-workers',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: keyWorkersJson,
  },
}

const characteristics = {
  request: {
    method: 'GET',
    url: '/reference-data/characteristics',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: characteristicsJson,
  },
}

const localAuthorities = {
  request: {
    method: 'GET',
    url: '/reference-data/local-authority-areas',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: localAuthoritiesJson,
  },
}

export {
  departureReasons,
  moveOnCategories,
  destinationProviders,
  cancellationReasons,
  lostBedReasons,
  keyWorkers,
  characteristics,
  localAuthorities,
}
