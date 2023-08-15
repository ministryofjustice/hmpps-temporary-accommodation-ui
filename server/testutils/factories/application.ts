import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { OASysSection, TemporaryAccommodationApplication } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import { fakeObject } from '../utils'
import { fullPersonFactory } from './person'
import risksFactory from './risks'

class ApplicationFactory extends Factory<TemporaryAccommodationApplication> {
  withReleaseDate(releaseDate = DateFormats.dateObjToIsoDate(faker.date.soon())) {
    return this.params({
      data: {
        ...fakeObject(),
        'basic-information': {
          'release-date': { releaseDate, knowReleaseDate: 'yes' },
          'placement-date': { startDateSameAsReleaseDate: 'yes' },
        },
      },
    })
  }

  withOptionalOasysSectionsSelected(needsLinkedToReoffending: Array<OASysSection>, otherNeeds: Array<OASysSection>) {
    return this.params({
      data: {
        ...fakeObject(),
        'oasys-import': {
          'optional-oasys-sections': {
            needsLinkedToReoffending,
            otherNeeds,
          },
        },
      },
    })
  }

  withData() {
    return this.params({
      data: fakeObject(),
      document: fakeObject(),
    })
  }
}

export default ApplicationFactory.define(() => ({
  id: faker.string.uuid(),
  person: faker.helpers.arrayElement([fullPersonFactory.build()]),
  createdByUserId: faker.string.uuid(),
  schemaVersion: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  data: {},
  document: {},
  outdatedSchema: faker.datatype.boolean(),
  risks: risksFactory.build(),
  status: 'inProgress' as const,
  type: 'CAS3',
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
