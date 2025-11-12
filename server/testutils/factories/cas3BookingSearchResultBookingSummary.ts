import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Cas3BookingSearchResultBookingSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3BookingSearchResultBookingSummary>(() => ({
  id: faker.string.uuid(),
  status: faker.helpers.arrayElement(['provisional', 'confirmed', 'arrived', 'departed'] as const),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
}))
