import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { BookingSearchResultBookingSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<BookingSearchResultBookingSummary>(() => ({
  id: faker.datatype.uuid(),
  status: faker.helpers.arrayElement(['provisional', 'confirmed', 'arrived', 'departed'] as const),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
