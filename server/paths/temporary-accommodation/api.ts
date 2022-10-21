import { path } from 'static-path'
import paths from '../api'

const localAuthoritiesPath = path('/reference-data/local-authority-areas')

const localAuthoritiesPaths = {
  index: localAuthoritiesPath,
}

export default {
  ...paths,
  localAuthorities: {
    index: localAuthoritiesPaths.index,
  },
}
