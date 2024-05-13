/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import Needs from './needs'
import PropertyAttributesOrAdaptations from './propertyAttributesOrAdaptations'
import ReligiousOrCulturalNeeds from './religiousOrCulturalNeeds'

@Task({
  name: 'Health, disability and cultural needs',
  actionText: 'Add health, disability, and cultural needs',
  slug: 'disability-cultural-and-specific-needs',
  pages: [Needs, PropertyAttributesOrAdaptations, ReligiousOrCulturalNeeds],
})
export default class DisabilityCulturalAndSpecificNeeds {}
