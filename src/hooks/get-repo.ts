import { iterateAtpRepo } from '@atcute/car'
import AtpAgent from '@atproto/api'
import { useCallback, useEffect, useState } from 'react'
import { ExtendedRepoEntry, State } from '../utils/types'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'

export type RepoParams = {
  did: string
  agent: AtpAgent
}

export const useRepo = ({ did, agent }: RepoParams) => {
  const [repo, setRepo] = useState<Uint8Array>()
  const [parsedRepo, setParsedRepo] = useState<ExtendedRepoEntry[]>([])
  const [state, setState] = useState<State>('idle')

  const sortByCreatedAtDesc = (entries: ExtendedRepoEntry[]) => {
    return entries.sort((a, b) => {
      const dateA = new Date(a.record?.createdAt || 0)
      const dateB = new Date(b.record?.createdAt || 0)
      return dateB.getTime() - dateA.getTime()
    })
  }

  const posts = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.feed.post')
  )
  const likes = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.feed.like')
  )
  const follows = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.graph.follow')
  )
  const reposts = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.feed.repost')
  )
  const postsWithEmbeds = posts.filter(
    (post) => post.record && post.record.embed !== undefined
  )

  const externalEmbed = postsWithEmbeds.filter(
    (post) => post.record.embed?.$type === 'app.bsky.embed.external'
  )
  const imageEmbeds = postsWithEmbeds.filter(
    (post) => post.record.embed?.$type === 'app.bsky.embed.images'
  )
  const quoteEmbeds = postsWithEmbeds.filter(
    (post) => post.record.embed?.$type === 'app.bsky.embed.record'
  )

  useEffect(() => {
    if (repo) {
      try {
        setState('loading')
        const repoData = [...iterateAtpRepo(repo as Uint8Array)]
        setParsedRepo(repoData as ExtendedRepoEntry[])
      } catch (error) {
        console.error('Error parsing repo', error)
      } finally {
        setState('idle')
      }
    }
  }, [repo])

  const getRepo = useCallback(
    async (did: string) => {
      try {
        setState('loading')
        const data = await agent?.com.atproto.sync.getRepo({ did })
        setRepo(data?.data)
      } catch (error) {
        console.error('Error fetching repo:', error)
      } finally {
        setState('idle')
      }
    },
    [agent]
  )

  useEffect(() => {
    if (!repo) getRepo(did)
  }, [repo, did, getRepo])

  return {
    getRepo,
    repo: {
      posts: posts,
      likes: likes,
      follows: follows,
      reposts: reposts,
      embeds: {
        external: externalEmbed,
        withImages: imageEmbeds,
        withQuotes: quoteEmbeds,
      },
    },
    loading: state === 'loading',
  }
}

export const useQuotedPost = ({
  posts,
  agent,
}: {
  agent: AtpAgent
  posts: ExtendedRepoEntry[]
}) => {
  const [quotedContent, setQuotedContent] = useState<Record<string, PostView>>(
    {}
  )

  const postsWithEmbeds = posts.filter(
    (post) => post.record && post.record.embed !== undefined
  )

  const quotedPostUris = postsWithEmbeds
    .filter((post) => post.record.embed?.$type === 'app.bsky.embed.record')
    // @ts-expect-error there should be a relationship with PostView and Post in utils/types.ts
    // i'll address this later
    .map((post) => post?.record?.embed?.record.uri)

  const getQuotedContent = useCallback(
    async (uris: string[]) => {
      if (uris.length === 0) return

      try {
        const res = await agent.api.app.bsky.feed.getPosts({ uris })

        const newQuotedContent = { ...quotedContent }
        res.data.posts.forEach((post) => {
          newQuotedContent[post.uri] = post
        })

        setQuotedContent(newQuotedContent)
      } catch (error) {
        console.error('Error fetching quoted posts:', error)
      }
    },
    [agent.api.app.bsky.feed, quotedContent]
  )

  useEffect(() => {
    const urisToFetch = quotedPostUris.filter((uri) => !quotedContent[uri])
    if (urisToFetch.length > 0) {
      getQuotedContent(urisToFetch)
    }
  }, [quotedPostUris, getQuotedContent, quotedContent])

  return {
    quotedContent,
    postsWithEmbeds,
  }
}
