import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { PlaceContext } from '../../@types/ui'
import { DateFormats } from '../../utils/dateUtils'
import assessmentFactory from './assessment'

export default Factory.define<PlaceContext>(() => ({
  assessment: assessmentFactory.build({
    status: 'ready_to_place',
  }),
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.future()),
}))
