import { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import { DateFormats } from '../../../server/utils/dateUtils'

import ApplyPage from './applyPage'

export default class AttachDocumentsPage extends ApplyPage {
  documents: Array<Document>

  selectedDocuments: Array<Document>

  constructor(
    documents: Array<Document>,
    selectedDocuments: Array<Document>,
    application: ApprovedPremisesApplication,
  ) {
    super(
      'Select any additional documents that are required to support your application',
      application,
      'attach-required-documents',
      'attach-documents',
      paths.applications.show({ id: application.id }),
    )

    this.documents = documents
    this.selectedDocuments = selectedDocuments
  }

  shouldDisplayDocuments() {
    this.documents.forEach(document => {
      cy.get('tr')
        .contains(document.fileName)
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(DateFormats.isoDateToUIDate(document.createdAt))
        })
    })
  }

  completeForm() {
    this.selectedDocuments.forEach(d => {
      cy.get('label').contains(d.fileName).click()
      cy.get(`textarea[name="documentDescriptions[${d.id}]"]`).clear().type(d.description)
    })
  }
}
