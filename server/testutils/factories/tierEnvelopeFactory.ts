import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { PersonRisks, RiskEnvelopeStatus } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { RiskTierLevel, TierLetter, TierNumber } from '../../@types/ui'

export const riskEnvelopeStatuses: Array<RiskEnvelopeStatus> = ['retrieved', 'not_found', 'error']

const lettersFactory: () => TierLetter = () => faker.helpers.arrayElement<TierLetter>(['A', 'B', 'C', 'D'])
const numbersFactory: () => TierNumber = () => faker.helpers.arrayElement<TierNumber>(['1', '2', '3', '4'])

const riskTierLevel: RiskTierLevel = `${lettersFactory()}${numbersFactory()}`

export default Factory.define<PersonRisks['tier']>(() => ({
  status: faker.helpers.arrayElement(riskEnvelopeStatuses),
  value: {
    level: riskTierLevel,
    lastUpdated: DateFormats.dateObjToIsoDate(faker.date.past()),
  },
}))
