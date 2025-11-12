import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3Arrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3Arrival>(() => {
  const sevenDays = new Date()
  sevenDays.setDate(sevenDays.getDate() - 7)
  const arrivalDate = faker.date.soon({ days: 7, refDate: sevenDays })

  const dayAfterArrival = new Date(arrivalDate)
  dayAfterArrival.setDate(dayAfterArrival.getDate() + 1)

  const eightyFourDaysAfterArrival = new Date(arrivalDate)
  eightyFourDaysAfterArrival.setDate(eightyFourDaysAfterArrival.getDate() + 84)

  const expectedDepartureDate = faker.date.between({ from: dayAfterArrival, to: eightyFourDaysAfterArrival })

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    arrivalTime: DateFormats.dateObjToIsoDateTime(arrivalDate),
    bookingId: faker.string.uuid(),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(expectedDepartureDate),
    notes: faker.lorem.sentence(),
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  }
})
