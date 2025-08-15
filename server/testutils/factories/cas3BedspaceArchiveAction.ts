import { Factory } from 'fishery'
import { Cas3BedspaceArchiveAction } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3BedspaceArchiveAction>(() => ({
  status: faker.helpers.arrayElement(['online', 'archived']),
  date: DateFormats.dateObjToIsoDate(faker.date.past({ years: 1 })),
}))
