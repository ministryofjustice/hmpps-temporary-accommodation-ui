import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays } from 'date-fns'
import { Factory } from 'fishery'

import type { Booking } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import arrivalFactory from './arrival'
import confirmationFactory from './confirmation'
import cancellationFactory from './cancellation'
import departureFactory from './departure'
import personFactory from './person'
import extensionFactory from './extension'

const soon = () =>
  DateFormats.dateObjToIsoDate(faker.date.soon(5, addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1)))
const past = () => DateFormats.dateObjToIsoDate(faker.date.past())
const future = () => DateFormats.dateObjToIsoDate(faker.date.future())
class BookingFactory extends Factory<Booking> {
  provisional() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'provisional',
      extensions: [],
    })
  }

  confirmed() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'confirmed',
      extensions: [],
    })
  }

  arrived() {
    return this.params({
      arrivalDate: past(),
      departureDate: future(),
      status: 'arrived',
    })
  }

  departed() {
    return this.params({
      arrivalDate: past(),
      departureDate: past(),
      status: 'departed',
    })
  }

  cancelled() {
    return this.params({
      arrivalDate: past(),
      departureDate: past(),
      status: 'cancelled',
      extensions: [],
    })
  }
}

export default BookingFactory.define(() => ({
  person: personFactory.build(),
  originalArrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  originalDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  departureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
  status: faker.helpers.arrayElement(['provisional', 'confirmed', 'arrived', 'departed', 'cancelled'] as const),
  arrival: arrivalFactory.build(),
  departure: departureFactory.build(),
  confirmation: confirmationFactory.build(),
  cancellation: cancellationFactory.build(),
  extensions: faker.helpers.arrayElements(extensionFactory.buildList(5)),
  serviceName: 'temporary-accommodation' as const,
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
