import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays } from 'date-fns'
import { Factory } from 'fishery'

import type { Booking } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import arrivalFactory from './arrival'
import cancellationFactory from './cancellation'
import confirmationFactory from './confirmation'
import departureFactory from './departure'
import extensionFactory from './extension'
import personFactory from './person'
import turnaroundFactory from './turnaround'

const soon = () =>
  DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 5, refDate: addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1) }),
  )
const past = () => DateFormats.dateObjToIsoDate(faker.date.past())
const future = () => DateFormats.dateObjToIsoDate(faker.date.future())
class BookingFactory extends Factory<Booking> {
  provisional() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'provisional',
      extensions: [],
      confirmation: null,
      arrival: null,
      departure: null,
      departures: [],
      cancellation: null,
      cancellations: [],
    })
  }

  confirmed() {
    return this.provisional().params({
      status: 'confirmed',
      confirmation: confirmationFactory.build(),
    })
  }

  arrived() {
    return this.confirmed().params({
      arrivalDate: past(),
      departureDate: future(),
      status: 'arrived',
      arrival: arrivalFactory.build(),
    })
  }

  departed() {
    const departure = departureFactory.build()

    return this.arrived().params({
      arrivalDate: past(),
      departureDate: past(),
      status: 'departed',
      departure,
      departures: [departure],
    })
  }

  closed() {
    return this.departed().params({
      status: 'closed',
    })
  }

  cancelled(source: 'provisional' | 'confirmed' = 'provisional') {
    const cancellation = cancellationFactory.build()

    if (source === 'provisional') {
      return this.provisional().params({
        status: 'cancelled',
        cancellation,
        cancellations: [cancellation],
      })
    }
    return this.confirmed().params({
      status: 'cancelled',
      cancellation,
      cancellations: [cancellation],
    })
  }
}

export default BookingFactory.define(() => {
  const originalArrivalDate = faker.date.soon()
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.future({ years: 1, refDate: arrivalDate })
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
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    id: faker.string.uuid(),
    status: faker.helpers.arrayElement([
      'provisional',
      'confirmed',
      'arrived',
      'departed',
      'closed',
      'cancelled',
    ] as const),
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
    createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  }
})
