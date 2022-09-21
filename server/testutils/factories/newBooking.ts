import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewBooking } from 'approved-premises'

import keyWorkerFactory from './keyWorker'
import personFactory from './person'

export default Factory.define<NewBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.future()

  return {
    crn: personFactory.build().crn,
    keyWorkerId: keyWorkerFactory.build().id,
    arrivalDate: arrivalDate.toISOString(),
    'arrivalDate-day': arrivalDate.getDate().toString(),
    'arrivalDate-month': arrivalDate.getMonth().toString(),
    'arrivalDate-year': arrivalDate.getFullYear().toString(),
    departureDate: departureDate.toISOString(),
    'departureDate-day': departureDate.getDate().toString(),
    'departureDate-month': departureDate.getMonth().toString(),
    'departureDate-year': departureDate.getFullYear().toString(),
  }
})
