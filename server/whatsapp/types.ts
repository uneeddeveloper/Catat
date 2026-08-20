import type { chats, chatUsers } from '../db/schema'

export type WaChat = typeof chats.$inferSelect
export type WaChatUser = typeof chatUsers.$inferSelect

export interface WaContext {
  target: string
  chat: WaChat
  user: WaChatUser
  senderName: string
}
