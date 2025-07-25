import {
  Cas3BedspacePremisesSearchResult,
  Cas3NewPremises,
  Cas3Premises,
  Cas3PremisesSearchResult,
  Cas3PremisesSearchResults,
  Cas3PremisesSortBy,
  Cas3PremisesStatus,
  Characteristic,
  LocalAuthorityArea,
  ProbationDeliveryUnit,
  ProbationRegion,
} from '@approved-premises/api'
import { SummaryList, TableRow } from '@approved-premises/ui'
import { PremisesClientV2 as PremisesClient, ReferenceDataClient, RestClientBuilder } from '../../data'

import { CallConfig } from '../../data/restClient'
import paths from '../../paths/temporary-accommodation/manage'
import { DateFormats } from '../../utils/dateUtils'
import { convertToTitleCase } from '../../utils/utils'
import { filterCharacteristics } from '../../utils/characteristicUtils'

export type Cas3PremisesReferenceData = {
  localAuthorities: Array<LocalAuthorityArea>
  characteristics: Array<Characteristic>
  probationRegions: Array<ProbationRegion>
  pdus: Array<ProbationDeliveryUnit>
}

export default class PremisesService {
  constructor(
    protected readonly premisesClientFactory: RestClientBuilder<PremisesClient>,
    protected readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async searchDataAndGenerateTableRows(
    callConfig: CallConfig,
    postcodeOrAddress: string | undefined,
    status: Cas3PremisesStatus = 'online',
    premisesSortBy: Cas3PremisesSortBy = 'pdu',
  ): Promise<Cas3PremisesSearchResults & { tableRows: Array<TableRow> }> {
    const premisesClient = this.premisesClientFactory(callConfig)

    const premises = await premisesClient.search(postcodeOrAddress ?? '', status, premisesSortBy)

    return {
      ...premises,
      tableRows: this.tableRows(premises, premisesSortBy),
    }
  }

  async getSinglePremises(callConfig: CallConfig, premisesId: string): Promise<Cas3Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.find(premisesId)
  }

  async getSinglePremisesDetails(
    callConfig: CallConfig,
    premisesId: string,
  ): Promise<Cas3Premises & { fullAddress: string }> {
    const premises = await this.getSinglePremises(callConfig, premisesId)

    return {
      ...premises,
      fullAddress: this.formatAddress(premises),
    }
  }

  async getReferenceData(callConfig: CallConfig): Promise<Cas3PremisesReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const [unsortedLocalAuthorities, unsortedCharacteristics, unsortedProbationRegions, unsortedPdus] =
      await Promise.all([
        referenceDataClient.getReferenceData<LocalAuthorityArea>('local-authority-areas'),
        referenceDataClient.getReferenceData<Characteristic>('characteristics'),
        referenceDataClient.getReferenceData<ProbationRegion>('probation-regions'),
        referenceDataClient.getReferenceData<ProbationDeliveryUnit>('probation-delivery-units', {
          probationRegionId: callConfig.probationRegion.id,
        }),
      ])

    const localAuthorities = unsortedLocalAuthorities.sort((a, b) => a.name.localeCompare(b.name))

    const characteristics = filterCharacteristics(unsortedCharacteristics, 'premises').sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    const probationRegions = unsortedProbationRegions.sort((a, b) => a.name.localeCompare(b.name))

    const pdus = unsortedPdus.sort((a, b) => a.name.localeCompare(b.name))

