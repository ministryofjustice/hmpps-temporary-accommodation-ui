import { temporaryAccommodationPath } from '../service'

const cookiesPath = temporaryAccommodationPath.path('cookies')
const useNDeliusPath = temporaryAccommodationPath.path('use-ndelius')
const notAuthorisedPath = temporaryAccommodationPath.path('not-authorised')

const paths = {
  static: {
    cookies: cookiesPath,
    useNDelius: useNDeliusPath,
    notAuthorised: notAuthorisedPath,
  },
}

export default paths
