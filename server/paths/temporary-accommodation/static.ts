import { temporaryAccommodationPath } from '../service'

const cookiesPath = temporaryAccommodationPath.path('cookies')
const useNDeliusPath = temporaryAccommodationPath.path('use-ndelius')
const notAuthorisedPath = temporaryAccommodationPath.path('not-authorised')
const accessibilityStatementPath = temporaryAccommodationPath.path('accessibility-statement')
const maintenancePath = temporaryAccommodationPath.path('maintenance')
const userDetailsRequiredPath = temporaryAccommodationPath.path('user-details-required')

const paths = {
  static: {
    cookies: cookiesPath,
    accessibilityStatement: accessibilityStatementPath,
    useNDelius: useNDeliusPath,
    notAuthorised: notAuthorisedPath,
    maintenance: maintenancePath,
    userDetailsRequired: userDetailsRequiredPath,
  },
}

export default paths
