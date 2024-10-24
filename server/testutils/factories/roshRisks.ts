import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { PersonRisks } from '@approved-premises/api'
import { RiskLevel } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import { riskEnvelopeStatuses } from './tierEnvelopeFactory'

const riskLevels: Array<RiskLevel> = ['Low', 'Medium', 'High', 'Very High']

export default Factory.define<PersonRisks['roshRisks']>(() => ({
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
