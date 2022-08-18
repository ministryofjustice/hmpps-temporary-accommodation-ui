import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays, startOfToday } from 'date-fns'

import type { Booking } from 'approved-premises'
import arrivalFactory from './arrival'
import departureFactory from './departure'

const today = startOfToday().toISOString()
const soon = () => faker.date.soon(5, addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1)).toISOString()
const past = () => faker.date.past().toISOString()
const future = () => faker.date.future().toISOString()
class BookingFactory extends Factory<Booking> {
  arrivingToday() {
    return this.params({
      expectedArrivalDate: today,
      status: 'awaiting-arrival',
    })
  }

  arrivedToday() {
    return this.params({
      expectedArrivalDate: today,
      status: 'arrived',
    })
  }

  arrived() {
    return this.params({
      expectedArrivalDate: past(),
      expectedDepartureDate: future(),
      status: 'arrived',
    })
  }

  notArrived() {
    return this.params({
      expectedArrivalDate: past(),
      expectedDepartureDate: future(),
      status: 'not-arrived',
    })
  }

  departingToday() {
    return this.params({
      expectedArrivalDate: past(),
      expectedDepartureDate: today,
      status: 'arrived',
    })
  }

  departedToday() {
    return this.params({
      expectedArrivalDate: past(),
      expectedDepartureDate: today,
      status: 'departed',
    })
  }

  arrivingSoon() {
    return this.params({
      expectedArrivalDate: soon(),
      expectedDepartureDate: future(),
      status: 'awaiting-arrival',
    })
  }

  cancelledWithFutureArrivalDate() {
    return this.params({
      expectedArrivalDate: soon(),
      expectedDepartureDate: future(),
      status: 'cancelled',
    })
  }

  departingSoon() {
    return this.params({
      expectedDepartureDate: soon(),
      expectedArrivalDate: past(),
      status: 'arrived',
    })
  }
}

export default BookingFactory.define(() => ({
  crn: faker.datatype.uuid(),
  expectedArrivalDate: faker.date.soon().toISOString(),
  expectedDepartureDate: faker.date.future().toISOString(),
  keyWorker: `${faker.name.firstName()} ${faker.name.lastName()}`,
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
  status: 'awaiting-arrival' as const,
  arrival: arrivalFactory.build(),
  departure: departureFactory.build(),
}))
