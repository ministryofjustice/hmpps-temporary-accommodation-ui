import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Cas3BookingSearchResultPersonSummary } from '@approved-premises/api'

export default Factory.define<Cas3BookingSearchResultPersonSummary>(() => ({
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
  name: faker.person.fullName(),
}))
