import { Section } from '../../utils/decorators'
import DisabilityCulturalAndSpecificNeeds from './disability-cultural-and-specific-needs'
import MoveOnPlanTask from './move-on-plan'
import PlacementLocation from './placement-location'
import RequirementsForPlacement from './requirements-for-placement'
import SafeguardingAndSupport from './safeguarding-and-support'

@Section({
  title: 'Placement considerations',
  tasks: [
    PlacementLocation,
    DisabilityCulturalAndSpecificNeeds,
    SafeguardingAndSupport,
    RequirementsForPlacement,
    MoveOnPlanTask,
  ],
})
export default class PlacementConsiderations {}
