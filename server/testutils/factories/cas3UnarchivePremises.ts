import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3UnarchivePremises } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3UnarchivePremises>(() => ({
  restartDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 2 })),
}))
