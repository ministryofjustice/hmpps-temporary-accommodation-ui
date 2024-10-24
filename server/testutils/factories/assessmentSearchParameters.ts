import { Factory } from 'fishery'
import { AssessmentSearchParameters } from '@approved-premises/ui'
import { fakerEN_GB as faker } from '@faker-js/faker'

export default Factory.define<AssessmentSearchParameters>(() => ({
  crnOrName: faker.helpers.arrayElement([
    `C${faker.number.int({ min: 100000, max: 999999 })}`,
    faker.person.firstName(),
  ]),
}))
