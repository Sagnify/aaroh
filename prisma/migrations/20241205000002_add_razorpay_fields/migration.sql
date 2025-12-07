-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "razorpayOrderId" TEXT;
ALTER TABLE "Purchase" ADD COLUMN "razorpayPaymentId" TEXT;
ALTER TABLE "Purchase" ADD COLUMN "razorpaySignature" TEXT;
ALTER TABLE "Purchase" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Purchase" ALTER COLUMN "status" SET DEFAULT 'pending';