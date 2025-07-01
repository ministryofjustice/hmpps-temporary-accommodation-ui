import { Factory } from 'fishery'
import { Cas3NewBedspace, Characteristic } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import characteristicFactory from './characteristic'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3NewBedspace>(() => {
  const characteristics = faker.helpers.multiple(() => characteristicFactory.build(), { count: { min: 1, max: 5 } })
  return {
    reference: `Room ${faker.number.int({ min: 1, max: 9999 })}`,
    characteristicIds: characteristics.map((c: Characteristic) => c.id),
    startDate: DateFormats.dateObjToIsoDate(faker.date.past({ years: 1 })),
    notes: faker.helpers
      .multiple(() => `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`)
      .join(', '),
  }
})
