import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const bookingsPath = singlePremisesPath.path('bookings')
const bookingPath = bookingsPath.path(':bookingId')

const extensionsPath = bookingPath.path('extensions')

const arrivalsPath = bookingPath.path('arrivals')

const nonArrivalsPath = bookingPath.path('non-arrivals')

const cancellationsPath = bookingPath.path('cancellations')

const departuresPath = bookingPath.path('departures')

const lostBedsPath = singlePremisesPath.path('lost-beds')

const paths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
  },
  bookings: {
    new: bookingsPath.path('new'),
    show: bookingPath,
    create: bookingsPath,
    confirm: bookingPath.path('confirmation'),
    extensions: {
      new: extensionsPath.path('new'),
      create: extensionsPath,
      confirm: extensionsPath.path('confirmation'),
    },
    arrivals: {
      new: arrivalsPath.path('new'),
      create: arrivalsPath,
    },
    nonArrivals: {
      create: nonArrivalsPath,
    },
    cancellations: {
      new: cancellationsPath.path('new'),
      create: cancellationsPath,
      confirm: cancellationsPath.path(':id/confirmation'),
    },
    departures: {
      new: departuresPath.path('new'),
      create: departuresPath,
      confirm: departuresPath.path(':departureId/confirmation'),
    },
  },
  lostBeds: {
    new: lostBedsPath.path('new'),
    create: lostBedsPath,
  },
}

export default paths
