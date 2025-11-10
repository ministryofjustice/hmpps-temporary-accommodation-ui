import { Factory } from 'fishery'
import { Cas3NewBedspace } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import cas3BedspaceCharacteristicsFactory from './cas3BedspaceCharacteristics'

export default Factory.define<Cas3NewBedspace>(() => {
  const characteristics = faker.helpers.multiple(() => cas3BedspaceCharacteristicsFactory.build(), {
    count: { min: 1, max: 5 },
  })
  return {
    reference: faker.string.alphanumeric(6),
    characteristicIds: characteristics.map(c => c.id),
    startDate: DateFormats.dateObjToIsoDate(faker.date.past({ years: 1 })),
    notes: faker.helpers
      .multiple(() => `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`)
      .join(', '),
  }
})
