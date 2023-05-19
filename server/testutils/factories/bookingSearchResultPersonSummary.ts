import type { BookingSearchResultPersonSummary } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

export default Factory.define<BookingSearchResultPersonSummary>(() => ({
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
  name: faker.person.fullName(),
}))
