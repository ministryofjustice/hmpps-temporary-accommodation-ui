/* istanbul ignore file */

import ApType from './apType'
import PipeReferral from './pipeReferral'
import PipeOpdScreening from './pipeOpdScreening'
import EsapPlacementScreening from './esapPlacementScreening'
import EsapPlacementSecreting from './esapPlacementSecreting'

const pages = {
  'ap-type': ApType,
  'pipe-referral': PipeReferral,
  'pipe-opd-screening': PipeOpdScreening,
  'esap-placement-screening': EsapPlacementScreening,
  'esap-placement-secreting': EsapPlacementSecreting,
}

export default pages
