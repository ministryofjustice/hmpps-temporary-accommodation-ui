import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Booking } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import arrivalFactory from './arrival'
import cancellationFactory from './cancellation'
import confirmationFactory from './confirmation'
import departureFactory from './departure'
import extensionFactory from './extension'
import { fullPersonFactory as personFactory } from './person'
import turnaroundFactory from './turnaround'
import bookingPremisesSummaryFactory from './bookingPremisesSummary'
import bedFactory from './bed'

export default Factory.define<Booking>(() => {
  const originalArrivalDate = faker.date.soon()
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.soon({ days: 84, refDate: arrivalDate })
  const turnaroundStartDate = faker.date.soon({ days: 1, refDate: departureDate })
  const effectiveEndDate = faker.date.soon({ days: 5, refDate: departureDate })

  const cancellations = faker.helpers.arrayElements(cancellationFactory.buildList(5))
  const departures = faker.helpers.arrayElements(departureFactory.buildList(5))
  const turnarounds = faker.helpers.arrayElements(turnaroundFactory.buildList(5))

  return {
    person: personFactory.build(),
    originalArrivalDate: DateFormats.dateObjToIsoDate(originalArrivalDate),
    originalDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future({ years: 1, refDate: originalArrivalDate })),
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
    turnaroundStartDate: DateFormats.dateObjToIsoDate(turnaroundStartDate),
    effectiveEndDate: DateFormats.dateObjToIsoDate(effectiveEndDate),
    id: faker.string.uuid(),
    status: faker.helpers.arrayElement([
      'provisional',
      'confirmed',
      'arrived',
      'departed',
      'closed',
      'cancelled',
    ] as const),
    bed: bedFactory.build(),
    arrival: arrivalFactory.build(),
    departure: departures[0],
    departures,
    confirmation: confirmationFactory.build(),
    cancellation: cancellations[0],
    cancellations,
    extensions: faker.helpers.arrayElements(extensionFactory.buildList(5)),
    turnaround: turnarounds[0],
    turnarounds,
    serviceName: 'temporary-accommodation' as const,
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    assessmentId: faker.string.uuid(),
    premises: bookingPremisesSummaryFactory.build(),
  }
})
