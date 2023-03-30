import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { BookingSearchResultPersonSummary } from '@approved-premises/api'

export default Factory.define<BookingSearchResultPersonSummary>(() => ({
  crn: `C${faker.datatype.number({ min: 100000, max: 999999 })}`,
  name: faker.name.fullName(),
}))
