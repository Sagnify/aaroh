-- AlterTable
ALTER TABLE "CustomSongOrder" ADD COLUMN     "previousRazorpayOrderId" TEXT,
ADD COLUMN     "repaymentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "adminResetCount" INTEGER NOT NULL DEFAULT 0;