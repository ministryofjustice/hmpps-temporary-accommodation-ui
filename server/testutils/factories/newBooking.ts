import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { NewBooking } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory as personFactory } from './person'

export default Factory.define<NewBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.future({ years: 1, refDate: arrivalDate })

  return {
    crn: personFactory.build().crn,
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
    bedId: faker.string.uuid(),
    assessmentId: faker.string.uuid(),
    serviceName: 'temporary-accommodation',
  }
})
