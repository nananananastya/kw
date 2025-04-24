-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MEMBER');

-- AlterTable
ALTER TABLE "BudgetUser" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';
