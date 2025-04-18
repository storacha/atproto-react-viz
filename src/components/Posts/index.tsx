import { RepoEntry } from '@atcute/car'
import AtpAgent, { AtpSessionData } from '@atproto/api'
import { Post } from '../../utils/types'
import { formatDate } from '../../utils/ui'
import { useRepo } from '../../hooks/get-repo'
import { useLikes } from '../../hooks/get-likes'
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { PostEmbed } from '../Embeds'

export interface PostVisualizerProps {
  did?: string
  loading: boolean
  posts: RepoEntry[] | FeedViewPost[]
  className?: string
  session?: AtpSessionData
}

/**
 * PostVisualizer - A component to display AT Protocol posts.
 * Use this component if you want to supply your own Posts
 * If not, use the standalone `<Posts />` component. It doesn't require a `posts` prop
 *
 * Each element has a predictable class name for styling which you can alter as you please
 * when you pass your own className
 * - atp-post-card: Individual post container
 * - atp-post-header: Header section of a post
 * - atp-post-author: Author's display name
 * - atp-post-handle: Author's handle
 * - atp-post-date: Post date
 * - atp-post-content: Post content
 * - atp-no-data-message: Empty state message
 * - atp-post-error: Error message container
 */
export const PostVisualizer = ({
  posts,
  session,
  loading,
  className = '',
}: PostVisualizerProps) => {
  if (posts.length === 0 && !loading)
    return <p className="atp-no-data-message">No posts found</p>

  const sortedPosts = [...posts].sort((a, b) => {
    const getCreatedAt = (post: FeedViewPost | RepoEntry) => {
      if ('post' in post && post.post?.record?.createdAt) {
        return post.post.record.createdAt
      } else if ('record' in post && (post.record as Post)?.createdAt) {
        return (post.record as Post).createdAt
      }
      return ''
    }

    const dateA = getCreatedAt(a)
    const dateB = getCreatedAt(b)

    return new Date(String(dateB)).getTime() - new Date(String(dateA)).getTime()
  })

  return (
    <>
      {sortedPosts.map((post, index) => {
        try {
          let record: Post
          let author = { displayName: '', handle: '' }

          if ('post' in post) {
            const feedViewPost = post as FeedViewPost
            record = {
              text: feedViewPost.post.record.text as string,
              createdAt: feedViewPost.post.record.createdAt as string,
              $type: feedViewPost.post.record.$type as string,
              embed: feedViewPost.post.embed as Post['embed'],
            }
            author = {
              displayName:
                feedViewPost.post.author.displayName ||
                feedViewPost.post.author.handle,
              handle: feedViewPost.post.author.handle,
            }
          } else {
            record = post.record as Post
            author = {
              displayName: session?.handle?.split('.')[0] || '',
              handle: session?.handle || '',
            }
          }

          const formattedDate = record.createdAt
            ? formatDate(record.createdAt)
            : 'Unknown date'

          return (
            <div
              key={`post-${index}-${record.createdAt || crypto.randomUUID()}`}
              className={`atp-post-card ${className}`}
            >
              <div className="atp-post-header">
                <span className="atp-post-author">{author.displayName}</span>
                <span className="atp-post-handle">@{author.handle}</span>
                <span className="atp-post-date">{formattedDate}</span>
              </div>
              <div className="atp-post-content">{record.text}</div>
            </div>
          )
        } catch (error) {
          return (
            <div key={`error-${index}`} className="atp-post-error">
              Error rendering post: {`${(error as Error).message}`}
            </div>
          )
        }
      })}
    </>
  )
}

export interface PostProps
  extends Pick<PostVisualizerProps, 'did' | 'className'> {
  agent: AtpAgent
}

export const Posts = ({ did, agent, className }: PostProps) => {
  const identifier = did || ''
  const { repo, loading } = useRepo({ did: identifier, agent })
  return (
    <PostVisualizer
      posts={repo.posts}
      className={className}
      session={agent.session}
      loading={loading}
    />
  )
}

export const LikedPosts = ({ agent, className }: PostProps) => {
  const handle: string = agent.session?.handle || ''
  const { likedPosts, loading } = useLikes({ agent, handle })
  const postsWithoutEmbeds = likedPosts?.filter((post) => !post.post?.embed)
  const postsWithEmbeds = likedPosts?.filter((post) => post.post.embed)

  return (
    <>
      <PostVisualizer
        posts={postsWithoutEmbeds || []}
        loading={loading}
        className={className}
        session={agent.session}
      />
      {likedPosts?.some((post) => post.post.embed) && (
        <PostEmbed
          agent={agent}
          posts={postsWithEmbeds || []}
          className={className || ""}
        />
      )}
    </>
  )
}
