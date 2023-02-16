import { ApprovedPremisesApplication as Application, Document } from '../../@types/shared'

export const documentsFromApplication = (application: Application): Array<Document> => {
  return (
    application?.data?.['attach-required-documents']?.['attach-documents']?.selectedDocuments || ([] as Array<Document>)
  )
}

export const overwriteApplicationDocuments = (
  application: Application,
  selectedDocuments: Array<Document>,
): Application => {
  application.data['attach-required-documents'] = {
    'attach-documents': {
      selectedDocuments,
    },
  }

  return application
}
