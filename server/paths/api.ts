import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const lostBedsPath = singlePremisesPath.path('lost-beds')

const managePaths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
  },
  lostBeds: {
    create: lostBedsPath,
  },
}

const applicationsPath = path('/applications')
const singleApplicationPath = applicationsPath.path(':id')

const applyPaths = {
  applications: {
    show: singleApplicationPath,
    create: applicationsPath,
    index: applicationsPath,
    update: singleApplicationPath,
    personRisks: applicationsPath.path('people').path(':crn').path('risks'),
  },
}

export default {
  premises: {
    show: managePaths.premises.show,
    index: managePaths.premises.index,
    capacity: managePaths.premises.show.path('capacity'),
    lostBeds: {
      create: managePaths.lostBeds.create,
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
    personRisks: applyPaths.applications.personRisks,
  },
}
