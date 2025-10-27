import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3VoidBedspaceRequest } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import cas3VoidBedspaceReasonFactory from './cas3VoidBedspaceReason'

export default Factory.define<Cas3VoidBedspaceRequest>(() => {
  const startDate = faker.date.soon()
  const endDate = faker.date.future()
  return {
    costCentre: faker.helpers.arrayElement(['HMPPS', 'SUPPLIER']),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    notes: faker.lorem.sentence(),
    reasonId: cas3VoidBedspaceReasonFactory.build().id,
    referenceNumber: faker.string.uuid(),
    startDate: DateFormats.dateObjToIsoDate(startDate),
  }
})
