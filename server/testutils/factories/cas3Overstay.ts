import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas3Overstay } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3Overstay>(() => {
  const today = new Date()
  const eightyFourDays = today.setDate(today.getDate() + 84)
  return {
    bookingId: faker.string.uuid(),
    createdAt: DateFormats.dateObjToIsoDateTime(today),
    id: faker.string.uuid(),
    newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon({ refDate: eightyFourDays, days: 28 })),
    isAuthorised: faker.number.int({ min: 0, max: 1 }) === 1,
    previousDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 83, refDate: today })),
    reason: faker.lorem.lines(3),
  }
})
