import { temporaryAccommodationPath } from '../service'

const dashboardPath = temporaryAccommodationPath.path('dashboard')

const premisesV2Path = temporaryAccommodationPath.path('properties')
const premisesV2OnlinePath = premisesV2Path.path('online')
const premisesV2ArchivedPath = premisesV2Path.path('archived')

const singlePremisesV2Path = premisesV2Path.path(':premisesId')

const bedspacesV2Path = singlePremisesV2Path.path('bedspaces')
const singleBedspaceV2Path = bedspacesV2Path.path(':bedspaceId')

const bookingsPath = singleBedspaceV2Path.path('bookings')
const singleBookingPath = bookingsPath.path(':bookingId')
const allBookingsPath = temporaryAccommodationPath.path('bookings')

const confirmationsPath = singleBookingPath.path('confirm')
const arrivalsPath = singleBookingPath.path('mark-as-active')
const departuresPath = singleBookingPath.path('mark-as-departed')
const extensionsPath = singleBookingPath.path('extend')
const cancellationsPath = singleBookingPath.path('cancellations')
const turnaroundsPath = singleBookingPath.path('turnarounds')

const lostBedsPath = singleBedspaceV2Path.path('void')
const singleLostBedPath = lostBedsPath.path(':lostBedId')

const reportsPath = temporaryAccommodationPath.path('reports')

const assessmentsPath = temporaryAccommodationPath.path('review-and-assess')
const assessmentPath = assessmentsPath.path(':id')

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const paths: Record<string, any> = {
  dashboard: {
    index: dashboardPath,
  },
  premises: {
    index: premisesV2Path,
    online: premisesV2OnlinePath,
    archived: premisesV2ArchivedPath,
    toggleSort: premisesV2Path.path('toggle-sort'),
    show: singlePremisesV2Path,
    new: premisesV2Path.path('new'),
    create: premisesV2Path,
    edit: singlePremisesV2Path.path('edit'),
    update: singlePremisesV2Path,
    archive: singlePremisesV2Path.path('archive'),
    bedspaces: {
      new: bedspacesV2Path.path('new'),
      show: singleBedspaceV2Path,
      create: bedspacesV2Path,
      list: bedspacesV2Path,
      edit: singleBedspaceV2Path.path('edit'),
      cancelArchive: singleBedspaceV2Path.path('cancel-archive'),
      update: singleBedspaceV2Path,
    },
  },
  bookings: {
    index: allBookingsPath,
    new: bookingsPath.path('new'),
    selectAssessment: bookingsPath.path('select-assessment'),
    confirm: bookingsPath.path('confirm'),
    create: bookingsPath,
    show: singleBookingPath,
    history: singleBookingPath.path('history'),
    confirmations: {
      new: confirmationsPath.path('new'),
      create: confirmationsPath,
    },
    arrivals: {
      new: arrivalsPath.path('new'),
      create: arrivalsPath,
      edit: arrivalsPath.path('edit'),
      update: arrivalsPath,
    },
    departures: {
      new: departuresPath.path('new'),
      create: departuresPath,
      edit: departuresPath.path('edit'),
      update: departuresPath,
    },
    extensions: {
      new: extensionsPath.path('new'),
      create: extensionsPath,
    },
    cancellations: {
      new: cancellationsPath.path('new'),
      create: cancellationsPath,
      edit: cancellationsPath.path('edit'),
      update: cancellationsPath,
    },
    turnarounds: {
      new: turnaroundsPath.path('edit'),
      create: turnaroundsPath,
    },
    search: {
      provisional: {
        index: allBookingsPath.path('provisional'),
      },
      active: {
        index: allBookingsPath.path('active'),
      },
      departed: {
        index: allBookingsPath.path('departed'),
      },
      confirmed: {
        index: allBookingsPath.path('confirmed'),
      },
    },
  },
  lostBeds: {
    new: lostBedsPath.path('new'),
    create: lostBedsPath,
    show: singleLostBedPath,
    edit: singleLostBedPath.path('edit'),
    update: singleLostBedPath,
    cancellations: { new: singleLostBedPath.path('cancel'), create: singleLostBedPath.path('cancellations') },
  },
  reports: {
    index: reportsPath,
    new: reportsPath.path('bookings'),
    create: reportsPath.path('bookings'),
  },
  bedspaces: {
    search: temporaryAccommodationPath.path('/find-a-bedspace'),
  },
  assessments: {
    index: assessmentsPath,
    unallocated: assessmentsPath.path('unallocated'),
    inReview: assessmentsPath.path('in-review'),
    readyToPlace: assessmentsPath.path('ready-to-place'),
    archive: assessmentsPath.path('archive'),
    full: assessmentsPath.path(':id'),
    summary: assessmentPath.path(':id/summary'),
    confirmRejection: assessmentPath.path('rejected'),
    reject: assessmentPath.path('rejected'),
    confirm: assessmentPath.path(':status'),
    update: assessmentPath.path(':status'),
    notes: { create: assessmentPath.path('/notes') },
    changeDate: {
      releaseDate: assessmentPath.path('change-release-date'),
      accommodationRequiredFromDate: assessmentPath.path('change-accommodation-required-from-date'),
    },
    updateDate: {
      releaseDate: assessmentPath.path('update-release-date'),
      accommodationRequiredFromDate: assessmentPath.path('update-accommodation-required-from-date'),
    },
  },
}

export default paths
