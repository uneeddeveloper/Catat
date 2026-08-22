import { buildDatabaseBackup, backupFilename } from '../../../backup/buildDatabaseBackup'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const backup = await buildDatabaseBackup()
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Content-Disposition', `attachment; filename="${backupFilename()}"`)
  return backup
})
