import { getConnectedUsers, getUserSessions } from '../../middleware/socket'

export default defineEventHandler((event) => {
  return {
    connectedUsers: getConnectedUsers(),
    sessions: getUserSessions(),
    timestamp: Date.now(),
  }
})

