import { useQuotedPost, useRepo } from '../../hooks/get-repo'
import { PostProps, PostVisualizerProps } from '../Posts'
import './embeds.css'
import '../../index.css'
import { formatDate } from '../../utils/ui'
import React, { useEffect, useState } from 'react'
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { ExtendedRepoEntry, ImageEmbeds, Post } from '../../utils/types'
import AtpAgent from '@atproto/api'

export interface PostWithEmbedProps extends PostProps {
  posts?: Pick<PostVisualizerProps, 'posts'>
}

/**
 * A component to visualize posts or records on Bluesky with embeds
 */
export const PostWithEmbed = ({
  agent,
  did,
  className,
}: PostWithEmbedProps) => {
  const identifier = did || ''
  const { repo } = useRepo({ agent, did: identifier })
  const { quotedContent, postsWithEmbeds } = useQuotedPost({
    posts: repo.posts,
    agent,
  })

  if (postsWithEmbeds.length === 0) {
    return <div className="no-embeds">No posts with embeds found</div>
  }

  return (
    <>
      {postsWithEmbeds.map((post, index: React.Key) => {
        if (!post.record) return null

        const record = post.record
        const handle = agent.session?.handle || ''
        const displayName = handle.split('.')[0]

        const quotedPost =
          record.embed?.$type === 'app.bsky.embed.record' &&
          record.embed.record.uri
            ? quotedContent[record.embed.record.uri]
            : null

        return (
          <div key={index} className={`atp-post-card ${className || ''}`}>
            <div className="atp-post-header">
              <span className="atp-post-author">{displayName}</span>
              <span className="atp-post-handle">@{handle}</span>
              <span className="atp-post-date">
                {formatDate(record.createdAt)}
              </span>
            </div>
            <div className="atp-post-content">{record.text}</div>

            {record.embed &&
              record.embed.$type === 'app.bsky.embed.external' && (
                <div className="atp-embed atp-embed-external">
                  {record.embed.external.thumb && (
                    <div className="atp-embed-thumbnail">
                      <img
                        src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${identifier}&cid=${record.embed.external.thumb.ref.$link}`}
                        alt={record.embed.external.title}
                      />
                    </div>
                  )}
                  <div className="atp-embed-content">
                    <div className="atp-embed-title">
                      {record.embed.external.title}
                    </div>
                    <div className="atp-embed-description">
                      {record.embed.external.description}
                    </div>
                    <div className="atp-embed-link">
                      {new URL(record.embed.external.uri).hostname}
                    </div>
                  </div>
                </div>
              )}

            {record.embed && record.embed.$type === 'app.bsky.embed.images' && (
              <div className="atp-embed atp-embed-images">
                <div className="atp-embed-images-container">
                  {record.embed.images.map((image, index) => (
                    <div key={index} className="atp-embed-image">
                      <img
                        src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${identifier}&cid=${image.image.ref.$link}`}
                        alt={image.alt || 'Embedded image'}
                      />
                      {image.alt && (
                        <div className="atp-embed-image-alt">{image.alt}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {record.embed && record.embed.$type === 'app.bsky.embed.record' && (
              <div className="atp-embed atp-embed-record">
                <div className="atp-embed-quote">
                  {quotedPost ? (
                    <div className="atp-embed-quote-content">
                      <div className="atp-post-header">
                        <span className="atp-post-author">
                          {quotedPost.author.displayName ||
                            quotedPost.author.handle}
                        </span>
                        <span className="atp-post-handle">
                          @{quotedPost.author.handle}
                        </span>
                      </div>
                      <div className="atp-post-content">
                        {quotedPost.record.text as string}
                      </div>
                    </div>
                  ) : (
                    <div className="atp-embed-quote-loading">
                      Loading quoted post...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

/**
 * A component to visualize posts or records on Bluesky with embeds in them
 * use this component if you want to supply your own posts via props.
 * This is very useful if you want to render specific posts containing embeds.
 * An example is when you want to render liked posts via `app.bsky.feed.getActorLikes`
 */
export const PostEmbed = ({
  posts,
  agent,
  className,
}: {
  agent: AtpAgent
  className: string
  posts: ExtendedRepoEntry[] | FeedViewPost[]
}) => {
  const [processedPosts, setProcessedPosts] = useState<ExtendedRepoEntry[]>([])

  useEffect(() => {
    if (posts.length === 0) return

    const convertedPosts = posts.map((post) => {
      if ('post' in post) {
        const feedViewPost = post as FeedViewPost
        return {
          uri: feedViewPost.post.uri,
          cid: feedViewPost.post.cid,
          rkey: feedViewPost.post.uri.split('/').pop() || '',
          record: feedViewPost.post.record as Post,
          author: {
            handle: feedViewPost.post.author.handle,
            displayName:
              feedViewPost.post.author.displayName ||
              feedViewPost.post.author.handle,
          },
        } as unknown as ExtendedRepoEntry
      }
      return post as ExtendedRepoEntry
    })

    setProcessedPosts(convertedPosts)
  }, [posts])

  const { quotedContent } = useQuotedPost({
    posts: processedPosts,
    agent,
  })

  const identifier = agent.session?.did || ''

  if (processedPosts.length === 0) {
    return <div className="no-embeds">Processing posts...</div>
  }

  return (
    <>
      {processedPosts.map((post, index: React.Key) => {
        if (!post.record) return null

        const record = post.record
        const displayName = record.author?.displayName
        const handle = record.author?.handle

        const quotedPost =
          record.embed?.$type === 'app.bsky.embed.record' &&
          record.embed.record.uri
            ? quotedContent[record.embed.record.uri]
            : null

        return (
          <div key={index} className={`atp-post-card ${className}`}>
            <div className="atp-post-header">
              <span className="atp-post-author">{displayName}</span>
              <span className="atp-post-handle">@{handle}</span>
              <span className="atp-post-date">
                {formatDate(record.createdAt)}
              </span>
            </div>
            <div className="atp-post-content">{record.text}</div>

            {record.embed &&
              record.embed.$type === 'app.bsky.embed.external' && (
                <div className="atp-embed atp-embed-external">
                  {record.embed.external.thumb && (
                    <div className="atp-embed-thumbnail">
                      <img
                        src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${identifier}&cid=${record.embed.external.thumb.ref.$link}`}
                        alt={record.embed.external.title}
                      />
                    </div>
                  )}
                  <div className="atp-embed-content">
                    <div className="atp-embed-title">
                      {record.embed.external.title}
                    </div>
                    <div className="atp-embed-description">
                      {record.embed.external.description}
                    </div>
                    <div className="atp-embed-link">
                      {new URL(record.embed.external.uri).hostname}
                    </div>
                  </div>
                </div>
              )}

            {record.embed && record.embed.$type === 'app.bsky.embed.images' && (
              <div className="atp-embed atp-embed-images">
                <div className="atp-embed-images-container">
                  {record.embed.images.map(
                    (
                      image: ImageEmbeds['images'][0],
                      imageIndex: React.Key
                    ) => (
                      <div key={imageIndex} className="atp-embed-image">
                        <img
                          src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${identifier}&cid=${image.image.ref.$link}`}
                          alt={image.alt || 'Embedded image'}
                        />
                        {image.alt && (
                          <div className="atp-embed-image-alt">{image.alt}</div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {record.embed && record.embed.$type === 'app.bsky.embed.record' && (
              <div className="atp-embed atp-embed-record">
                <div className="atp-embed-quote">
                  {quotedPost ? (
                    <div className="atp-embed-quote-content">
                      <div className="atp-post-header">
                        <span className="atp-post-author">
                          {quotedPost.author.displayName ||
                            quotedPost.author.handle}
                        </span>
                        <span className="atp-post-handle">
                          @{quotedPost.author.handle}
                        </span>
                      </div>
                      <div className="atp-post-content">
                        {quotedPost.record.text as string}
                      </div>
                    </div>
                  ) : (
                    <div className="atp-embed-quote-loading">
                      Loading quoted post...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
