import { path } from 'static-path'
import config from '../config'

// CAS3 namespaced
const cas3Path = path('/cas3')
const cas3PremisesPath = cas3Path.path('premises')
const cas3SinglePremisesPath = cas3PremisesPath.path(':premisesId')
const cas3SingleBookingPath = cas3SinglePremisesPath.path('bookings/:bookingId')

const cas3BedspacesPath = cas3SinglePremisesPath.path('bedspaces')
const cas3SingleBedspacePath = cas3BedspacesPath.path(':bedspaceId')

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

const cas3v2AllVoidBedspacesPath = cas3v2BedspacesPath.path('void-bedspaces')
const cas3v2VoidBedspacesPath = cas3v2SingleBedspacePath.path('void-bedspaces')
const cas3v2SingleVoidBedspacePath = cas3v2VoidBedspacesPath.path(':voidBedspaceId')

const cas3v2BookingsPath = cas3v2SinglePremisesPath.path('bookings')
const cas3v2SingleBookingPath = cas3v2BookingsPath.path(':bookingId')

const assessmentsCas3Path = cas3Path.path('assessments')

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

const cas3Api = {
  premises: {
    search: cas3v2PremisesPath.path('search'),
    show: cas3v2SinglePremisesPath,
    create: cas3v2PremisesPath,
    update: cas3v2SinglePremisesPath,
    canArchive: cas3SinglePremisesPath.path('can-archive'), // Not yet available as /cas3/v2
    archive: cas3v2SinglePremisesPath.path('archive'),
    unarchive: cas3v2SinglePremisesPath.path('unarchive'),
    cancelArchive: cas3v2SinglePremisesPath.path('cancel-archive'),
    cancelUnarchive: cas3SinglePremisesPath.path('cancel-unarchive'), // Not yet available as /cas3/v2
    totals: cas3v2SinglePremisesPath.path('bedspace-totals'),
    bedspaces: {
      show: cas3v2SingleBedspacePath,
      create: cas3v2BedspacesPath,
      get: cas3v2BedspacesPath,
      update: cas3v2SingleBedspacePath,
      canArchive: cas3SingleBedspacePath.path('can-archive'), // Not yet available as /cas3/v2
      archive: cas3v2SingleBedspacePath.path('archive'),
      unarchive: cas3v2SingleBedspacePath.path('unarchive'),
      cancelArchive: cas3v2SingleBedspacePath.path('cancel-archive'),
      cancelUnarchive: cas3v2SingleBedspacePath.path('cancel-unarchive'),
    },
    voidBedspaces: {
      index: cas3v2AllVoidBedspacesPath,
      create: cas3v2VoidBedspacesPath,
      show: cas3v2SingleVoidBedspacePath,
      update: cas3v2SingleVoidBedspacePath,
      cancel: cas3v2SingleVoidBedspacePath.path('cancellations'),
    },
    bookings: {
      create: cas3v2BookingsPath,
      show: cas3v2SingleBookingPath,
      index: cas3v2BookingsPath,
      arrivals: cas3v2SingleBookingPath.path('arrivals'),
      departures: {
        create: cas3v2SingleBookingPath.path('departures'),
        show: cas3v2SingleBookingPath.path('departures/:departureId'),
      },
      confirmations: cas3SingleBookingPath.path('confirmations'),
      extensions: cas3v2SingleBookingPath.path('extensions'),
      cancellations: {
        create: cas3v2SingleBookingPath.path('cancellations'),
        show: cas3v2SingleBookingPath.path('cancellations/:cancellationId'),
      },
      turnarounds: cas3v2SingleBookingPath.path('turnarounds'),
    },
  },
  bedspaces: {
    search: cas3v2Path.path('bedspaces/search'),
  },
  bookings: {
    search: cas3v2Path.path('bookings/search'),
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
    update: singleAssessmentPath,
    allocation: allocationPath,
    rejection: singleAssessmentPath.path('rejection'),
    acceptance: singleAssessmentPath.path('acceptance'),
    closure: singleAssessmentPath.path('closure'),
    notes: singleAssessmentPath.path('referral-history-notes'),
    timeline: cas3TimelinePath,
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
      sections: oasysPath.path('sections'),
    },
  },
  users: {
    actingUser: {
      profile: path('/profile/v2'),
    },
  },
}
