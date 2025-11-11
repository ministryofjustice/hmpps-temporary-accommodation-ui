import { Factory } from 'fishery'
import { Cas3BedspaceSummary } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3BedspaceSummary>(() => ({
  id: faker.string.uuid(),
  reference: faker.string.alphanumeric(6),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
}))
