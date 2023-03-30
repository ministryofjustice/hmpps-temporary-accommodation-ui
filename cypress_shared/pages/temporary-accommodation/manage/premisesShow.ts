import type { TemporaryAccommodationPremises as Premises, ProbationRegion, Room } from '@approved-premises/api'

import pduJson from '../../../../server/data/pdus.json'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { premisesFactory } from '../../../../server/testutils/factories'
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
        const name = nameElement.text()

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
                    const status = statusElement.text().trim() === 'Online' ? 'active' : 'archived'
                    const addressLines = addressElement
                      .html()
                      .split('<br>')
                      .map(text => text.trim())

                    const pduName = pduElement.text().trim()
                    const pdu = pduJson.find(p => p.name === pduName)?.id as string

                    const premises = premisesFactory.build({
                      id,
                      name,
                      addressLine1: addressLines[0],
                      postcode: addressLines[addressLines.length - 1],
                      status,
                      pdu,
                    })

                    cy.wrap(premises).as(alias)
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
      this.shouldShowKeyAndValue('PDU', this.premises.pdu)
      this.shouldShowKeyAndValues(
        'Attributes',
        this.premises.characteristics.map(({ name }) => name),
      )
      this.shouldShowKeyAndValue('Status', statusInfo(this.premises.status).name)
      this.shouldShowKeyAndValues('Notes', this.premises.notes.split('\n'))
    })
  }

  shouldShowAsActive(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').should('contain', 'Add a bedspace')
    })

    cy.root().should('not.contain', 'This is an archived property.')
  }

  shouldShowAsArchived(): void {
    cy.get('.moj-page-header-actions').within(() => {
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
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Add a bedspace').click()
    })
  }

  clickPremisesEditLink(): void {
    cy.get(`[data-cy-premises]`).within(() => {
      cy.get('a').contains('Edit').click()
    })
  }

  clickBedpaceViewLink(room: Room): void {
    cy.get('h4')
      .contains(room.name)
      .parents('[data-cy-bedspace]')
      .within(() => {
        cy.get('a').contains('View').click()
      })
  }
}
