import { Section } from '../../utils/decorators'
import DisabilityCulturalAndSpecificNeeds from './disability-cultural-and-specific-needs'
import MoveOnPlanTask from './move-on-plan'
import PlacementLocation from './placement-location'
import FoodAllergiesTask from './food-allergies'
import SafeguardingAndSupport from './safeguarding-and-support'

@Section({
  title: 'Requirements for placement',
  tasks: [
    PlacementLocation,
    DisabilityCulturalAndSpecificNeeds,
    SafeguardingAndSupport,
    FoodAllergiesTask,
    MoveOnPlanTask,
  ],
})
export default class RequirementsForPlacement {}
