import { getConnectedUsers, getUserSessions } from '~/server/plugins/socket'

export default defineEventHandler((event) => {
  return {
    connectedUsers: getConnectedUsers(),
    sessions: getUserSessions(),
    timestamp: Date.now(),
  }
})

