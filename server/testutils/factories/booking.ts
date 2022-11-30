import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays } from 'date-fns'

import type { Booking } from '@approved-premises/api'
import arrivalFactory from './arrival'
import departureFactory from './departure'
import confirmationFactory from './confirmation'
import personFactory from './person'
import { DateFormats } from '../../utils/dateUtils'

const soon = () => DateFormats.formatApiDate(faker.date.soon(5, addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1)))
const past = () => DateFormats.formatApiDate(faker.date.past())
const future = () => DateFormats.formatApiDate(faker.date.future())
class BookingFactory extends Factory<Booking> {
  provisional() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'provisional',
    })
  }

  confirmed() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'confirmed',
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
}

export default BookingFactory.define(() => ({
  person: personFactory.build(),
  arrivalDate: DateFormats.formatApiDate(faker.date.soon()),
  departureDate: DateFormats.formatApiDate(faker.date.future()),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
  status: 'provisional' as const,
  arrival: arrivalFactory.build(),
  departure: departureFactory.build(),
  confirmation: confirmationFactory.build(),
  extensions: [],
  serviceName: 'temporary-accommodation' as const,
}))
