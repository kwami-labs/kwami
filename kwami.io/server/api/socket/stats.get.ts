import { getConnectedUsers, getUserSessions } from '../../plugins/socket'

export default defineEventHandler((event) => {
  return {
    connectedUsers: getConnectedUsers(),
    sessions: getUserSessions(),
    timestamp: Date.now(),
  }
})

