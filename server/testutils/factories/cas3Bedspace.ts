import { Factory } from 'fishery'
import { Cas3Bedspace, type Cas3BedspaceArchiveAction } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { ReferenceData } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'
import characteristicFactory from './characteristic'

class BedspaceFactory extends Factory<Cas3Bedspace> {
  /* istanbul ignore next */
  forEnvironment(characteristics: ReferenceData[]) {
    return this.params({
      characteristics: faker.helpers
        .arrayElements(characteristics, faker.number.int({ min: 1, max: 5 }))
        .map(characteristic =>
          characteristicFactory.build({
            ...characteristic,
            modelScope: 'room',
          }),
        ),
    })
  }
}

export default BedspaceFactory.define(() => ({
  id: faker.string.uuid(),
  reference: `Room ${faker.number.int({ min: 1, max: 9999 })}`,
  status: faker.helpers.arrayElement(['online', 'upcoming', 'archived']),
  characteristics: unique(referenceDataFactory.characteristic('room').buildList(faker.number.int({ min: 1, max: 5 }))),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past({ years: 1 })),
  notes: faker.helpers
    .multiple(() => `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`)
    .join(', '),
  archiveHistory: Array<Cas3BedspaceArchiveAction>(),
}))
