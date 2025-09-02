import { Page, expect } from '@playwright/test'
import { BasePage } from '../../basePage'

export class UnarchiveBedspacePage extends BasePage {
  static async initialise(page: Page, bedspaceReference: string) {
    await expect(page.locator('h1')).toContainText(`When should ${bedspaceReference} go online?`)
    return new UnarchiveBedspacePage(page)
  }
}
