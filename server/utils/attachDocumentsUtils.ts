import { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import { ErrorMessages, TableRow } from '@approved-premises/ui'

import paths from '../paths/apply'
import { DateFormats } from './dateUtils'

const tableRows = (
  documents: Array<Document>,
  selectedDocuments: Array<Document>,
  application: ApprovedPremisesApplication,
  errors: ErrorMessages,
): Array<TableRow> => {
  const rows = [] as Array<TableRow>
  const selectedDocumentIds = selectedDocuments.map(d => d.id)

  documents.forEach(document => {
    rows.push([
      {
        html: documentCheckbox(document, selectedDocumentIds),
        classes: 'applications--pages--attach-document__column-name',
        attributes: {
          id: `selectedDocuments_${document.id}`,
        },
      },
      {
        text: DateFormats.isoDateToUIDate(document.createdAt),
        classes: 'applications--pages--attach-document__column-date',
      },
      {
        html: `<a href="${paths.applications.people.documents({
          crn: application.person.crn,
          documentId: document.id,
        })}" data-cy-documentId="${document.id}">Download</a>`,
        classes: 'applications--pages--attach-document__column-download',
      },
      {
        html: descriptionTextArea(documentWithDescription(document, selectedDocuments), errors),
        classes: 'applications--pages--attach-document__column-description',
      },
    ])
  })

  return rows
}

const documentCheckbox = (document: Document, selectedDocumentIds: Array<string>): string => {
  return `
  <div class="govuk-checkboxes__item">
    <input class="govuk-checkboxes__input" id="documentIds[${document.id}]" name="documentIds" type="checkbox" value="${
    document.id
  }" ${selectedDocumentIds.includes(document.id) ? 'checked' : ''}>
    <label class="govuk-label govuk-checkboxes__label" for="documentIds[${document.id}]">
      ${document.fileName}
    </label>
  </div>
  `
}

const descriptionTextArea = (document: Document, errors: ErrorMessages): string => {
  let input = `<textarea class="govuk-textarea ${
    errors[`selectedDocuments_${document.id}`] ? 'govuk-input--error' : ''
  }" id="document_${document.id}_description" name="documentDescriptions[${
    document.id
  }]" rows="3" aria-describedby="selectedDocuments_${document.id}_error">${
    document.description ? document.description : ''
  }</textarea>`

  if (errors[`selectedDocuments_${document.id}`]) {
    input = `
      ${input}
      <p id="selectedDocuments_${document.id}_error" class="govuk-error-message govuk-!-font-size-16">
        <span class="govuk-visually-hidden">Error:</span> ${errors[`selectedDocuments_${document.id}`].text}
      </p>
    `
  }

  return input
}

const documentWithDescription = (document: Document, selectedDocuments: Array<Document>): Document => {
  const selectedDocument = selectedDocuments.find(d => d.id === document.id)

  if (!selectedDocument) {
    return document
  }

  return { ...document, description: selectedDocument.description || selectedDocument?.typeDescription }
}

export { tableRows, documentCheckbox, descriptionTextArea, documentWithDescription }
