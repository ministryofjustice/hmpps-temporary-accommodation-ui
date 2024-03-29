import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { NewCas3Arrival as NewArrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewArrival>(() => {
  const arrivalDate = faker.date.past()

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future({ years: 1, refDate: arrivalDate })),
    notes: faker.lorem.sentence(),
    type: 'CAS3',
  }
})
