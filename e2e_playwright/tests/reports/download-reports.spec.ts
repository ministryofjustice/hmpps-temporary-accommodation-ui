import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import { visitReportsPageAndDownloadReport } from '../../steps/reports'

const startDate = '01/03/2024'
const endDate = '01/04/2024'

test('Download booking report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'book', assessor.probationRegion, startDate, endDate)
})

test('Download bed-space usage report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'bedSpace', assessor.probationRegion, startDate, endDate)
})

test('Download future bookings report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'futureBookings', assessor.probationRegion, startDate, endDate)
})

test('Download occupancy report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'occupancy', assessor.probationRegion, startDate, endDate)
})

test('Download referrals report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'referrals', assessor.probationRegion, startDate, endDate)
})
