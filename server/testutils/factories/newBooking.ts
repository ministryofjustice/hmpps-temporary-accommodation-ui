import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewBooking } from 'approved-premises'

import keyWorkerFactory from './keyWorker'
import personFactory from './person'
import { DateFormats } from '../../utils/dateFormats'

export default Factory.define<NewBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.future()

  return {
    crn: personFactory.build().crn,
    keyWorkerId: keyWorkerFactory.build().id,
    arrivalDate: DateFormats.formatApiDate(arrivalDate),
    'arrivalDate-day': arrivalDate.getDate().toString(),
    'arrivalDate-month': arrivalDate.getMonth().toString(),
    'arrivalDate-year': arrivalDate.getFullYear().toString(),
    departureDate: DateFormats.formatApiDate(departureDate),
    'departureDate-day': departureDate.getDate().toString(),
    'departureDate-month': departureDate.getMonth().toString(),
    'departureDate-year': departureDate.getFullYear().toString(),
  }
})
