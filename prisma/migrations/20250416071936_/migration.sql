-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetUser" (
    "userId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,

    CONSTRAINT "BudgetUser_pkey" PRIMARY KEY ("userId","budgetId")
);

-- AddForeignKey
ALTER TABLE "BudgetUser" ADD CONSTRAINT "BudgetUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetUser" ADD CONSTRAINT "BudgetUser_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
