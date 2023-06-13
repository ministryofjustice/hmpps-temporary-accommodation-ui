import { Section } from '../../utils/decorators'
import MoveOnPlanTask from './move-on-plan'
import RequirementsForPlacement from './requirements-for-placement'
import SafeguardingAndSupport from './safeguarding-and-support'

@Section({
  title: 'Placement considerations',
  tasks: [SafeguardingAndSupport, RequirementsForPlacement, MoveOnPlanTask],
})
export default class PlacementConsiderations {}
