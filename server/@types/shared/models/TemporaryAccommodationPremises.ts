/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Premises } from './Premises'
import { ProbationDeliveryUnit } from './ProbationDeliveryUnit'

export type TemporaryAccommodationPremises = Premises & {
  pdu?: string
} & {
  pdu: string
  probationDeliveryUnit: ProbationDeliveryUnit
}
