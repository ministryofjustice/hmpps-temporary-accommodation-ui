/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import Needs from './needs'
import PropertyAttributesOrAdaptations from './propertyAttributesOrAdaptations'
import ReligiousOrCulturalNeeds from './religiousOrCulturalNeeds'

@Task({
  name: 'Disability, cultural and specific needs',
  actionText: 'Add disability, cultural and specific needs',
  slug: 'disability-cultural-and-specific-needs',
  pages: [Needs, PropertyAttributesOrAdaptations, ReligiousOrCulturalNeeds],
})
export default class DisabilityCulturalAndSpecificNeeds {}
