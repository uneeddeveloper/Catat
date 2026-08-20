import { mysqlTable, varchar, int, decimal, boolean, json, timestamp, mysqlEnum, index, unique } from 'drizzle-orm/mysql-core'

export const admins = mysqlTable('admins', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 190 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  businessId: int('business_id').references(() => businesses.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const businesses = mysqlTable('businesses', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const chats = mysqlTable('chats', {
  id: int('id').autoincrement().primaryKey(),
  platform: mysqlEnum('platform', ['telegram', 'whatsapp']).notNull(),
  externalChatId: varchar('external_chat_id', { length: 64 }).notNull(),
  type: mysqlEnum('type', ['private', 'group', 'supergroup']).notNull(),
  title: varchar('title', { length: 255 }),
  businessId: int('business_id').references(() => businesses.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => ({
  platformChatUnique: unique('chats_platform_external_unique').on(table.platform, table.externalChatId)
}))

export const chatUsers = mysqlTable('chat_users', {
  id: int('id').autoincrement().primaryKey(),
  platform: mysqlEnum('platform', ['telegram', 'whatsapp']).notNull(),
  externalUserId: varchar('external_user_id', { length: 64 }).notNull(),
  username: varchar('username', { length: 190 }),
  firstName: varchar('first_name', { length: 190 }),
  lastName: varchar('last_name', { length: 190 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => ({
  platformUserUnique: unique('chat_users_platform_external_unique').on(table.platform, table.externalUserId)
}))

export const categories = mysqlTable('categories', {
  id: int('id').autoincrement().primaryKey(),
  businessId: int('business_id').references(() => businesses.id),
  name: varchar('name', { length: 80 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => ({
  businessNameUnique: unique('categories_business_name_unique').on(table.businessId, table.name)
}))

export const transactions = mysqlTable('transactions', {
  id: int('id').autoincrement().primaryKey(),
  chatId: int('chat_id').notNull().references(() => chats.id),
  senderId: int('sender_id').notNull().references(() => chatUsers.id),
  categoryId: int('category_id').references(() => categories.id),
  type: mysqlEnum('type', ['expense', 'income']).default('expense').notNull(),
  amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 8 }).default('IDR').notNull(),
  merchant: varchar('merchant', { length: 255 }),
  description: varchar('description', { length: 500 }),
  expenseDate: timestamp('expense_date').notNull(),
  receiptImageUrl: varchar('receipt_image_url', { length: 500 }),
  source: mysqlEnum('source', ['text', 'photo']).notNull(),
  rawLlmResponse: json('raw_llm_response'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, table => ({
  chatIdx: index('transactions_chat_idx').on(table.chatId),
  dateIdx: index('transactions_date_idx').on(table.expenseDate)
}))
