import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Cas3Turnaround } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3Turnaround>(() => ({
  id: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  workingDays: faker.number.int({ min: 1, max: 10 }),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
}))
