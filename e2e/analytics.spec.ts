import { test as base, expect, Page } from '@playwright/test';

let authedPage: Page;

const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page, context }, use) => {
    await page.goto('/');

    await expect(page.locator('main')).toContainText('Not signed in');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await page.waitForURL('/api/auth/signin');

    await page.getByPlaceholder('email@example.com').fill('tatana@mail.ru');
    await page.getByRole('button').click();

    await page.goto('http://localhost:1081/');
    await page.waitForSelector('table');

    await page.locator('tr').nth(1).click();

    const frame = page.frameLocator('iframe');
    const signInLink = frame.getByRole('link', { name: 'Sign in' });
    await signInLink.waitFor({ state: 'visible', timeout: 30000 });

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      signInLink.click()
    ]);

    await newPage.waitForLoadState('networkidle');
    await newPage.bringToFront();

    await newPage.getByRole('link', { name: 'Аналитика' }).click();
    await newPage.waitForURL('**/analytics');

    authedPage = newPage;
    await use(newPage);
  }
});

test.describe('Страница аналитики', () => {
  test('отображается заголовок и сводная статистика', async ({ authedPage }) => {
    await expect(authedPage.getByRole('heading', { name: 'Финансовая аналитика' })).toBeVisible();
    await expect(authedPage.getByText('Средние расходы')).toBeVisible();
    await expect(authedPage.getByText('Крупнейшие траты')).toBeVisible();
    await expect(authedPage.getByText('Доходы/Расходы')).toBeVisible();
  });

  test('отображение и переключение графика категорий', async ({ authedPage }) => {
    await authedPage.getByRole('button', { name: 'Столбчатая' }).click();
  
    const barChart = authedPage.locator('svg'); 
    await barChart.first().waitFor({ state: 'visible', timeout: 10000 });
  
    const countBar = await barChart.count();
    expect(countBar).toBeGreaterThan(0); // хотя бы 1
  
    console.log('Открываю вкладку "Круговая"');
    await authedPage.getByRole('button', { name: 'Круговая' }).click();
  
    const pieChart = authedPage.locator('svg');
    await pieChart.first().waitFor({ state: 'visible', timeout: 10000 });
  
    const countPie = await pieChart.count();
    expect(countPie).toBeGreaterThan(0);
  });
  
  test('работает селектор бюджета и периода', async ({ authedPage }) => {
    const budgetSelect = authedPage.locator('select#budget');
    await expect(budgetSelect).toBeVisible();
    
    // Ждём появления селектора периода
    const periodSelect = authedPage.locator('select#period');
    await expect(periodSelect).toBeVisible();
  
    // Выбираем "Последний месяц"
    await periodSelect.selectOption('lastMonth');
    await expect(periodSelect).toHaveValue('lastMonth');
  
    // Теперь выбираем "Пользовательский"
    await periodSelect.selectOption('custom');
    await expect(periodSelect).toHaveValue('custom');
  
  }); 
});
