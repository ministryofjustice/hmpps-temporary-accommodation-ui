import { path } from 'static-path'

const cas3Path = path('/cas3')
const assessmentsCas3Path = cas3Path.path('assessments')
const premisesPath = path('/premises')
const cas3PremisesPath = cas3Path.path('premises')
const singlePremisesPath = premisesPath.path(':premisesId')
const singlePremisesCas3Path = cas3PremisesPath.path(':premisesId')
const singleBookingCas3Path = singlePremisesCas3Path.path('bookings/:bookingId')
const premisesSearchPath = cas3PremisesPath.path('search')
const premisesCanArchivePath = singlePremisesCas3Path.path('can-archive')
const premisesArchivePath = singlePremisesCas3Path.path('archive')
const premisesUnarchivePath = singlePremisesCas3Path.path('unarchive')
const premisesCancelArchivePath = singlePremisesCas3Path.path('cancel-archive')
const premisesCancelUnarchivePath = singlePremisesCas3Path.path('cancel-unarchive')

const lostBedsPath = singlePremisesPath.path('lost-beds')
const singleLostBedPath = lostBedsPath.path(':lostBedId')
const cancelLostBedPath = singleLostBedPath.path('cancellations')

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
}

const clarificationNotePaths = {
  notes: assessPaths.singleAssessment.path('notes'),
}

const managePaths = {
  premises: {
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
    canArchive: premisesCanArchivePath,
    archive: premisesArchivePath,
    unarchive: premisesUnarchivePath,
    cancelArchive: premisesCancelArchivePath,
    cancelUnarchive: premisesCancelUnarchivePath,
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
      arrival: singleBookingCas3Path.path('arrivals'),
      departure: singleBookingCas3Path.path('departures'),
    },
  },
}

const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')
const oasysPath = personPath.path('oasys')

const reportsCas3Path = cas3Path.path('reports')
const timelineCas3Path = cas3Path.path('timeline').path(':assessmentId')
const applicationsCas3Path = cas3Path.path('applications')
const deleteApplicationCas3Path = cas3Path.path('/applications/:id')
const submitApplicationCas3Path = cas3Path.path('/applications/:id/submission')
const singleApplicationCas3Path = applicationsCas3Path.path(':id')

export default {
  cas3: {
    premises: {
      search: managePathsCas3.premises.search,
      show: managePathsCas3.premises.show,
      create: managePathsCas3.premises.create,
      update: managePathsCas3.premises.update,
      canArchive: managePathsCas3.premises.canArchive,
      archive: managePathsCas3.premises.archive,
      unarchive: managePathsCas3.premises.unarchive,
      cancelArchive: managePathsCas3.premises.cancelArchive,
      cancelUnarchive: managePathsCas3.premises.cancelUnarchive,
      totals: managePathsCas3.premises.totals,
      bedspaces: {
        show: managePathsCas3.premises.bedspaces.show,
        create: managePathsCas3.premises.bedspaces.create,
        get: managePathsCas3.premises.bedspaces.get,
        update: managePathsCas3.premises.bedspaces.update,
        canArchive: managePathsCas3.premises.bedspaces.canArchive,
        archive: managePathsCas3.premises.bedspaces.archive,
        unarchive: managePathsCas3.premises.bedspaces.unarchive,
        cancelArchive: managePathsCas3.premises.bedspaces.cancelArchive,
        cancelUnarchive: managePathsCas3.premises.bedspaces.cancelUnarchive,
      },
      bookings: {
        arrival: managePathsCas3.premises.bookings.arrival,
        departure: managePathsCas3.premises.bookings.departure,
      },
    },
    applications: {
      index: applicationsCas3Path,
      show: singleApplicationCas3Path,
    },
    assessments: {
      index: assessmentsCas3Path,
      notes: assessmentsCas3Path.path(':id/referral-history-notes'),
    },
  },
  premises: {
    lostBeds: {
      show: managePaths.premises.lostBeds.show,
      create: managePaths.premises.lostBeds.create,
      index: managePaths.premises.lostBeds.index,
      cancel: managePaths.premises.lostBeds.cancel,
      update: managePaths.premises.lostBeds.update,
    },
  },
  bedspaces: {
    search: managePaths.bedspaces.search,
  },
  bookings: {
    search: managePaths.bookings.search,
  },
  applications: {
    show: singleApplicationCas3Path,
    index: applicationsCas3Path,
    update: singleApplicationCas3Path,
    delete: deleteApplicationCas3Path,
    new: applicationsCas3Path,
    submission: submitApplicationCas3Path,
  },
  assessments: {
    index: assessPaths.assessments,
    show: assessPaths.singleAssessment,
    update: assessPaths.singleAssessment,
    allocation: assessPaths.allocation,
    rejection: assessPaths.rejection,
    acceptance: assessPaths.acceptance,
    closure: assessPaths.closure,
    clarificationNotes: {
      create: clarificationNotePaths.notes,
      update: clarificationNotePaths.notes.path(':clarificationNoteId'),
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
