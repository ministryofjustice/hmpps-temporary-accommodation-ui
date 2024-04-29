import cancellationReasonsJson from './stubs/cancellation-reasons.json'
import characteristicsJson from './stubs/characteristics.json'
import departureReasonsJson from './stubs/departure-reasons.json'
import destinationProvidersJson from './stubs/destination-providers.json'
import keyWorkersJson from './stubs/keyworkers.json'
import localAuthoritiesJson from './stubs/local-authorities.json'
import lostBedReasonsJson from './stubs/lost-bed-reasons.json'
import moveOnCategoriesJson from './stubs/move-on-categories.json'
import pdusJson from './stubs/pdus.json'
import probationRegionsJson from './stubs/probation-regions.json'
import rejectionReasonsJson from './stubs/referral-rejection-reasons.json'

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

const probationRegions = {
  request: {
    method: 'GET',
    url: '/reference-data/probation-regions',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: probationRegionsJson,
  },
}

const pdus = {
  request: {
    method: 'GET',
    urlPath: '/reference-data/probation-delivery-units',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: pdusJson,
  },
}

const referralRejectionReasons = {
  request: {
    method: 'GET',
    urlPath: '/reference-data/referral-rejection-reasons',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: rejectionReasonsJson,
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
  probationRegions,
  pdus,
  referralRejectionReasons,
}
