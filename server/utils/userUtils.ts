import { Request } from 'express'
import { ProbationRegion } from '../@types/shared'

export default function filterProbationRegions(regions: ProbationRegion[], request: Request) {
  return [regions.find(region => region.id === request.session.actingUserProbationRegion.id)]
}
