import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('TaxMaster PAYE Calculator', () => {
    test.beforeEach(async ({ page }) => {
        const filePath = `file://${path.resolve('index.html')}`;
        await page.goto(filePath);
    });

    test('should calculate correct tax for 200,000 (0%)', async ({ page }) => {
        await page.fill('#gross-salary', '200000');
        await page.click('#calculate-btn');
        await expect(page.locator('#res-tax')).toHaveText('UGX 0');
        await expect(page.locator('#res-net')).toHaveText('UGX 200,000');
    });

    test('should calculate correct tax for 300,000 (10% of excess over 235,000)', async ({ page }) => {
        // (300,000 - 235,000) * 0.10 = 6,500
        await page.fill('#gross-salary', '300000');
        await page.click('#calculate-btn');
        await expect(page.locator('#res-tax')).toHaveText('UGX 6,500');
        await expect(page.locator('#res-net')).toHaveText('UGX 293,500');
    });

    test('should calculate correct tax for 400,000 (10,000 + 20% of excess over 335,000)', async ({ page }) => {
        // 10,000 + (400,000 - 335,000) * 0.20 = 10,000 + 13,000 = 23,000
        await page.fill('#gross-salary', '400000');
        await page.click('#calculate-btn');
        await expect(page.locator('#res-tax')).toHaveText('UGX 23,000');
        await expect(page.locator('#res-net')).toHaveText('UGX 377,000');
    });

    test('should calculate correct tax for 500,000 (25,000 + 30% of excess over 410,000)', async ({ page }) => {
        // 25,000 + (500,000 - 410,000) * 0.30 = 25,000 + 27,000 = 52,000
        await page.fill('#gross-salary', '500000');
        await page.click('#calculate-btn');
        await expect(page.locator('#res-tax')).toHaveText('UGX 52,000');
        await expect(page.locator('#res-net')).toHaveText('UGX 448,000');
    });

    test('should calculate correct tax for 11,000,000 (with 10% surcharge)', async ({ page }) => {
        // Base tax for 11,000,000: 25,000 + (11,000,000 - 410,000) * 0.30 = 25,000 + 3,177,000 = 3,202,000
        // Surcharge: (11,000,000 - 10,000,000) * 0.10 = 100,000
        // Total: 3,302,000
        await page.fill('#gross-salary', '11000000');
        await page.click('#calculate-btn');
        await expect(page.locator('#res-tax')).toHaveText('UGX 3,302,000');
        await expect(page.locator('#res-net')).toHaveText('UGX 7,698,000');
    });

    test('should copy summary to clipboard', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.fill('#gross-salary', '500000');
        await page.click('#calculate-btn');
        await page.click('#copy-btn');

        const copiedText = await page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });

        expect(copiedText).toContain('Gross Salary: UGX 500,000');
        expect(copiedText).toContain('PAYE Tax: UGX 52,000');
        expect(copiedText).toContain('Net Pay: UGX 448,000');
    });

    test('should be responsive (mobile view)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8 size
        const header = page.locator('header h1');
        const headerFontSize = await header.evaluate((el) => window.getComputedStyle(el).fontSize);
        // Checking if media query applied (from 2.5rem to 2rem)
        // 2rem usually ~32px, 2.5rem usually ~40px
        expect(parseFloat(headerFontSize)).toBeLessThan(40);
    });
});
