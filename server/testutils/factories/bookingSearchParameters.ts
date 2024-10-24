import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { BookingSearchParameters } from '@approved-premises/ui'

export default Factory.define<BookingSearchParameters>(() => ({
  crnOrName: faker.helpers.arrayElement([
    `C${faker.number.int({ min: 100000, max: 999999 })}`,
    faker.person.firstName(),
  ]),
}))
