import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { NewCas3Arrival as NewArrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewArrival>(() => {
  const sevenDays = new Date()
  sevenDays.setDate(sevenDays.getDate() - 7)
  const arrivalDate = faker.date.soon({ days: 7, refDate: sevenDays })

  const maxDepartureDate = new Date(arrivalDate)
  maxDepartureDate.setDate(maxDepartureDate.getDate() + 84)
  const expectedDepartureDate = faker.date.soon({ days: 84, refDate: arrivalDate })

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(expectedDepartureDate),
    notes: faker.lorem.sentence(),
    type: 'CAS3',
  }
})
