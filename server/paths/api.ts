import { path } from 'static-path'

// CAS3 namespaced
const cas3Path = path('/cas3')
const cas3v2Path = cas3Path.path('v2')

const cas3ReportsPath = cas3Path.path('reports')

const cas3TimelinePath = cas3Path.path('timeline').path(':assessmentId')

const cas3ApplicationsPath = cas3Path.path('applications')
const cas3SingleApplicationPath = cas3ApplicationsPath.path(':id')

const cas3PremisesPath = cas3v2Path.path('premises')
const cas3SinglePremisesPath = cas3PremisesPath.path(':premisesId')

const cas3BedspacesPath = cas3SinglePremisesPath.path('bedspaces')
const cas3SingleBedspacePath = cas3BedspacesPath.path(':bedspaceId')

const cas3AllVoidBedspacesPath = cas3BedspacesPath.path('void-bedspaces')
const cas3VoidBedspacesPath = cas3SingleBedspacePath.path('void-bedspaces')
const cas3SingleVoidBedspacePath = cas3VoidBedspacesPath.path(':voidBedspaceId')

const cas3BookingsPath = cas3SinglePremisesPath.path('bookings')
const cas3SingleBookingPath = cas3BookingsPath.path(':bookingId')

const cas3AssessmentsPath = cas3Path.path('assessments')
const cas3SingleAssessmentPath = cas3AssessmentsPath.path(':id')

// Non-namespaced
const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')
const oasysPath = personPath.path('oasys')

const tasksPath = path('/tasks')
const allocationPath = tasksPath.path('assessment/:id/allocations')

const cas3Api = {
  premises: {
    search: cas3PremisesPath.path('search'),
    show: cas3SinglePremisesPath,
    create: cas3PremisesPath,
    update: cas3SinglePremisesPath,
    canArchive: cas3SinglePremisesPath.path('can-archive'),
    archive: cas3SinglePremisesPath.path('archive'),
    unarchive: cas3SinglePremisesPath.path('unarchive'),
    cancelArchive: cas3SinglePremisesPath.path('cancel-archive'),
    cancelUnarchive: cas3SinglePremisesPath.path('cancel-unarchive'),
    totals: cas3SinglePremisesPath.path('bedspace-totals'),
    bedspaces: {
      show: cas3SingleBedspacePath,
      create: cas3BedspacesPath,
      get: cas3BedspacesPath,
      update: cas3SingleBedspacePath,
      canArchive: cas3SingleBedspacePath.path('can-archive'),
      archive: cas3SingleBedspacePath.path('archive'),
      unarchive: cas3SingleBedspacePath.path('unarchive'),
      cancelArchive: cas3SingleBedspacePath.path('cancel-archive'),
      cancelUnarchive: cas3SingleBedspacePath.path('cancel-unarchive'),
    },
    voidBedspaces: {
      index: cas3AllVoidBedspacesPath,
      create: cas3VoidBedspacesPath,
      show: cas3SingleVoidBedspacePath,
      update: cas3SingleVoidBedspacePath,
      cancel: cas3SingleVoidBedspacePath.path('cancellations'),
    },
    bookings: {
      create: cas3BookingsPath,
      show: cas3SingleBookingPath,
      index: cas3BookingsPath,
      arrivals: cas3SingleBookingPath.path('arrivals'),
      departures: {
        create: cas3SingleBookingPath.path('departures'),
        show: cas3SingleBookingPath.path('departures/:departureId'),
      },
      confirmations: cas3SingleBookingPath.path('confirmations'),
      extensions: cas3SingleBookingPath.path('extensions'),
      cancellations: {
        create: cas3SingleBookingPath.path('cancellations'),
        show: cas3SingleBookingPath.path('cancellations/:cancellationId'),
      },
      overstays: cas3SingleBookingPath.path('overstays'),
      turnarounds: cas3SingleBookingPath.path('turnarounds'),
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
    index: cas3AssessmentsPath,
    show: cas3AssessmentsPath.path(':id'),
    update: cas3AssessmentsPath.path(':id'),
    acceptance: cas3AssessmentsPath.path(':id/acceptance'),
    notes: cas3SingleAssessmentPath.path('referral-history-notes'),
    rejection: cas3AssessmentsPath.path(':id/rejection'),
    closure: cas3AssessmentsPath.path(':id/closure'),
    timeline: cas3TimelinePath,
  },
  referenceData: cas3Path.path('reference-data'),
}

export default {
  cas3: cas3Api,
  assessments: {
    allocation: allocationPath,
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
  referenceData: path('/reference-data/:objectType'),
}
