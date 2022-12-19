import { temporaryAccommodationPath } from '../service'

const premisesPath = temporaryAccommodationPath.path('properties')
const singlePremisesPath = premisesPath.path(':premisesId')

const bedspacesPath = singlePremisesPath.path('bedspaces')
const singleBedspacePath = bedspacesPath.path(':roomId')

const bookingsPath = singleBedspacePath.path('bookings')
const singleBookingPath = bookingsPath.path(':bookingId')

const confirmationsPath = singleBookingPath.path('confirm')
const arrivalsPath = singleBookingPath.path('mark-as-active')
const departuresPath = singleBookingPath.path('mark-as-closed')
const extensionsPath = singleBookingPath.path('extend')
const cancellationsPath = singleBookingPath.path('cancellations')

const paths = {
  premises: {
    index: premisesPath,
    new: premisesPath.path('new'),
    create: premisesPath,
    edit: singlePremisesPath.path('edit'),
    update: singlePremisesPath,
    show: singlePremisesPath,
    bedspaces: {
      new: bedspacesPath.path('new'),
      create: bedspacesPath,
      edit: singleBedspacePath.path('edit'),
      update: singleBedspacePath,
      show: singleBedspacePath,
    },
  },
  bookings: {
    new: bookingsPath.path('new'),
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
    },
    departures: {
      new: departuresPath.path('new'),
      create: departuresPath,
    },
    extensions: {
      new: extensionsPath.path('new'),
      create: extensionsPath,
    },
    cancellations: {
      new: cancellationsPath.path('new'),
      create: cancellationsPath,
    },
  },
}

export default paths
