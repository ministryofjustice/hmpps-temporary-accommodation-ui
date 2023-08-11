import { temporaryAccommodationPath } from '../service'

const cookiesPath = temporaryAccommodationPath.path('cookies')
const useNDeliusPath = temporaryAccommodationPath.path('use-ndelius')

const paths = {
  static: {
    cookies: cookiesPath,
    useNDelius: useNDeliusPath,
  },
}

export default paths
