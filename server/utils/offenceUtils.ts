import { ActiveOffence } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import { DateFormats } from './dateUtils'

const offenceTableRows = (offences: Array<ActiveOffence>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  offences.forEach(offence => {
    rows.push([
      {
        html: offenceRadioButton(offence),
      },
      {
        text: offence.offenceId,
      },
      {
        text: offence.offenceDescription,
      },
      {
        text: DateFormats.isoDateToUIDate(offence.offenceDate),
      },
      {
        text: String(offence.convictionId),
      },
    ])
  })

  return rows
}

const offenceRadioButton = (offence: ActiveOffence) => {
  return `
  <div class="govuk-radios__item">
    <input class="govuk-radios__input" id="offenceId" name="offenceId" type="radio" value="${offence.offenceId}" />
    <label class="govuk-label govuk-radios__label" for="where-do-you-live">
      <span class="govuk-visually-hidden">
        Select ${offence.offenceDescription} as index offence
      </span>
    </label>
  </div>
  `
}

export { offenceTableRows, offenceRadioButton }
