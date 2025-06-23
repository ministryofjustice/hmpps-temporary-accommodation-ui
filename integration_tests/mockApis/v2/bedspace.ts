import { Cas3Bedspace } from '@approved-premises/api'
import { stubFor } from '../index'

type BedspaceArguments = {
  premisesId: string
  bedspace: Cas3Bedspace
}

const stubBedspaceV2 = (args: BedspaceArguments) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `/cas3/premises/${args.premisesId}/bedspaces/${args.bedspace.id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.bedspace,
    },
  })

export default {
  stubBedspaceV2,
}
