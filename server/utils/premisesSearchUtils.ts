import type { Cas3PremisesStatus } from '@approved-premises/api'
import type { SubNavObj } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'
import { appendQueryString } from './utils'

export function createSubNavArr(status: Cas3PremisesStatus, postcodeOrAddress?: string): Array<SubNavObj> {
  return ['online', 'archived'].map((premisesStatus: Cas3PremisesStatus) => ({
    text: `${capitaliseStatus(premisesStatus)} properties`,
    href: appendQueryString(paths.premises[premisesStatus]({}), { postcodeOrAddress }),
    active: status === premisesStatus,
  }))
}

function capitaliseStatus(status: Cas3PremisesStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
