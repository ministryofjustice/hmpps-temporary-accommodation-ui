import { Section } from '../../utils/decorators'
import MoveOnPlanTask from './move-on-plan'
import RequirementsForPlacement from './requirements-for-placement'

@Section({ title: 'Placement considerations', tasks: [RequirementsForPlacement, MoveOnPlanTask] })
export default class PlacementConsiderations {}
