import type { Cas3PremisesStatus } from '@approved-premises/api'
import { PlaceContext, SubNavObj } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'
import { appendQueryString } from './utils'
import { addPlaceContext } from './placeUtils'

export function createSubNavArr(
  status: Cas3PremisesStatus,
  placeContext: PlaceContext,
  postcodeOrAddress?: string,
): Array<SubNavObj> {
  return ['online', 'archived'].map((premisesStatus: Cas3PremisesStatus) => ({
    text: `${capitaliseStatus(premisesStatus)} properties`,
    href: addPlaceContext(appendQueryString(paths.premises[premisesStatus]({}), { postcodeOrAddress }), placeContext),
    active: status === premisesStatus,
  }))
}

function capitaliseStatus(status: Cas3PremisesStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
