import { Factory } from 'fishery'
import { Cas3Bedspaces } from '@approved-premises/api'
import cas3BedspaceFactory from './cas3Bedspace'

export default Factory.define<Cas3Bedspaces>(() => {
  const bedspaces = cas3BedspaceFactory.buildList(5)

  return {
    bedspaces,
    totalOnlineBedspaces: bedspaces.filter(bed => bed.status === 'online').length,
    totalUpcomingBedspaces: bedspaces.filter(bed => bed.status === 'upcoming').length,
    totalArchivedBedspaces: bedspaces.filter(bed => bed.status === 'archived').length,
  }
})
