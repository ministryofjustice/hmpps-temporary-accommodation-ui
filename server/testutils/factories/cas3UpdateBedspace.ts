import { Factory } from 'fishery'
import { Cas3UpdateBedspace } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'

export default Factory.define<Cas3UpdateBedspace>(() => {
  const characteristicIds = unique(
    referenceDataFactory.characteristic('room').buildList(
      faker.number.int({
        min: 1,
        max: 5,
      }),
    ),
  ).map(ch => ch.id)

  return {
    reference: faker.string.alphanumeric(6),
    characteristicIds,
    notes: faker.lorem.sentences(3),
  }
})
