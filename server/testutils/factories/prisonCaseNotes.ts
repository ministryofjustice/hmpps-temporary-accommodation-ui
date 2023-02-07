import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PrisonCaseNote } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<PrisonCaseNote>(({ sequence }) => ({
  authorName: faker.name.fullName(),
  id: faker.datatype.uuid(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  occurredAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  sensitive: faker.datatype.boolean(),
  subType: faker.helpers.arrayElement([
    'Well--Being Check',
    'Offender Supervisor Entry',
    'History Sheet Entry',
    'Ressettlement',
    'Key Worker Session',
    'De-selection',
    'Quality Work',
    'General Entry',
    'Incentive Warning',
    'Residence',
    'Offender Management Unit',
    'Education',
    'Communication',
    'Social Care',
    'Safer Custody',
  ]),
  type: faker.helpers.arrayElement([
    'General',
    'Key Worker Activity',
    'Accredited Programme',
    'Positive Behaviour',
    'Negative Behaviour',
    'Report',
    'Communication',
    'Achievements',
    'OMiC',
    'Social Care',
    'Observations',
  ]),
  note: `Note ${sequence}`,
}))
