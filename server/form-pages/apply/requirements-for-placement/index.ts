import { Section } from '../../utils/decorators'
import DisabilityCulturalAndSpecificNeeds from './disability-cultural-and-specific-needs'
import MoveOnPlanTask from './move-on-plan'
import FoodAllergiesTask from './food-allergies'
import SafeguardingAndSupport from './safeguarding-and-support'

@Section({
  title: 'Health, disability, culture and safeguarding',
  tasks: [DisabilityCulturalAndSpecificNeeds, SafeguardingAndSupport, FoodAllergiesTask, MoveOnPlanTask],
})
export default class HealthDisabilityCultureAndSafeguarding {}
