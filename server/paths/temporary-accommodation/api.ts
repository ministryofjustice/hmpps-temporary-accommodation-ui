import { path } from 'static-path'
import paths from '../api'

const localAuthoritiesPath = path('/local-authorities')

const localAuthoritiesPaths = {
  index: localAuthoritiesPath,
}

export default {
  ...paths,
  localAuthorities: {
    index: localAuthoritiesPaths.index,
  },
}
