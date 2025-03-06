import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import { visitReportsPageAndDownloadReport } from '../../steps/reports'

test('Download booking report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'book', assessor.probationRegion)
})

test('Download bed-space usage report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'bedSpace', assessor.probationRegion)
})

test('Download future bookings report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'futureBookings', assessor.probationRegion)
})

test('Download occupancy report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'occupancy', assessor.probationRegion)
})

test('Download referrals report for a probation region', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await visitReportsPageAndDownloadReport(page, 'referrals', assessor.probationRegion)
})
