export default defineNuxtPlugin(() => {
  // Initialize socket connection on app start
  const { connect } = useSocket()
  
  // Connect immediately
  connect()
  
  console.log('[Plugin] Socket.IO client plugin initialized')
})

