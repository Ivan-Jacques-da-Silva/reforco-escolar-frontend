import { test, expect } from '@playwright/test';

test.describe('Student Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@reforcoescolar.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard with increased timeout
    await expect(page).toHaveURL(/\/dashboard|^\/$/, { timeout: 15000 });
  });

  test('should create a new student with complete profile', async ({ page }) => {
    // Navigate to students section via sidebar
    // Note: The app uses internal state for navigation, not URL routes for sections
    await page.click('button:has-text("Alunos")');
    
    // Wait for the "Novo Aluno" button to be visible
    const newStudentBtn = page.locator('button:has-text("Novo Aluno")');
    await expect(newStudentBtn).toBeVisible();
    await newStudentBtn.click();
    
    // Generate unique data
    const timestamp = Date.now();
    const studentName = `Test Student ${timestamp}`;
    const studentEmail = `student${timestamp}@test.com`;
    
    // --- Step 1: Personal Data ---
    await expect(page.locator('text=Dados Pessoais')).toBeVisible();
    await page.fill('#name', studentName);
    await page.fill('#email', studentEmail);
    await page.fill('#phone', '(11) 99999-9999');
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');
    
    // Click Next
    await page.click('button:has-text("Próximo")');
    
    // --- Step 2: School Data ---
    // Wait for School tab to be active or school input to appear
    await expect(page.locator('input[name="school"]')).toBeVisible();
    await page.selectOption('#grade', '6º Fundamental');
    await page.fill('#school', 'Test School');
    
    // Click Next
    await page.click('button:has-text("Próximo")');
    
    // --- Step 3: Parents Data ---
    await expect(page.locator('input[name="parentName"]')).toBeVisible();
    await page.fill('#parentName', 'Parent Name');
    await page.fill('#parentPhone', '(11) 98888-8888');
    await page.fill('#parentEmail', `parent${timestamp}@test.com`);
    
    // Click Next
    await page.click('button:has-text("Próximo")');
    
    // --- Step 4: Financial Data ---
    await expect(page.locator('select[name="financialType"]')).toBeVisible();
    await page.selectOption('select[name="financialType"]', 'monthly');
    await page.fill('input[name="amount"]', '500');
    await page.selectOption('select[name="dueDateDay"]', '10');
    
    // Submit
    await page.click('button:has-text("Salvar Cadastro")');
    
    // Verify success
    // Wait for modal to close or toast message
    // And check if student appears in the list
    // Use first() to avoid strict mode violation if name appears in multiple places (e.g. table and card view)
    await expect(page.locator(`text=${studentName}`).first()).toBeVisible();
    await expect(page.locator(`text=${studentEmail}`).first()).toBeVisible();
  });
});
