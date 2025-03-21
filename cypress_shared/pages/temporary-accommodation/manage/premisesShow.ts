import type { TemporaryAccommodationPremises as Premises, ProbationRegion, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import { characteristicFactory, pduFactory, premisesFactory } from '../../../../server/testutils/factories'
import { statusInfo } from '../../../../server/utils/premisesUtils'
import Page from '../../page'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Premises) {
    super('View a property')
  }

  static visit(premises: Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises)
  }

  getPremises(alias: string): void {
    cy.url().then(url => {
      const id = url.match(/properties\/(.+)/)[1]

      cy.get('[data-cy-premises] h3').then(nameElement => {
        cy.get('.govuk-summary-list__key')
          .contains('Address')
          .siblings('.govuk-summary-list__value')
          .then(addressElement => {
            cy.get('.govuk-summary-list__key')
              .contains('Status')
              .siblings('.govuk-summary-list__value')
              .then(statusElement => {
                cy.get('.govuk-summary-list__key')
                  .contains('PDU')
                  .siblings('.govuk-summary-list__value')
                  .then(pduElement => {
                    cy.get('.govuk-summary-list__key')
                      .contains('Attributes')
                      .siblings('.govuk-summary-list__value')
                      .then(attributeElement => {
                        cy.get('.govuk-summary-list__key')
                          .contains('Expected turnaround time')
                          .siblings('.govuk-summary-list__value')
                          .then(turnaroundTimeElement => {
                            cy.get('[data-cy-premises]').then(pduIdElement => {
                              const premises = this.parsePremises(
                                id,
                                nameElement,
                                addressElement,
                                statusElement,
                                pduElement,
                                pduIdElement,
                                attributeElement,
                                turnaroundTimeElement,
                              )

                              cy.wrap(premises).as(alias)
                            })
                          })
                      })
                  })
              })
          })
      })
    })
  }

  shouldShowPremisesDetails(): void {
    cy.get('h2').should('contain', `${this.premises.addressLine1}, ${this.premises.postcode}`)

    cy.get(`[data-cy-premises]`).within(() => {
      cy.get('h3').should('contain', this.premises.name)

      this.shouldShowKeyAndValues('Address', [
        this.premises.addressLine1,
        this.premises.addressLine2,
        this.premises.town,
        this.premises.postcode,
      ])
      this.shouldShowKeyAndValue('Local authority', this.premises.localAuthorityArea.name)
      this.shouldShowKeyAndValue('Probation region', this.premises.probationRegion.name)
      this.shouldShowKeyAndValue('PDU', this.premises.probationDeliveryUnit.name)
      this.shouldShowKeyAndValues(
        'Attributes',
        this.premises.characteristics.map(({ name }) => name),
      )
      this.shouldShowKeyAndValue('Status', statusInfo(this.premises.status).name)
      this.shouldShowKeyAndValues('Notes', this.premises.notes.split('\n'))
      this.shouldShowKeyAndValue(
        'Expected turnaround time',
        `${this.premises.turnaroundWorkingDayCount} working ${
          this.premises.turnaroundWorkingDayCount === 1 ? 'day' : 'days'
        }`,
      )
    })
  }

  shouldShowAsActive(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('a').should('contain', 'Add a bedspace')
    })

    cy.root().should('not.contain', 'This is an archived property.')
  }

  shouldShowAsArchived(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.root().should('not.contain', 'Actions')
    })

    cy.root().should('contain', 'This is an archived property.')
  }

  shouldShowProbationRegion(probationRegion: ProbationRegion): void {
    this.shouldShowKeyAndValue('Probation region', probationRegion.name)
  }

  shouldShowRoomDetails(room: Room): void {
    cy.get('h4')
      .contains(room.name)
      .parents('[data-cy-bedspace]')
      .within(() => {
        this.shouldShowKeyAndValues(
          'Attributes',
          room.characteristics.map(({ name }) => name),
        )
        this.shouldShowKeyAndValues('Notes', room.notes.split('\n'))
      })
  }

  clickAddBedspaceLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').then($button => {
        if ($button.find('.moj-button-menu__item').length > 0) {
          cy.wrap($button).click()
          cy.get('.moj-button-menu__item').should('contain.text', 'Add a bedspace').click()
        } else {
          cy.wrap($button).find('a').contains('Add a bedspace').click()
        }
      })
    })
  }

  clickPremisesEditLink(): void {
    cy.get(`[data-cy-premises]`).within(() => {
      cy.get('a').contains('Edit').click()
    })
  }

  clickBedpaceViewLink(room: Room): void {
    cy.get('h4')
      .contains(`Bedspace name: ${room.name}`)
      .parents('[data-cy-bedspace]')
      .within(() => {
        cy.get('a').contains('View').click()
      })
  }

  private parsePremises(
    id: string,
    nameElement: JQuery<HTMLElement>,
    addressElement: JQuery<HTMLElement>,
    statusElement: JQuery<HTMLElement>,
    pduElement: JQuery<HTMLElement>,
    pduIdElement: JQuery<HTMLElement>,
    attributeElement: JQuery<HTMLElement>,
    turnaroundTimeElement: JQuery<HTMLElement>,
  ): Premises {
    const name = nameElement.text()

    const addressLines = addressElement
      .html()
      .split('<br>')
      .map(text => text.trim())

    const status = statusElement.text().trim() === 'Online' ? 'active' : 'archived'

    const pduName = pduElement.text().trim()
    const pdu = pduFactory.build({
      id: pduIdElement.data('cy-pdu-id'),
      name: pduName,
    })

    const characteristics = attributeElement
      .children('ul')
      .children('li')
      .toArray()
      .map(element => characteristicFactory.build({ name: element.innerText }))

    const turnaroundWorkingDayCount = Number.parseInt(turnaroundTimeElement.text().trim().split(' ')[0], 10)

    const premises = premisesFactory.build({
      id,
      name,
      addressLine1: addressLines[0],
      town: addressLines[addressLines.length - 2],
      postcode: addressLines[addressLines.length - 1],
      status,
      pdu: pdu.name,
      probationDeliveryUnit: pdu,
      characteristics,
      turnaroundWorkingDayCount,
    })

    return premises
  }
}
