import { getFonnteDeviceInfo } from '../../../whatsapp/fonnteClient'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  return getFonnteDeviceInfo()
})
