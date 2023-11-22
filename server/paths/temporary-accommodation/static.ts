import { temporaryAccommodationPath } from '../service'

const cookiesPath = temporaryAccommodationPath.path('cookies')
const useNDeliusPath = temporaryAccommodationPath.path('use-ndelius')
const notAuthorisedPath = temporaryAccommodationPath.path('not-authorised')
const accessibilityStatementPath = temporaryAccommodationPath.path('accessibility-statement')

const paths = {
  static: {
    cookies: cookiesPath,
    accessibilityStatement: accessibilityStatementPath,
    useNDelius: useNDeliusPath,
    notAuthorised: notAuthorisedPath,
  },
}

export default paths
