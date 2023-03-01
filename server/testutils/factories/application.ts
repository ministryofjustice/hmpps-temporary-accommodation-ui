import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { ApprovedPremisesApplication } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import personFactory from './person'
import risksFactory from './risks'

class ApplicationFactory extends Factory<ApprovedPremisesApplication> {
  withReleaseDate(releaseDate = DateFormats.dateObjToIsoDate(faker.date.soon())) {
    return this.params({
      data: {
        ...JSON.parse(faker.datatype.json()),
        'basic-information': {
          'release-date': { releaseDate, knowReleaseDate: 'yes' },
          'placement-date': { startDateSameAsReleaseDate: 'yes' },
        },
      },
    })
  }

  withData() {
    return this.params({
      data: JSON.parse(faker.datatype.json()),
      document: JSON.parse(faker.datatype.json()),
    })
  }
}

export default ApplicationFactory.define(() => ({
  id: faker.datatype.uuid(),
  person: personFactory.build(),
  createdByUserId: faker.datatype.uuid(),
  schemaVersion: faker.datatype.uuid(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  data: {},
  document: {},
  outdatedSchema: faker.datatype.boolean(),
  isWomensApplication: faker.datatype.boolean(),
  isPipeApplication: faker.datatype.boolean(),
  risks: risksFactory.build(),
  status: 'inProgress' as const,
}))
