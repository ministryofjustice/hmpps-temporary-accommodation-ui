import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays, startOfToday } from 'date-fns'

import type { Booking } from 'approved-premises'
import arrivalFactory from './arrival'

const today = startOfToday().toISOString()
const soon = () => faker.date.soon(5, addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1)).toISOString()
const past = () => faker.date.past().toISOString()
const future = () => faker.date.future().toISOString()
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

  departingToday() {
    return this.params({
      arrivalDate: past(),
      expectedDepartureDate: today,
      status: 'arrived',
    })
  }

  departedToday() {
    return this.params({
      arrivalDate: past(),
      expectedDepartureDate: today,
      status: 'departed',
    })
  }

  arrivingSoon() {
    return this.params({
      arrivalDate: soon(),
      expectedDepartureDate: future(),
      status: 'awaiting-arrival',
    })
  }

  cancelledWithFutureArrivalDate() {
    return this.params({
      arrivalDate: soon(),
      expectedDepartureDate: future(),
      status: 'cancelled',
    })
  }

  departingSoon() {
    return this.params({
      expectedDepartureDate: soon(),
      arrivalDate: past(),
      status: 'arrived',
    })
  }
}

export default BookingFactory.define(() => ({
  CRN: faker.datatype.uuid(),
  arrivalDate: faker.date.soon().toISOString(),
  expectedDepartureDate: faker.date.future().toISOString(),
  keyWorker: `${faker.name.firstName()} ${faker.name.lastName()}`,
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
  status: 'awaiting-arrival' as const,
  arrival: arrivalFactory.build(),
}))
