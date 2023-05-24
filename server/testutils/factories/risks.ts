import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { PersonRisks } from '@approved-premises/api'
import { RiskLevel } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import tierEnvelopeFactory, { riskEnvelopeStatuses } from './tierEnvelopeFactory'

const riskLevels: Array<RiskLevel> = ['Low', 'Medium', 'High', 'Very High']

export default Factory.define<PersonRisks>(() => ({
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
  roshRisks: roshRisksFactory.build(),
  mappa: mappaFactory.build(),
  flags: flagsFactory.build(),
  tier: tierEnvelopeFactory.build(),
}))

const roshRisksFactory = Factory.define<PersonRisks['roshRisks']>(() => ({
  status: faker.helpers.arrayElement(riskEnvelopeStatuses),
  value: {
    overallRisk: faker.helpers.arrayElement(riskLevels),
    riskToChildren: faker.helpers.arrayElement(riskLevels),
    riskToPublic: faker.helpers.arrayElement(riskLevels),
    riskToKnownAdult: faker.helpers.arrayElement(riskLevels),
    riskToStaff: faker.helpers.arrayElement(riskLevels),
    lastUpdated: DateFormats.dateObjToIsoDate(faker.date.past()),
  },
}))

const mappaFactory = Factory.define<PersonRisks['mappa']>(() => ({
  status: faker.helpers.arrayElement(riskEnvelopeStatuses),
  value: { level: 'CAT 2 / LEVEL 1', lastUpdated: DateFormats.dateObjToIsoDate(faker.date.past()) },
}))

const flagsFactory = Factory.define<PersonRisks['flags']>(() => {
  return {
    status: faker.helpers.arrayElement(riskEnvelopeStatuses),
    value: faker.helpers.arrayElements([
      'Registered Sex Offender',
      'Hate Crime',
      'Non Registered Sex Offender',
      'Not MAPPA Eligible',
      'Sexual Harm Prevention Order/Sexual Risk Order',
      'Street Gangs',
      'Suicide/Self Harm',
      'Weapons',
    ]),
  }
})
