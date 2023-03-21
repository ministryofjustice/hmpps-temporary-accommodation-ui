import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { NewBooking } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import personFactory from './person'

export default Factory.define<NewBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.future()

  return {
    crn: personFactory.build().crn,
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
    bedId: faker.datatype.uuid(),
    serviceName: 'temporary-accommodation',
  }
})
