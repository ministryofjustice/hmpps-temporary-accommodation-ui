// eslint-disable import/no-unresolved,global-require
/* istanbul ignore file */

import fs from 'fs'

const packageData = JSON.parse(fs.readFileSync('./package.json').toString())
const { buildNumber, gitRef } = fs.existsSync('./build-info.json')
  ? JSON.parse(fs.readFileSync('./build-info.json').toString())
  : {
      buildNumber: packageData.version,
      gitRef: 'unknown',
    }

export default { buildNumber, gitRef, packageData }
