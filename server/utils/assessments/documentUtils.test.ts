import { applicationFactory, documentFactory } from '../../testutils/factories'
import { documentsFromApplication, overwriteApplicationDocuments } from './documentUtils'

describe('documentUtils', () => {
  describe('overwriteApplicationDocuments', () => {
    it('overwrites the current documents on the application with the ones supplied and returns the application', () => {
      const application = applicationFactory.build()
      const originalDocuments = documentFactory.buildList(1)
      const newDocuments = documentFactory.buildList(2)

      application.data['attach-required-documents'] = {
        'attach-documents': {
          selectedDocuments: originalDocuments,
        },
      }

      const applicationWithNewDocuments = overwriteApplicationDocuments(application, newDocuments)

      expect(documentsFromApplication(applicationWithNewDocuments)).toEqual(newDocuments)
    })
  })
  describe('documentsFromApplication', () => {
    it('returns the selected documents if they exist', () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(2)

      application.data['attach-required-documents'] = {
        'attach-documents': {
          selectedDocuments: documents,
        },
      }

      expect(documentsFromApplication(application)).toEqual(documents)
    })

    it('returns an empty array if the application doesnt have selected documents', () => {
      const application = applicationFactory.build()

      expect(documentsFromApplication(application)).toEqual([])
    })
  })
})
