import { Factory } from 'fishery'
import { AssessmentSearchParameters } from '@approved-premises/ui'
import { faker } from '@faker-js/faker/locale/en_GB'

export default Factory.define<AssessmentSearchParameters>(() => ({
  query: faker.lorem.lines(),
}))
