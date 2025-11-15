export default defineNuxtPlugin(() => {
  // Initialize socket store on client side
  const socketStore = useSocketStore()
  
  // Connect socket when plugin loads
  socketStore.connect()
  
  console.log('[Plugin] Socket initialized')
})

