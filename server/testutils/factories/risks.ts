import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { PersonRisks } from '@approved-premises/api'
import flagsFactory from './flags'
import mappaFactory from './mappa'
import roshRisksFactory from './roshRisks'
import tierEnvelopeFactory from './tierEnvelopeFactory'

export class RisksFactory extends Factory<PersonRisks> {
  /* istanbul ignore next */
  retrived() {
    return this.params({
      roshRisks: roshRisksFactory.build({
        status: 'retrieved',
      }),
      mappa: mappaFactory.build({
        status: 'retrieved',
      }),
      flags: flagsFactory.build({
        status: 'retrieved',
      }),
      tier: tierEnvelopeFactory.build({
        status: 'retrieved',
      }),
    })
  }

  /* istanbul ignore next */
  error() {
    return this.params({
      roshRisks: roshRisksFactory.build({
        status: 'error',
      }),
      mappa: mappaFactory.build({
        status: 'error',
      }),
      flags: flagsFactory.build({
        status: 'error',
      }),
      tier: tierEnvelopeFactory.build({
        status: 'error',
      }),
    })
  }
}

export default RisksFactory.define(() => ({
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
  roshRisks: roshRisksFactory.build(),
  mappa: mappaFactory.build(),
  flags: flagsFactory.build(),
  tier: tierEnvelopeFactory.build(),
}))
