-- Drop unused tables (all confirmed empty; feature was never wired into the app)

-- DropForeignKey
ALTER TABLE "AiSuggestion" DROP CONSTRAINT "AiSuggestion_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationSummary" DROP CONSTRAINT "ConversationSummary_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ReflectionPrompt" DROP CONSTRAINT "ReflectionPrompt_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "CheckInReminder" DROP CONSTRAINT "CheckInReminder_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "CheckInReminder" DROP CONSTRAINT "CheckInReminder_recipientId_fkey";

-- DropTable
DROP TABLE "AiSuggestion";

-- DropTable
DROP TABLE "ConversationSummary";

-- DropTable
DROP TABLE "ActionItem";

-- DropTable
DROP TABLE "ReflectionPrompt";

-- DropTable
DROP TABLE "CheckInReminder";

-- DropEnum
DROP TYPE "SuggestionType";

-- DropEnum
DROP TYPE "ActionItemStatus";

-- DropEnum
DROP TYPE "ReminderStatus";

-- DropEnum
DROP TYPE "ReminderType";
