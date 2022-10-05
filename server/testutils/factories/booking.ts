import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays, startOfToday } from 'date-fns'

import type { Booking } from 'approved-premises'
import arrivalFactory from './arrival'
import departureFactory from './departure'
import personFactory from './person'
import { DateFormats } from '../../utils/dateUtils'

const today = DateFormats.formatApiDate(startOfToday())
const soon = () => DateFormats.formatApiDate(faker.date.soon(5, addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1)))
const past = () => DateFormats.formatApiDate(faker.date.past())
const future = () => DateFormats.formatApiDate(faker.date.future())
class BookingFactory extends Factory<Booking> {
  arrivingToday() {
    return this.params({
      arrivalDate: today,
      status: 'awaiting-arrival',
    })
  }

  arrivedToday() {
    return this.params({
      arrivalDate: today,
      status: 'arrived',
    })
  }

  arrived() {
    return this.params({
      arrivalDate: past(),
      departureDate: future(),
      status: 'arrived',
    })
  }

  notArrived() {
    return this.params({
      arrivalDate: past(),
      departureDate: future(),
      status: 'not-arrived',
    })
  }

  departingToday() {
    return this.params({
      arrivalDate: past(),
      departureDate: today,
      status: 'arrived',
    })
  }

  departedToday() {
    return this.params({
      arrivalDate: past(),
      departureDate: today,
      status: 'departed',
    })
  }

  arrivingSoon() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'awaiting-arrival',
    })
  }

  cancelledWithFutureArrivalDate() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'cancelled',
    })
  }

  departingSoon() {
    return this.params({
      departureDate: soon(),
      arrivalDate: past(),
      status: 'arrived',
    })
  }
}

export default BookingFactory.define(() => ({
  person: personFactory.build(),
  arrivalDate: DateFormats.formatApiDate(faker.date.soon()),
  departureDate: DateFormats.formatApiDate(faker.date.future()),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
  status: 'awaiting-arrival' as const,
  arrival: arrivalFactory.build(),
  departure: departureFactory.build(),
}))
