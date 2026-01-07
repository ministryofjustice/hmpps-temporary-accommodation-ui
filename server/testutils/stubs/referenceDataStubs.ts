import cancellationReasonsJson from './cancellation-reasons.json'
import premisesCharacteristicsJson from './premisesCharacteristics.json'
import bedspaceCharacteristicsJson from './bedspaceCharacteristics.json'
import departureReasonsJson from './departure-reasons.json'
import destinationProvidersJson from './destination-providers.json'
import keyWorkersJson from './keyworkers.json'
import localAuthoritiesJson from './local-authorities.json'
import lostBedReasonsJson from './lost-bed-reasons.json'
import moveOnCategoriesJson from './move-on-categories.json'
import pdusJson from './pdus.json'
import probationRegionsJson from './probation-regions.json'
import rejectionReasonsJson from './referral-rejection-reasons.json'
import paths from '../../paths/api'

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

const premisesCharacteristics = {
  request: {
    method: 'GET',
    url: paths.cas3.referenceData,
    queryParameters: {
      type: { equalTo: 'PREMISES_CHARACTERISTICS' },
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: premisesCharacteristicsJson,
  },
}

const bedspaceCharacteristics = {
  request: {
    method: 'GET',
    url: paths.cas3.referenceData,
    queryParameters: {
      type: { equalTo: 'BEDSPACE_CHARACTERISTICS' },
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: bedspaceCharacteristicsJson,
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
  premisesCharacteristics,
  bedspaceCharacteristics,
  localAuthorities,
  probationRegions,
  pdus,
  referralRejectionReasons,
}
