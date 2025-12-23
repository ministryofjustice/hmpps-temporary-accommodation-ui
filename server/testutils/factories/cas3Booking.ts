import { fakerEN_GB as faker } from '@faker-js/faker'
import { addDays, subDays } from 'date-fns'
import { Factory } from 'fishery'

import type { Cas3Booking, Cas3Overstay } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory as personFactory } from './person'
import cas3ArrivalFactory from './cas3Arrival'
import cas3CancellationFactory from './cas3Cancellation'
import cas3ConfirmationFactory from './cas3Confirmation'
import cas3DepartureFactory from './cas3Departure'
import cas3ExtensionFactory from './cas3Extension'
import cas3TurnaroundFactory from './cas3Turnaround'
import cas3BookingPremisesSummaryFactory from './cas3BookingPremisesSummary'
import cas3BedspaceSummaryFactory from './cas3BedspaceSummary'

const soon = () =>
  DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 5, refDate: addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1) }),
  )
const past = (options?: { refDate: Date | string; days: number }) =>
  DateFormats.dateObjToIsoDate(faker.date.recent(options))
const future = (options?: { refDate: Date | string; days: number }) =>
  DateFormats.dateObjToIsoDate(faker.date.soon(options))

class Cas3BookingFactory extends Factory<Cas3Booking> {
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
      confirmation: cas3ConfirmationFactory.build(),
    })
  }

  arrived() {
    const arrivalDate = past()
    const dayAfterArrival = addDays(arrivalDate, 1)

    return this.confirmed().params({
      arrivalDate,
      departureDate: future({ refDate: dayAfterArrival, days: 83 }),
      status: 'arrived',
      arrival: cas3ArrivalFactory.build(),
    })
  }

  departed() {
    const departure = cas3DepartureFactory.build()

    const today = new Date()
    const yesterday = subDays(today, 1)
    const arrivalDate = faker.date.recent({ refDate: yesterday, days: 83 })
    const dayAfterArrival = addDays(arrivalDate, 1)
    const departureDate = faker.date.between({ from: dayAfterArrival, to: today })

    return this.arrived().params({
      arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      departureDate: DateFormats.dateObjToIsoDate(departureDate),
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
    const cancellation = cas3CancellationFactory.build()

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

export default Cas3BookingFactory.define(() => {
  const originalArrivalDate = faker.date.soon()
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.soon({ days: 84, refDate: arrivalDate })
  const turnaroundStartDate = faker.date.soon({ days: 1, refDate: departureDate })
  const effectiveEndDate = faker.date.soon({ days: 5, refDate: departureDate })

  const cancellations = faker.helpers.arrayElements(cas3CancellationFactory.buildList(5))
  const departures = faker.helpers.arrayElements(cas3DepartureFactory.buildList(5))
  const turnarounds = faker.helpers.arrayElements(cas3TurnaroundFactory.buildList(5))

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
    bedspace: cas3BedspaceSummaryFactory.build(),
    arrival: cas3ArrivalFactory.build(),
    departure: departures[0],
    departures,
    confirmation: cas3ConfirmationFactory.build(),
    cancellation: cancellations[0],
    cancellations,
    extensions: faker.helpers.arrayElements(cas3ExtensionFactory.buildList(5)),
    overstays: [] as Array<Cas3Overstay>,
    turnaround: turnarounds[0],
    turnarounds,
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    assessmentId: faker.string.uuid(),
    premises: cas3BookingPremisesSummaryFactory.build(),
  }
})
