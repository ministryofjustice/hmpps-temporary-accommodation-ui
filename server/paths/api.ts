import { path } from 'static-path'

const cas3Path = path('/cas3')
const premisesPath = path('/premises')
const cas3PremisesPath = cas3Path.path('premises')
const premisesSummaryPath = cas3PremisesPath.path('summary')
const singlePremisesPath = premisesPath.path(':premisesId')
const singlePremisesCas3Path = cas3PremisesPath.path(':premisesId')
const premisesSearchPath = cas3PremisesPath.path('search')

const lostBedsPath = singlePremisesPath.path('lost-beds')
const singleLostBedPath = lostBedsPath.path(':lostBedId')
const cancelLostBedPath = singleLostBedPath.path('cancellations')
const roomsPath = singlePremisesPath.path('rooms')
const singleRoomPath = singlePremisesPath.path('rooms').path(':roomId')

const bedspacesCas3Path = singlePremisesCas3Path.path('bedspaces')
const singleBedspacePath = bedspacesCas3Path.path(':bedspaceId')

const bedspacesPath = cas3Path.path('/bedspaces')
const searchBedspacesPath = bedspacesPath.path('search')

const bookingsPath = path('/bookings')
const searchBookingsPath = bookingsPath.path('search')

const assessPaths = {
  assessments: path('/assessments'),
  singleAssessment: path('/assessments/:id'),
  allocation: path('/tasks/assessment/:id/allocations'),
  rejection: path('/assessments/:id/rejection'),
  acceptance: path('/assessments/:id/acceptance'),
  closure: path('/assessments/:id/closure'),
  notes: path('/assessments/:id/referral-history-notes'),
}

const clarificationNotePaths = {
  notes: assessPaths.singleAssessment.path('notes'),
}

const managePaths = {
  premises: {
    create: premisesPath,
    update: singlePremisesPath,
    index: premisesSummaryPath,
    show: singlePremisesPath,
    rooms: {
      index: roomsPath,
      show: singleRoomPath,
      create: roomsPath,
      update: singleRoomPath,
    },
    lostBeds: {
      show: singleLostBedPath,
      create: lostBedsPath,
      index: lostBedsPath,
      cancel: cancelLostBedPath,
      update: singleLostBedPath,
    },
  },
  bedspaces: {
    search: searchBedspacesPath,
  },
  bookings: {
    search: searchBookingsPath,
  },
}

const managePathsCas3 = {
  premises: {
    search: premisesSearchPath,
    show: singlePremisesCas3Path,
    create: cas3PremisesPath,
    update: singlePremisesCas3Path,
    bedspaces: {
      show: singleBedspacePath,
      create: bedspacesCas3Path,
      get: bedspacesCas3Path,
      update: singleBedspacePath,
    },
  },
}

const applicationsPath = path('/applications')
const singleApplicationPath = applicationsPath.path(':id')

const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')
const oasysPath = personPath.path('oasys')

const reportsCas3Path = cas3Path.path('reports')
const timelineCas3Path = cas3Path.path('timeline').path(':assessmentId')
const deleteApplicationCas3Path = cas3Path.path('/applications/:id')

const applyPaths = {
  applications: {
    show: singleApplicationPath,
    create: applicationsPath,
    index: applicationsPath,
    delete: singleApplicationPath.path('delete'),
    update: singleApplicationPath,
    submission: singleApplicationPath.path('submission'),
  },
}

export default {
  cas3: {
    premises: {
      search: managePathsCas3.premises.search,
      show: managePathsCas3.premises.show,
      create: managePathsCas3.premises.create,
      update: managePathsCas3.premises.update,
      bedspaces: {
        show: managePathsCas3.premises.bedspaces.show,
        create: managePathsCas3.premises.bedspaces.create,
        get: managePathsCas3.premises.bedspaces.get,
        update: managePathsCas3.premises.bedspaces.update,
      },
    },
  },
  premises: {
    show: managePaths.premises.show,
    create: managePaths.premises.create,
    update: managePaths.premises.update,
    index: managePaths.premises.index,
    capacity: managePaths.premises.show.path('capacity'),
    lostBeds: {
      show: managePaths.premises.lostBeds.show,
      create: managePaths.premises.lostBeds.create,
      index: managePaths.premises.lostBeds.index,
      cancel: managePaths.premises.lostBeds.cancel,
      update: managePaths.premises.lostBeds.update,
    },
    rooms: {
      index: managePaths.premises.rooms.index,
      show: managePaths.premises.rooms.show,
      create: managePaths.premises.rooms.create,
      update: managePaths.premises.rooms.update,
    },
    staffMembers: {
      index: managePaths.premises.show.path('staff'),
    },
  },
  bedspaces: {
    search: managePaths.bedspaces.search,
  },
  bookings: {
    search: managePaths.bookings.search,
  },
  applications: {
    show: applyPaths.applications.show,
    index: applyPaths.applications.index,
    update: applyPaths.applications.update,
    delete: deleteApplicationCas3Path,
    new: applyPaths.applications.create,
    submission: applyPaths.applications.submission,
    documents: applyPaths.applications.show.path('documents'),
  },
  assessments: {
    index: assessPaths.assessments,
    show: assessPaths.singleAssessment,
    update: assessPaths.singleAssessment,
    allocation: assessPaths.allocation,
    rejection: assessPaths.rejection,
    acceptance: assessPaths.acceptance,
    closure: assessPaths.closure,
    notes: assessPaths.notes,
    clarificationNotes: {
      create: clarificationNotePaths.notes,
      update: clarificationNotePaths.notes.path(':clarificationNoteId'),
    },
    timeline: timelineCas3Path,
  },
  people: {
    risks: {
      show: personPath.path('risks'),
    },
    search: peoplePath.path('search'),
    prisonCaseNotes: personPath.path('prison-case-notes'),
    adjudications: personPath.path('adjudications'),
    acctAlerts: personPath.path('acct-alerts'),
    offences: personPath.path('offences'),
    documents: path('/documents/:crn/:documentId'),
    oasys: {
      selection: oasysPath.path('selection'),
      sections: oasysPath.path('sections'),
    },
  },
  reports: {
    bookings: reportsCas3Path.path('booking'),
    bedspaceUsage: reportsCas3Path.path('bedUsage'),
    bedspaceUtilisation: reportsCas3Path.path('bedOccupancy'),
    bookingGap: reportsCas3Path.path('bookingGap'),
    futureBookings: reportsCas3Path.path('futureBookings'),
    futureBookingsCsv: reportsCas3Path.path('futureBookingsCsv'),
    referrals: reportsCas3Path.path('referral'),
  },
  users: {
    actingUser: {
      profile: path('/profile/v2'),
    },
  },
}
