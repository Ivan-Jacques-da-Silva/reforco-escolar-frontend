import { test, expect } from '@playwright/test';

test.describe('Tutoring Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@reforcoescolar.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|^\/$/);
  });

  test('should create a new tutoring session', async ({ page }) => {
    // Navigate to Tutorings
    await page.click('button:has-text("Reforços")');
    // Note: The app uses internal state for navigation, not URL routes for sections
    await expect(page.locator('button:has-text("Novo Reforço")').first()).toBeVisible();

    // Open Modal
    await page.click('button:has-text("Novo Reforço")');
    await expect(page.locator('text=Novo Reforço').first()).toBeVisible();

    // Tab: Dados da Aula (Default)
    // Select Student
    await page.waitForTimeout(1000); // Wait for students to load
    const studentSelect = page.locator('select[name="studentId"]');
    await expect(studentSelect).toBeVisible();
    await studentSelect.selectOption({ index: 1 });

    await page.fill('input[name="subject"]', 'Matemática Avançada');
    await page.fill('input[name="topic"]', 'Cálculo I');

    // Go to Next Tab (Agendamento)
    await page.click('button:has-text("Próximo")');
    
    // Handle DatePicker
    const dateInput = page.locator('.react-datepicker__input-container input');
    await dateInput.click();
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} 14:00`;
    await dateInput.fill(formattedDate);
    await page.keyboard.press('Enter');

    // Submit (Button text is "Criar Reforço")
    await page.click('button:has-text("Criar Reforço")');

    // Verification
    // Use specific selector for the modal title to avoid matching the dashboard button
    await expect(page.locator('h3:has-text("Novo Reforço")')).not.toBeVisible();
    await expect(page.locator('text=Matemática Avançada').first()).toBeVisible();
    await expect(page.locator('text=Cálculo I').first()).toBeVisible();
  });
});
