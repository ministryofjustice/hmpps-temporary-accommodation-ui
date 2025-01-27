import { path } from 'static-path'

const premisesPath = path('/premises')
const premisesSummaryPath = path('/premises/summary')
const singlePremisesPath = premisesPath.path(':premisesId')

const lostBedsPath = singlePremisesPath.path('lost-beds')
const singleLostBedPath = lostBedsPath.path(':lostBedId')
const cancelLostBedPath = singleLostBedPath.path('cancellations')
const roomsPath = singlePremisesPath.path('rooms')
const singleRoomPath = singlePremisesPath.path('rooms').path(':roomId')

const bedsPath = path('/beds')
const searchBedsPath = bedsPath.path('search')

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
  beds: {
    search: searchBedsPath,
  },
  bookings: {
    search: searchBookingsPath,
  },
}

const applicationsPath = path('/applications')
const singleApplicationPath = applicationsPath.path(':id')

const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')
const oasysPath = personPath.path('oasys')

const cas3Path = path('/cas3')
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
  beds: {
    search: managePaths.beds.search,
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
