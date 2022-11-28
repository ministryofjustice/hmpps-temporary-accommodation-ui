import { temporaryAccommodationPath } from '../service'

const premisesPath = temporaryAccommodationPath.path('properties')
const singlePremisesPath = premisesPath.path(':premisesId')

const bedspacesPath = singlePremisesPath.path('bedspaces')
const singleBedspacePath = bedspacesPath.path(':roomId')

const bookingsPath = singleBedspacePath.path('bookings')
const singleBookingPath = bookingsPath.path(':bookingId')

const confirmationsPath = singleBookingPath.path('confirmations')
const arrivalsPath = singleBookingPath.path('activations')

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
    confirmations: {
      new: confirmationsPath.path('new'),
      create: confirmationsPath,
    },
    arrivals: {
      new: arrivalsPath.path('new'),
      create: arrivalsPath,
    },
  },
}

export default paths
