import { test, expect } from '@playwright/test';

test.describe('Material Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@reforcoescolar.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|^\/$/);
  });

  test('should create a new material', async ({ page }) => {
    // Navigate to Materials
    await page.click('button:has-text("Materiais")');
    // Note: The app uses internal state for navigation, not URL routes for sections
    await expect(page.locator('button:has-text("Novo Material")').first()).toBeVisible();

    // Open Modal
    await page.click('button:has-text("Novo Material")');
    await expect(page.locator('text=Novo Material').first()).toBeVisible();

    // Tab: Informações Básicas (Default)
    const timestamp = Date.now();
    const sku = `MAT-${timestamp}`;
    const name = `Livro de Matemática ${timestamp}`;

    await page.fill('input[name="sku"]', sku);
    await page.fill('input[name="name"]', name);

    // Go to Next Tab (Controle de Estoque)
    await page.click('button:has-text("Próximo")');
    
    await page.fill('input[name="quantity"]', '50');
    await page.fill('input[name="minimum"]', '5');

    // Submit (Button text is "Criar Material")
    await page.click('button:has-text("Criar Material")');

    // Verification
    // Use specific selector for the modal title to avoid matching the dashboard button
    await expect(page.locator('h3:has-text("Novo Material")')).not.toBeVisible();
    await expect(page.locator(`text=${name}`).first()).toBeVisible();
    await expect(page.locator(`text=${sku}`).first()).toBeVisible();
  });
});
