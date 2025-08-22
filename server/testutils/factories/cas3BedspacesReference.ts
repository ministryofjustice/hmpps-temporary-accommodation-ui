import { Factory } from 'fishery'
import { Cas3BedspacesReference } from '@approved-premises/api'
import cas3BedspaceReferenceFactory from './cas3BedspaceReference'

export default Factory.define<Cas3BedspacesReference>(() => ({
  affectedBedspaces: cas3BedspaceReferenceFactory.buildList(5),
}))
