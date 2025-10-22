import { path } from 'static-path'

// CAS3 namespaced
const cas3Path = path('/cas3')
const cas3PremisesPath = cas3Path.path('premises')
const singlePremisesCas3Path = cas3PremisesPath.path(':premisesId')
const singleBookingCas3Path = singlePremisesCas3Path.path('bookings/:bookingId')

const bedspacesCas3Path = singlePremisesCas3Path.path('bedspaces')
const singleBedspacePath = bedspacesCas3Path.path(':bedspaceId')

const reportsCas3Path = cas3Path.path('reports')

const timelineCas3Path = cas3Path.path('timeline').path(':assessmentId')

const applicationsCas3Path = cas3Path.path('applications')
const singleApplicationCas3Path = applicationsCas3Path.path(':id')

const assessmentsCas3Path = cas3Path.path('assessments')
const singleAssessmentCas3Path = assessmentsCas3Path.path(':id')

// Non-namespaced
const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const bookingsPath = singlePremisesPath.path('bookings')
const singleBookingPath = bookingsPath.path(':bookingId')

const lostBedsPath = singlePremisesPath.path('lost-beds')
const singleLostBedPath = lostBedsPath.path(':lostBedId')

const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')
const oasysPath = personPath.path('oasys')

const tasksPath = path('/tasks')
const allocationPath = tasksPath.path('assessment/:id/allocations')

const assessmentsPath = path('/assessments')
const singleAssessmentPath = assessmentsPath.path(':id')

const clarificationNotesPath = singleAssessmentPath.path('notes')

const managePathsCas3 = {
  premises: {
    search: cas3PremisesPath.path('search'),
    show: singlePremisesCas3Path,
    create: cas3PremisesPath,
    update: singlePremisesCas3Path,
    canArchive: singlePremisesCas3Path.path('can-archive'),
    archive: singlePremisesCas3Path.path('archive'),
    unarchive: singlePremisesCas3Path.path('unarchive'),
    cancelArchive: singlePremisesCas3Path.path('cancel-archive'),
    cancelUnarchive: singlePremisesCas3Path.path('cancel-unarchive'),
    totals: singlePremisesCas3Path.path('bedspace-totals'),
    bedspaces: {
      show: singleBedspacePath,
      create: bedspacesCas3Path,
      get: bedspacesCas3Path,
      update: singleBedspacePath,
      canArchive: singleBedspacePath.path('can-archive'),
      archive: singleBedspacePath.path('archive'),
      unarchive: singleBedspacePath.path('unarchive'),
      cancelArchive: singleBedspacePath.path('cancel-archive'),
      cancelUnarchive: singleBedspacePath.path('cancel-unarchive'),
    },
    bookings: {
      arrivals: singleBookingCas3Path.path('arrivals'),
      departures: singleBookingCas3Path.path('departures'),
    },
  },
  applications: {
    index: applicationsCas3Path,
    show: singleApplicationCas3Path,
  },
  assessments: {
    index: assessmentsCas3Path,
    show: assessmentsCas3Path.path(':id'),
    update: assessmentsCas3Path.path(':id'),
    notes: singleAssessmentCas3Path.path('referral-history-notes'),
  },
}

export default {
  cas3: managePathsCas3,
  premises: {
    lostBeds: {
      show: singleLostBedPath,
      create: lostBedsPath,
      index: lostBedsPath,
      cancel: singleLostBedPath.path('cancellations'),
      update: singleLostBedPath,
    },
    bookings: {
      index: bookingsPath,
      create: bookingsPath,
      show: singleBookingPath,
      extensions: singleBookingPath.path('extensions'),
      confirmations: singleBookingPath.path('confirmations'),
      cancellations: {
        create: singleBookingPath.path('cancellations'),
        show: singleBookingPath.path('cancellations/:cancellationId'),
      },
      departures: {
        show: singleBookingPath.path('departures/:departureId'),
      },
      turnarounds: {
        create: singleBookingPath.path('turnarounds'),
      },
    },
  },
  bedspaces: {
    search: cas3Path.path('bedspaces/search'),
  },
  bookings: {
    search: path('/bookings/search'),
  },
  applications: {
    show: singleApplicationCas3Path,
    index: applicationsCas3Path,
    update: singleApplicationCas3Path,
    delete: singleApplicationCas3Path,
    new: applicationsCas3Path,
    submission: singleApplicationCas3Path.path('submission'),
  },
  assessments: {
    index: assessmentsPath,
    show: singleAssessmentPath,
    allocation: allocationPath,
    rejection: singleAssessmentPath.path('rejection'),
    acceptance: singleAssessmentPath.path('acceptance'),
    closure: singleAssessmentPath.path('closure'),
    clarificationNotes: {
      create: clarificationNotesPath,
      update: clarificationNotesPath.path(':clarificationNoteId'),
    },
    timeline: timelineCas3Path,
  },
  people: {
    search: peoplePath.path('search'),
    prisonCaseNotes: personPath.path('prison-case-notes'),
    adjudications: personPath.path('adjudications'),
    acctAlerts: personPath.path('acct-alerts'),
    offences: personPath.path('offences'),
    oasys: {
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
