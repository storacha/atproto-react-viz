import { RepoEntry } from "@atcute/car";
import AtpAgent, { AtpSessionData } from "@atproto/api";
import { Post } from "../utils/types";
import { formatDate } from "../utils/ui";
import { useRepo } from "../hooks/get-repo";

export interface PostVisualizerProps {
  did?: string;
  loading: boolean;
  posts: RepoEntry[];
  className?: string;
  session?: AtpSessionData;
}

/**
 * PostVisualizer - A component to display AT Protocol posts
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
export const PostVisualizer = ({ posts, session, loading, className = "" }: PostVisualizerProps) => {
  if (posts.length === 0 && !loading) return <p className="atp-no-data-message">No posts found</p>;

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = (a.record as { createdAt: string })?.createdAt || "";
    const dateB = (b.record as { createdAt: string })?.createdAt || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <>
      {sortedPosts.map(post => {
        try {
          const record = post.record as Post;
          const handle = session?.handle || "";
          const displayName = handle.split('.')[0];
          const formattedDate = record.createdAt ? formatDate(record.createdAt) : "Unknown date";

          return (
            <div key={post.rkey} className={`atp-post-card ${className}`}>
              <div className="atp-post-header">
                <span className="atp-post-author">{displayName}</span>
                <span className="atp-post-handle">@{handle}</span>
                <span className="atp-post-date">{formattedDate}</span>
              </div>
              <div className="atp-post-content">
                {record.text}
              </div>
            </div>
          );
        } catch (error) {
          return <div className="atp-post-error">Error rendering post: {`${(error as Error).message}`}</div>;
        }
      })}
    </>
  );
};

export interface PostProps extends Pick<PostVisualizerProps, "did" | "className"> {
  agent: AtpAgent
}

export const Posts = ({ did, agent, className }: PostProps) => {
  const identifier = did || ""
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
