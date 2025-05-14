import { test as base, expect, Page } from '@playwright/test';

let authedPage: Page;

const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page, context }, use) => {
    await page.goto('/');

    await expect(page.locator('main')).toContainText('Not signed in');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await page.waitForURL('/api/auth/signin');

    await page.getByPlaceholder('email@example.com').fill('na.krash@mail.ru');
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

    await use(newPage);  // Передаём новую страницу в тесты
  }
});

test.describe('Главная страница', () => {
  test('проверка отображения приветственного сообщения и статистики', async ({ authedPage }) => {
    // Ожидаем загрузки страницы и успешной авторизации
    await authedPage.goto('/');
    await expect(authedPage.locator('main')).toContainText('Добро пожаловать na.krash@mail.ru!');
    // Переход к сводке (DashboardSummary)
    const totalBalance = authedPage.locator('text=Текущий баланс');
    const totalIncome = authedPage.locator('text=Доходы за неделю');
    const totalExpenses = authedPage.locator('text=Расходы за неделю');

    await expect(totalBalance).toBeVisible();
    await expect(totalIncome).toBeVisible();
    await expect(totalExpenses).toBeVisible();
  });

  test('проверка функционала "Быстрые действия"', async ({ authedPage }) => {
    const addTransactionButton = authedPage.locator('button', { hasText: 'Добавить транзакцию' });
    const createBudgetButton = authedPage.locator('button', { hasText: 'Создать бюджет' });
    const goToAnalyticsButton = authedPage.locator('button', { hasText: 'Перейти к аналитике' });

    await expect(addTransactionButton).toBeVisible();
    await expect(createBudgetButton).toBeVisible();
    await expect(goToAnalyticsButton).toBeVisible();

    // Проверка переходов
    await addTransactionButton.click();
    await expect(authedPage).toHaveURL('/transaction');
    await authedPage.goBack();

    await createBudgetButton.click();
    await expect(authedPage).toHaveURL('/budget');
    await authedPage.goBack();

    await goToAnalyticsButton.click();
    await expect(authedPage).toHaveURL('/analytics');
  });

  test('проверка отображения и взаимодействия с финансовыми целями', async ({ authedPage }) => {
    const addGoalButton = authedPage.locator('button[title="Добавить цель"]');
    await expect(addGoalButton).toBeVisible();
  
    // Проверка, что модальное окно откроется после клика
    await addGoalButton.click();
  
    // Ожидаем появления модального окна
    const modal = authedPage.locator('.w-full.max-w-md.rounded-xl.bg-white.p-6.shadow-xl');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
  
    // Проверяем, что поля внутри модального окна видимы
    const goalNameInput = modal.locator('input[placeholder="Введите название цели"]');
    await expect(goalNameInput).toBeVisible();
    await goalNameInput.fill('Новая цель');
    
    const targetAmountInput = modal.locator('input[placeholder="Введите сумму"]');
    await expect(targetAmountInput).toBeVisible();
    await targetAmountInput.fill('10000');
  
    const targetDateInput = modal.locator('input[type="date"]');
    await expect(targetDateInput).toBeVisible();
    
    await targetDateInput.fill('2025-12-31');
  
    const submitButton = modal.locator('button[type="button"]:has-text("Добавить")');
    await submitButton.click();
  
    // Проверка, что цель была добавлена
    const newGoal = authedPage.locator('text=Новая цель');
    await expect(newGoal).toBeVisible();
  });
  
  

  test('проверка модальных окон для редактирования цели', async ({ authedPage }) => {
    // Кликаем по существующей цели для редактирования
    const existingGoal = authedPage.locator('text=Новая цель');
    await existingGoal.click();
  
    // Ожидаем, что откроется модальное окно редактирования
    const editGoalModal = authedPage.locator('h2', { hasText: 'Редактировать цель' });
    await expect(editGoalModal).toBeVisible();
  
    // Проверка полей редактирования
    const nameInput = authedPage.locator('input[value="Новая цель"]'); // Поле "Название цели" по значению
    await expect(nameInput).toHaveValue('Новая цель');
    
    const targetAmountInput = authedPage.locator('input[value="10000"]'); // Поле "Целевая сумма" по значению
    await expect(targetAmountInput).toHaveValue('10000');
  
    const targetDateInput = authedPage.locator('input[value="2025-12-31"]'); // Поле "Дата достижения" по значению
    await expect(targetDateInput).toHaveValue('2025-12-31');

  
    // Меняем данные цели и сохраняем
    await nameInput.fill('Измененная цель');
    await targetAmountInput.fill('15000');
    await targetDateInput.fill('2025-12-31');

    await editGoalModal.click();
  
    const saveButton = authedPage.locator('button[type="submit"]:has-text("Сохранить")'); // Кнопка "Сохранить"
    await saveButton.click();
  
    // Проверка, что цель обновилась
    const updatedGoal = authedPage.locator('text=Измененная цель');
    await expect(updatedGoal).toBeVisible();
  });
  
});
