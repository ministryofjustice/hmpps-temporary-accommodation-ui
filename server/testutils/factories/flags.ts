import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { PersonRisks } from '@approved-premises/api'
import { riskEnvelopeStatuses } from './tierEnvelopeFactory'

export default Factory.define<PersonRisks['flags']>(() => {
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
