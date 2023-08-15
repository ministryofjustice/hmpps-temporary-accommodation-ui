import { Factory } from 'fishery'
import { PlaceContext } from '../../@types/ui'
import assessmentFactory from './assessment'

export default Factory.define<PlaceContext>(() => ({
  assessment: assessmentFactory.build({
    status: 'ready_to_place',
  }),
}))
