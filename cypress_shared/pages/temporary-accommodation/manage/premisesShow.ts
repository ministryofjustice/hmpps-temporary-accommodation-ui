import type { TemporaryAccommodationPremises as Premises, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import { characteristicFactory, pduFactory, premisesFactory } from '../../../../server/testutils/factories'
import Page from '../../page'

export default class PremisesShowPage extends Page {
  constructor(premisesAddress: string) {
    super(premisesAddress.substring(0, 5))
  }

  static visit(premises: Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises.addressLine1)
  }

  getPremises(alias: string): void {
    cy.url().then(url => {
      const id = url.match(/properties\/(.+)/)[1]

      cy.get('.govuk-summary-card__content').then(nameElement => {
        cy.get('.govuk-summary-list__key')
          .contains('Address')
          .siblings('.govuk-summary-list__value')
          .then(addressElement => {
            cy.get('.govuk-summary-list__key')
              .contains('Probation delivery unit')
              .siblings('.govuk-summary-list__value')
              .then(pduElement => {
                cy.get('.govuk-summary-list__key')
                  .contains('Property details')
                  .siblings('.govuk-summary-list__value')
                  .then(attributeElement => {
                    cy.get('.govuk-summary-list__key')
                      .contains('Expected turn around time')
                      .siblings('.govuk-summary-list__value')
                      .then(turnaroundTimeElement => {
                        cy.get('[data-cy-premises]').then(pduIdElement => {
                          const premises = this.parsePremises(
                            id,
                            nameElement,
                            addressElement,
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
  }

  clickAddBedspaceLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').then($button => {
        if ($button.find('.moj-button-menu__item').length > 0) {
          cy.wrap($button).click()
          cy.get('.moj-button-menu__item').first().click()
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

    const status = 'active'

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
