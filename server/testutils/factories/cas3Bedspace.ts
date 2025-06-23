import { Factory } from 'fishery'
import { Cas3Bedspace } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import characteristicFactory from './characteristic'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3Bedspace>(() => ({
  id: faker.string.uuid(),
  reference: `Room ${faker.number.int({ min: 1, max: 9999 })}`,
  status: faker.helpers.arrayElement(['online', 'upcoming', 'archived']),
  characteristics: faker.helpers.multiple(() => characteristicFactory.build(), { count: { min: 1, max: 5 } }),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past({ years: 1 })),
  notes: faker.helpers
    .multiple(() => `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`)
    .join(', '),
}))
