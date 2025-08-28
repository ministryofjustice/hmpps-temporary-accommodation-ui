import { Factory } from 'fishery'
import { Cas3ValidationResults } from '@approved-premises/api'
import cas3BedspaceReferenceFactory from './cas3BedspaceReference'

export default Factory.define<Cas3ValidationResults>(() => ({
  items: cas3BedspaceReferenceFactory.buildList(5),
}))
