import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { CallConfig } from '../../../data/restClient'
import { ApplicationService, PersonService } from '../../../services'
import applicationFactory from '../../../testutils/factories/application'
import documentFactory from '../../../testutils/factories/document'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import AttachDocuments from './attachDocuments'

jest.mock('../../../services/applicationService.ts')

describe('attachDocuments', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const application = applicationFactory.build()
  const documents = documentFactory.buildList(3)

  describe('initialize', () => {
    const getDocumentsMock = jest.fn().mockResolvedValue(documents)
    let applicationService: DeepMocked<ApplicationService>
    const personService = createMock<PersonService>({})

    beforeEach(() => {
      applicationService = createMock<ApplicationService>({
        getDocuments: getDocumentsMock,
      })
    })

    it('calls the getDocuments method on the client with a token and the application', async () => {
      await AttachDocuments.initialize({}, application, callConfig, { personService, applicationService })

      expect(getDocumentsMock).toHaveBeenCalledWith(callConfig, application)
    })

    it('assigns the selected documents', async () => {
      const page = await AttachDocuments.initialize(
        {
          documentIds: [documents[0].id, documents[1].id],
          documentDescriptions: {
            [documents[0].id]: 'Document 1 Description',
            [documents[1].id]: 'Document 2 Description',
          },
        },
        application,
        callConfig,
        { applicationService, personService },
      )

      expect(page.body).toEqual({
        selectedDocuments: [
          { ...documents[0], description: 'Document 1 Description' },
          { ...documents[1], description: 'Document 2 Description' },
        ],
      })
      expect(page.documents).toEqual(documents)
    })

    it('assigns the selected documents if the selection is not an array', async () => {
      const page = await AttachDocuments.initialize(
        { documentIds: documents[0].id, documentDescriptions: { [documents[0].id]: documents[0].description } },
        application,
        callConfig,
        {
          applicationService,
          personService,
        },
      )

      expect(page.body).toEqual({ selectedDocuments: [documents[0]] })
    })

    it('returns the selected documents if they are already defined', async () => {
      const page = await AttachDocuments.initialize(
        {
          selectedDocuments: [documents[0]],
        },
        application,
        callConfig,
        { applicationService, personService },
      )

      expect(page.body).toEqual({
        selectedDocuments: [documents[0]],
      })
      expect(page.documents).toEqual(documents)
    })
  })

  itShouldHaveNextValue(new AttachDocuments({}, application), '')

  itShouldHavePreviousValue(new AttachDocuments({}, application), '')

  describe('errors', () => {
    it('should return an error if a document does not have a description', () => {
      const selectedDocuments = [
        documentFactory.build({ fileName: 'file1.pdf', description: 'Description goes here' }),
        documentFactory.build({ fileName: 'file2.pdf', description: null }),
      ]

      const page = new AttachDocuments({ selectedDocuments }, application)
      expect(page.errors()).toEqual({
        [`selectedDocuments_${selectedDocuments[1].id}`]: `You must enter a description for the document '${selectedDocuments[1].fileName}'`,
      })
    })
  })

  describe('response', () => {
    it('should return a record with the document filename as the key and the description as the value', () => {
      const selectedDocuments = [
        documentFactory.build({ fileName: 'file1.pdf', description: 'Description goes here' }),
        documentFactory.build({ fileName: 'file2.pdf', description: null }),
      ]

      const page = new AttachDocuments({ selectedDocuments }, application)

      expect(page.response()).toEqual({ 'file1.pdf': 'Description goes here', 'file2.pdf': 'No description' })
    })
  })
})
