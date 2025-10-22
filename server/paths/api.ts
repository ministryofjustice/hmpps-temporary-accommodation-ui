import { path } from 'static-path'
import config from '../config'

// CAS3 namespaced
const cas3Path = path('/cas3')

const cas3ReportsPath = cas3Path.path('reports')

const cas3TimelinePath = cas3Path.path('timeline').path(':assessmentId')

const cas3ApplicationsPath = cas3Path.path('applications')
const cas3SingleApplicationPath = cas3ApplicationsPath.path(':id')

// CAS3v2 namespaced
const cas3v2Path = config.flags.enableCas3v2Api ? path('/cas3/v2') : path('/cas3')
const cas3v2PremisesPath = cas3v2Path.path('premises')
const cas3v2SinglePremisesPath = cas3v2PremisesPath.path(':premisesId')

const cas3v2BedspacesPath = cas3v2SinglePremisesPath.path('bedspaces')
const cas3v2SingleBedspacePath = cas3v2BedspacesPath.path(':bedspaceId')

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

const cas3Api = {
  premises: {
    search: cas3v2PremisesPath.path('search'), // y
    show: cas3v2SinglePremisesPath, // y
    create: cas3v2PremisesPath, // y
    update: cas3v2SinglePremisesPath, // y
    canArchive: cas3SinglePremisesPath.path('can-archive'), // N
    archive: cas3v2SinglePremisesPath.path('archive'), // y
    unarchive: cas3v2SinglePremisesPath.path('unarchive'), // y
    cancelArchive: cas3v2SinglePremisesPath.path('cancel-archive'), // y
    cancelUnarchive: cas3SinglePremisesPath.path('cancel-unarchive'), // N
    totals: cas3v2SinglePremisesPath.path('bedspace-totals'), // y
    bedspaces: {
      show: cas3SingleBedspacePath, // N
      create: cas3v2BedspacesPath, // y
      get: cas3v2BedspacesPath, // y
      update: cas3v2SingleBedspacePath, // y
      canArchive: cas3SingleBedspacePath.path('can-archive'), // N
      archive: cas3v2SingleBedspacePath.path('archive'), // y
      unarchive: cas3v2SingleBedspacePath.path('unarchive'), // y
      cancelArchive: cas3v2SingleBedspacePath.path('cancel-archive'), // y
      cancelUnarchive: cas3v2SingleBedspacePath.path('cancel-unarchive'), // y
    },
    bookings: {
      arrivals: cas3SingleBookingPath.path('arrivals'),
      departures: cas3SingleBookingPath.path('departures'),
    },
  },
  bedspaces: {
    search: cas3Path.path('bedspaces/search'),
  },
  applications: {
    new: cas3ApplicationsPath,
    show: cas3SingleApplicationPath,
    index: cas3ApplicationsPath,
    update: cas3SingleApplicationPath,
    delete: cas3SingleApplicationPath,
    submission: cas3SingleApplicationPath.path('submission'),
  },
  reports: {
    bookings: cas3ReportsPath.path('booking'),
    bedspaceUsage: cas3ReportsPath.path('bedUsage'),
    bedspaceUtilisation: cas3ReportsPath.path('bedOccupancy'),
    bookingGap: cas3ReportsPath.path('bookingGap'),
    futureBookings: cas3ReportsPath.path('futureBookings'),
    futureBookingsCsv: cas3ReportsPath.path('futureBookingsCsv'),
    referrals: cas3ReportsPath.path('referral'),
  },
  assessments: {
    index: assessmentsCas3Path,
    show: assessmentsCas3Path.path(':id'),
    update: assessmentsCas3Path.path(':id'),
    notes: singleAssessmentCas3Path.path('referral-history-notes'),
  },
}

export default {
  cas3: cas3Api,
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
  bookings: {
    search: path('/bookings/search'),
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
    timeline: cas3TimelinePath,
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
  users: {
    actingUser: {
      profile: path('/profile/v2'),
    },
  },
}