    return { localAuthorities, characteristics, probationRegions, pdus }
  }

  async createPremises(callConfig: CallConfig, newPremises: Cas3NewPremises): Promise<Cas3Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    return premisesClient.create(newPremises)
  }

  tableRows(premises: Cas3PremisesSearchResults, premisesSortBy: Cas3PremisesSortBy = 'pdu'): Array<TableRow> {
    return premises.results === undefined
      ? []
      : premises.results.map(entry => {
          return [
            this.htmlValue(this.formatAddress(entry)),
            this.htmlValue(this.formatBedspaces(entry)),
            this.textValue(premisesSortBy === 'pdu' ? entry.pdu : entry.localAuthorityAreaName),
            this.htmlValue(this.formatPremisesManageLink(entry)),
          ]
        })
  }

  summaryList(premises: Cas3Premises): SummaryList {
    return {
      rows: [
        {
          key: { text: 'Property status' },
          value: this.htmlValue(this.formatPremisesStatus(premises.status)),
        },
        {
          key: { text: 'Start date' },
          value: this.textValue(this.formatDate(premises.startDate)),
        },
        {
          key: { text: 'Address' },
          value: this.htmlValue(this.formatAddress(premises)),
        },
        {
          key: { text: 'Local authority' },
          value: this.textValue(premises.localAuthorityArea?.name ?? ''),
        },
        {
          key: { text: 'Probation region' },
          value: this.textValue(premises.probationRegion.name),
        },
        {
          key: { text: 'Probation delivery unit' },
          value: this.textValue(premises.probationDeliveryUnit.name),
        },
        {
          key: { text: 'Expected turn around time' },
          value: this.textValue(this.formatTurnaround(premises.turnaroundWorkingDays)),
        },
        {
          key: { text: 'Property details' },
          value: this.htmlValue(this.formatDetails(premises.characteristics)),
        },
        {
          key: { text: 'Additional property details' },
          value: this.textValue(premises.notes || 'None'),
        },
      ],
    }
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private formatAddress(premises: {
    addressLine1: string
    addressLine2?: string
    town?: string
    postcode: string
  }): string {
    return [premises.addressLine1, premises.addressLine2, premises.town, premises.postcode]
      .filter(line => line !== undefined && line !== null)
      .map(line => line.trim())
      .filter(line => line !== '')
      .join('<br />')
  }

  private bedspaceUrl(premisesId: string, bedspaceId: string): string {
    return paths.premises.v2.bedspaces.show({ premisesId, bedspaceId })
  }

  private premisesUrl(premisesId: string): string {
    return paths.premises.v2.show({ premisesId })
  }

  private formatPremisesManageLink(premises: Cas3PremisesSearchResult): string {
    const hidden = `<span class="govuk-visually-hidden"> property at ${premises.addressLine1}, ${premises.postcode}</span>`
    return `<a href="${this.premisesUrl(premises.id)}">Manage${hidden}</a>`
  }

  private formatBedspace(premisesId: string, bedspace: Cas3BedspacePremisesSearchResult): string {
    const archived =
      bedspace.status === 'archived' ? ` <strong class="govuk-tag govuk-tag--grey">Archived</strong>` : ''

    return `<a href="${this.bedspaceUrl(premisesId, bedspace.id)}">${bedspace.reference}</a>${archived}`
  }

  private formatBedspaces(premises: Cas3PremisesSearchResult): string {
    if (premises.bedspaces === undefined || premises.bedspaces.length === 0) {
      return `No bedspaces<br /><a href="${paths.premises.v2.bedspaces.new({ premisesId: premises.id })}">Add a bedspace</a>`
    }

    return premises.bedspaces.map(bedspace => this.formatBedspace(premises.id, bedspace)).join('<br />')
  }

  private formatDate(dateString: string | undefined | null): string {
    const isEmpty = dateString === undefined || dateString === null || dateString === ''
    return isEmpty ? '' : DateFormats.isoDateToUIDate(dateString)
  }

  private formatTurnaround(numberOfDays: number | undefined): string {
    return `${numberOfDays} working days`
  }

  private formatDetails(characteristics: Array<Characteristic>): string {
    if (characteristics === undefined || characteristics.length === 0) {
      return '<p>None</p><p><a href="#">Add property details</a></p>'
    }

    return characteristics
      .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
      .join(' ')
  }

  private getPremisesStatusTagColour(status: Cas3PremisesStatus): string {
    switch (status) {
      case 'online':
        return 'govuk-tag--green'
      case 'archived':
        return 'govuk-tag--grey'
      default:
        return ''
    }
  }

  private formatPremisesStatus(status: Cas3PremisesStatus): string {
    const tagClass = this.getPremisesStatusTagColour(status)
    return `<strong class="govuk-tag ${tagClass}">${convertToTitleCase(status)}</strong>`
  }
}
