import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewBooking } from '@approved-premises/api'

import personFactory from './person'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.future()

  return {
    crn: personFactory.build().crn,
    arrivalDate: DateFormats.formatApiDate(arrivalDate),
    departureDate: DateFormats.formatApiDate(departureDate),
    serviceName: 'temporary-accommodation',
  }
})
