<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Activity</h1>
      <p class="text-gray-400">Recent marketplace transactions</p>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center space-x-2 mb-6 overflow-x-auto scrollbar-hide">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="btn whitespace-nowrap"
        :class="activeTab === tab.value ? 'btn-primary' : 'btn-outline'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading activity..." />

    <!-- Empty State -->
    <div v-else-if="filteredActivity.length === 0" class="card text-center py-16">
      <div class="text-6xl mb-4">📊</div>
      <h2 class="text-2xl font-bold mb-2">No Activity Yet</h2>
      <p class="text-gray-400 mb-6">
        {{ activeTab === 'all' 
          ? 'No transactions have been recorded yet' 
          : `No ${activeTab} transactions found` 
        }}
      </p>
      <RouterLink to="/" class="btn btn-primary">
        Explore Marketplace
      </RouterLink>
    </div>

    <!-- Activity Table -->
    <div v-else class="card overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Item</th>
            <th>Price</th>
            <th>From</th>
            <th>To</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="activity in filteredActivity"
            :key="activity.id"
            class="cursor-pointer hover:bg-gray-800/50"
            @click="navigateToNft(activity.mint)"
          >
            <td>
              <div class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  :class="getEventColor(activity.type)"
                >
                  {{ getEventIcon(activity.type) }}
                </div>
                <span class="font-medium">{{ activity.type }}</span>
              </div>
            </td>
            <td>
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-900">
                  <img
                    v-if="activity.image"
                    :src="activity.image"
                    :alt="activity.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-xl">👻</span>
                  </div>
                </div>
                <div>
                  <p class="font-medium">{{ activity.name }}</p>
                  <p class="text-sm text-gray-400">{{ activity.symbol }}</p>
                </div>
              </div>
            </td>
            <td>
              <div v-if="activity.price" class="flex items-center space-x-1">
                <svg class="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">{{ activity.price }}</span>
              </div>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td>
              <RouterLink
                :to="`/profile/${activity.from}`"
                @click.stop
                class="font-mono text-sm text-primary-400 hover:text-primary-300"
              >
                {{ shortAddress(activity.from) }}
              </RouterLink>
            </td>
            <td>
              <RouterLink
                v-if="activity.to"
                :to="`/profile/${activity.to}`"
                @click.stop
                class="font-mono text-sm text-primary-400 hover:text-primary-300"
              >
                {{ shortAddress(activity.to) }}
              </RouterLink>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="text-sm text-gray-400">
              {{ formatTime(activity.timestamp) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center mt-8">
      <button
        @click="loadMore"
        :disabled="loadingMore"
        class="btn btn-outline"
      >
        <span v-if="loadingMore" class="spinner mr-2"></span>
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Activity {
  id: string
  type: 'Sale' | 'List' | 'Unlist' | 'Transfer' | 'Mint'
  mint: string
  name: string
  symbol: string
  image: string
  price?: number
  from: string
  to?: string
  timestamp: number
}

const router = useRouter()

const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const activeTab = ref('all')

const tabs = [
  { label: 'All Activity', value: 'all' },
  { label: 'Sales', value: 'Sale' },
  { label: 'Listings', value: 'List' },
  { label: 'Transfers', value: 'Transfer' },
  { label: 'Mints', value: 'Mint' },
]

// Mock activity data - in production, fetch from blockchain or indexer
const activities = ref<Activity[]>([])

const filteredActivity = computed(() => {
  if (activeTab.value === 'all') return activities.value
  return activities.value.filter(a => a.type === activeTab.value)
})

const getEventIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Sale': '💰',
    'List': '📝',
    'Unlist': '❌',
    'Transfer': '🔄',
    'Mint': '✨',
  }
  return icons[type] || '📊'
}

const getEventColor = (type: string) => {
  const colors: Record<string, string> = {
    'Sale': 'bg-green-500/20 text-green-400',
    'List': 'bg-blue-500/20 text-blue-400',
    'Unlist': 'bg-red-500/20 text-red-400',
    'Transfer': 'bg-purple-500/20 text-purple-400',
    'Mint': 'bg-yellow-500/20 text-yellow-400',
  }
  return colors[type] || 'bg-gray-500/20 text-gray-400'
}

const shortAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const navigateToNft = (mint: string) => {
  router.push(`/nft/${mint}`)
}

const loadActivity = async () => {
  loading.value = true
  
  // Mock implementation - replace with actual blockchain query
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Generate mock data
  activities.value = []
  
  loading.value = false
}

const loadMore = async () => {
  loadingMore.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  loadingMore.value = false
}

onMounted(() => {
  loadActivity()
})

</script>
