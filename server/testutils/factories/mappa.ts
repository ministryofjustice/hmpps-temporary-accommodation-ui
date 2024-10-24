import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { PersonRisks } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { riskEnvelopeStatuses } from './tierEnvelopeFactory'

export default Factory.define<PersonRisks['mappa']>(() => ({
  status: faker.helpers.arrayElement(riskEnvelopeStatuses),
  value: { level: 'CAT 2 / LEVEL 1', lastUpdated: DateFormats.dateObjToIsoDate(faker.date.past()) },
}))
