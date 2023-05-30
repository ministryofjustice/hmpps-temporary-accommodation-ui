import { BedSearchResult } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import paths from '../paths/temporary-accommodation/manage'

export function resultTableRows(results: BedSearchResult[]): Array<TableRow> {
  return results.map(result => [
    textValue(`${result.room.name}`),
    textValue(`${result.premises.addressLine1}, ${result.premises.postcode}`),
    textValue(result.premises.bedCount.toString()),
    htmlValue(
      `<a href="${paths.premises.bedspaces.show({
        premisesId: result.premises.id,
        roomId: result.room.id,
      })}">View<span class="govuk-visually-hidden"> bedspace for ${result.premises.addressLine1}</span></a>`,
    ),
  ])
}

function textValue(value: string) {
  return { text: value }
}

function htmlValue(value: string) {
  return { html: value }
}

export const BedspaceSearchResultUtils = {
  resultTableRows,
}
