import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { NewOverstay } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewOverstay>(() => {
  const today = new Date()
  const eightyFourDays = today.setDate(today.getDate() + 84)
  return {
    newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon({ refDate: eightyFourDays, days: 28 })),
    isAuthorised: faker.number.int({ min: 0, max: 1 }) === 1,
    reason: faker.lorem.lines(3),
  }
})
