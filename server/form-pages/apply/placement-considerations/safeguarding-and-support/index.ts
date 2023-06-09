/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import CaringResponsibilities from './caringResponsibilities'
import LocalConnections from './localConnections'
import SafeguardingAndVulnerability from './safeguardingAndVulnerability'
import SupportInTheCommunity from './supportInTheComunity'

@Task({
  name: 'Safeguarding and support',
  actionText: 'Add information on safeguarding and support',
  slug: 'safeguarding-and-support',
  pages: [SafeguardingAndVulnerability, SupportInTheCommunity, LocalConnections, CaringResponsibilities],
})
export default class SafeguardingAndSupport {}
