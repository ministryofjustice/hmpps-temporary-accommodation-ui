import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { NewArrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewArrival>(() => {
  const arrivalDate = faker.date.soon()

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future(1, arrivalDate)),
    notes: faker.lorem.sentence(),
    keyWorkerStaffCode: faker.string.uuid(),
  }
})
