import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { Bed } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Bed>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  bedEndDate: DateFormats.dateObjToIsoDate(faker.date.future({ years: 1 })),
}))
