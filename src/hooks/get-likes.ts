import { useCallback, useEffect, useState } from 'react'
import { RepoParams } from './get-repo'
import { State } from '../utils/types'
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'

export interface LikeParams extends Pick<RepoParams, 'agent'> {
  handle: string
}

export const useLikes = ({ agent, handle }: LikeParams) => {
  const [likedReccords, setLikedRecords] = useState<FeedViewPost[]>()
  const [state, setState] = useState<State>('idle')

  const getLikes = useCallback(
    async (actor: string) => {
      try {
        setState('loading')
        const response = await agent.app.bsky.feed.getActorLikes({
          actor,
        })
        const feed = response.data.feed
        setLikedRecords(feed)
      } catch (error) {
        console.error(error)
      }
    },
    [agent.app.bsky.feed]
  )

  useEffect(() => {
    getLikes(handle)
  }, [getLikes, handle])

  useEffect(() => {
    if (!likedReccords) getLikes(handle)
  }, [handle, likedReccords, getLikes])

  return {
    loading: state === 'loading',
    likedPosts: likedReccords,
  }
}
