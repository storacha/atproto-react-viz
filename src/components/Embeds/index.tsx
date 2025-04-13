import { useRepo } from "../../hooks/get-repo";
import { PostProps } from "../PostsVisualizer";
import "./embeds.css";
import "../../index.css";
import { formatDate } from "../../utils/ui";
import { useCallback, useEffect, useState } from "react";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

type PostWithEmbedProps = PostProps;

export const PostWithEmbed = ({
  agent,
  did,
  className,
}: PostWithEmbedProps) => {
  const identifier = did || "";
  const { repo } = useRepo({ agent, did: identifier });
  const [quotedContentMap, setQuotedContentMap] = useState<Record<string, PostView>>({});

  const quotedPostUris = repo.posts
    .filter(post => post.record.embed?.$type === "app.bsky.embed.record")
    // @ts-expect-error there should be a relationship with PostView and Post in utils/types.ts
    // i'll address this later
    .map(post => post?.record?.embed?.record.uri);

  const getQuotedContent = useCallback(
    async (uris: string[]) => {
      if (uris.length === 0) return;

      try {
        const res = await agent.api.app.bsky.feed.getPosts({ uris });

        const newQuotedContent = {...quotedContentMap};
        res.data.posts.forEach(post => {
          newQuotedContent[post.uri] = post;
        });

        setQuotedContentMap(newQuotedContent);
      } catch (error) {
        console.error("Error fetching quoted posts:", error);
      }
    },
    [agent.api.app.bsky.feed, quotedContentMap]
  );

  useEffect(() => {
    const urisToFetch = quotedPostUris.filter(uri => !quotedContentMap[uri]);
    if (urisToFetch.length > 0) {
      getQuotedContent(urisToFetch);
    }
  }, [quotedPostUris, getQuotedContent, quotedContentMap]);

  return (
    <>
      {repo.posts.map((post) => {
        const record = post.record;
        const handle = agent.session?.handle || "";
        const displayName = handle.split(".")[0];

        const quotedPost = record.embed?.$type === "app.bsky.embed.record"
          ? quotedContentMap[record.embed.record.uri]
          : null;

        return (
          <div key={post.rkey} className={`atp-post-card ${className}`}>
            <div className="atp-post-header">
              <span className="atp-post-author">{displayName}</span>
              <span className="atp-post-handle">@{handle}</span>
              <span className="atp-post-date">
                {formatDate(record.createdAt)}
              </span>
            </div>
            <div className="atp-post-content">{record.text}</div>

            {record.embed &&
              record.embed.$type === "app.bsky.embed.external" && (
                <div className="atp-embed">
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

            {record.embed && record.embed.$type === "app.bsky.embed.images" && (
              <div className="atp-embed">
                <div className="atp-embed-images">
                  {record.embed.images.map((image, index) => (
                    <div key={index} className="atp-embed-image">
                      <img
                        src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${identifier}&cid=${image.image.ref.$link}`}
                        alt={image.alt || "Embedded image"}
                      />
                      {image.alt && (
                        <div className="atp-embed-image-alt">{image.alt}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {record.embed && record.embed.$type === "app.bsky.embed.record" && (
              <div className="atp-embed">
                <div className="atp-embed-quote">
                  {quotedPost && (
                    <div className="atp-embed-quote-content">
                      <div key={quotedPost.cid}>
                        <div className="atp-post-header">
                          <span className="atp-post-author">
                            {quotedPost.author.displayName}
                          </span>
                          <span className="atp-post-handle">
                            @{quotedPost.author.handle}
                          </span>
                        </div>
                        <div className="atp-post-content">
                          {quotedPost.record.text as string}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
