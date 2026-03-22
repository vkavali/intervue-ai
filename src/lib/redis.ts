import { Redis } from '@upstash/redis'

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  return new Redis({ url, token })
}

// Singleton — null when env vars not set (graceful fallback)
export const redis = createRedisClient()
