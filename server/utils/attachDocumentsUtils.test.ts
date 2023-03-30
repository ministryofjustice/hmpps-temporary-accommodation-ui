import { ErrorMessages } from '@approved-premises/ui'
import { descriptionTextArea, documentCheckbox, documentWithDescription, tableRows } from './attachDocumentsUtils'

import paths from '../paths/apply'
import { applicationFactory, documentFactory } from '../testutils/factories'

import { DateFormats } from './dateUtils'

describe('attachDocumentsUtils', () => {
  describe('tableRows', () => {
    it('returns table rows for documents', () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(2)
      const selectedDocuments = [documents[0]]
      const errors = {
        selectedDocuments_123: {
          text: 'You must enter a description',
          attributes: {},
        },
      } as ErrorMessages

      expect(tableRows(documents, selectedDocuments, application, errors)).toEqual([
        [
          {
            html: documentCheckbox(documents[0], [documents[0].id]),
            classes: 'applications--pages--attach-document__column-name',
            attributes: {
              id: `selectedDocuments_${documents[0].id}`,
            },
          },
          {
            text: DateFormats.isoDateToUIDate(documents[0].createdAt),
            classes: 'applications--pages--attach-document__column-date',
          },
          {
            html: `<a href="${paths.applications.people.documents({
              crn: application.person.crn,
              documentId: documents[0].id,
            })}" data-cy-documentId="${documents[0].id}">Download</a>`,
            classes: 'applications--pages--attach-document__column-download',
          },
          {
            html: descriptionTextArea(documentWithDescription(documents[0], selectedDocuments), errors),
            classes: 'applications--pages--attach-document__column-description',
          },
        ],
        [
          {
            html: documentCheckbox(documents[1], [documents[0].id]),
            classes: 'applications--pages--attach-document__column-name',
            attributes: {
              id: `selectedDocuments_${documents[1].id}`,
            },
          },
          {
            text: DateFormats.isoDateToUIDate(documents[1].createdAt),
            classes: 'applications--pages--attach-document__column-date',
          },
          {
            html: `<a href="${paths.applications.people.documents({
              crn: application.person.crn,
              documentId: documents[1].id,
            })}" data-cy-documentId="${documents[1].id}">Download</a>`,
            classes: 'applications--pages--attach-document__column-download',
          },
          {
            html: descriptionTextArea(documentWithDescription(documents[1], selectedDocuments), errors),
            classes: 'applications--pages--attach-document__column-description',
          },
        ],
      ])
    })
  })

  describe('documentCheckbox', () => {
    it('returns a checkbox for a document', () => {
      const document = documentFactory.build({ id: '123', fileName: 'file.pdf' })

      expect(documentCheckbox(document, ['345', '678'])).toMatchStringIgnoringWhitespace(`
      <div class="govuk-checkboxes__item">
        <input class="govuk-checkboxes__input" id="documentIds[123]" name="documentIds" type="checkbox" value="123">
        <label class="govuk-label govuk-checkboxes__label" for="documentIds[123]">
          file.pdf
        </label>
      </div>
      `)
    })

    it('marks the checkbox as checked if it is present in the selectedDocumentIds', () => {
      const document = documentFactory.build({ id: '123', fileName: 'file.pdf' })

      expect(documentCheckbox(document, ['123', '345', '678'])).toMatchStringIgnoringWhitespace(`
      <div class="govuk-checkboxes__item">
        <input class="govuk-checkboxes__input" id="documentIds[123]" name="documentIds" type="checkbox" value="123" checked>
        <label class="govuk-label govuk-checkboxes__label" for="documentIds[123]">
          file.pdf
        </label>
      </div>
      `)
    })
  })

  describe('documentWithDescription', () => {
    it('returns the document with a description if a document with the same ID is in the selectedDocuments argument', () => {
      const document = documentFactory.build({ id: '123', description: null })
      const selectedDocument = documentFactory.build({ id: '123', description: 'Description goes here' })

      expect(documentWithDescription(document, [selectedDocument, documentFactory.build()])).toEqual({
        ...document,
        description: selectedDocument.description,
      })
    })

    it('uses the typeDescription if the document description is undefined', () => {
      const document = documentFactory.build({ id: '123', description: null })
      const selectedDocument = documentFactory.build({
        id: '123',
        description: undefined,
        typeDescription: 'PNC previous convictions',
      })

      expect(documentWithDescription(document, [selectedDocument, documentFactory.build()])).toEqual({
        ...document,
        description: 'PNC previous convictions',
      })
    })

    it('returns the document if the document with the same ID is not in the selectedDocuments argument', () => {
      const document = documentFactory.build({ id: '123', description: null })

      expect(documentWithDescription(document, documentFactory.buildList(4))).toEqual(document)
    })
  })

  describe('descriptionTextArea', () => {
    it('returns a textarea for a document', () => {
      const document = documentFactory.build({ id: '123', fileName: 'file.pdf', description: 'Description goes here' })

      expect(descriptionTextArea(document, {})).toMatchStringIgnoringWhitespace(
        `<textarea class="govuk-textarea" id="document_123_description" name="documentDescriptions[123]" rows="3" aria-describedby="selectedDocuments_123_error">
          Description goes here
        </textarea>`,
      )
    })

    it('appends errors if they are present', () => {
      const document = documentFactory.build({ id: '123', fileName: 'file.pdf', description: 'Description goes here' })
      const errors = {
        selectedDocuments_123: {
          text: 'You must enter a description',
          attributes: {},
        },
      } as ErrorMessages

      expect(descriptionTextArea(document, errors)).toMatchStringIgnoringWhitespace(
        `<textarea class="govuk-textarea govuk-input--error" id="document_123_description" name="documentDescriptions[123]" rows="3" aria-describedby="selectedDocuments_123_error">Description goes here</textarea>
        <p id="selectedDocuments_123_error" class="govuk-error-message govuk-!-font-size-16">
          <span class="govuk-visually-hidden">Error:</span> You must enter a description
        </p>`,
      )
    })
  })
})
