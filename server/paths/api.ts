import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const lostBedsPath = singlePremisesPath.path('lost-beds')
const roomsPath = singlePremisesPath.path('rooms')

const managePaths = {
  premises: {
    create: premisesPath,
    update: singlePremisesPath,
    index: premisesPath,
    show: singlePremisesPath,
    rooms: {
      index: roomsPath,
      create: roomsPath,
    },
    lostBeds: {
      create: lostBedsPath,
    },
  },
}

const applicationsPath = path('/applications')
const singleApplicationPath = applicationsPath.path(':id')

const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')

const applyPaths = {
  applications: {
    show: singleApplicationPath,
    create: applicationsPath,
    index: applicationsPath,
    update: singleApplicationPath,
  },
}

export default {
  premises: {
    show: managePaths.premises.show,
    create: managePaths.premises.create,
    update: managePaths.premises.update,
    index: managePaths.premises.index,
    capacity: managePaths.premises.show.path('capacity'),
    lostBeds: {
      create: managePaths.premises.lostBeds.create,
    },
    rooms: {
      index: managePaths.premises.rooms.index,
      create: managePaths.premises.rooms.create,
    },
    staffMembers: {
      index: managePaths.premises.show.path('staff'),
    },
  },
  applications: {
    show: applyPaths.applications.show,
    index: applyPaths.applications.index,
    update: applyPaths.applications.update,
    new: applyPaths.applications.create,
  },
  people: {
    risks: {
      show: personPath.path('risks'),
    },
    search: peoplePath.path('search'),
  },
}
