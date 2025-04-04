import { RepoEntry } from "@atcute/car";
import { AtpSessionData } from "@atproto/api";
import { Post } from "../utils/types";
import { formatDate } from "../utils/ui";

interface PostVisualizerProps {
  posts: RepoEntry[];
  session?: AtpSessionData;
}

export const PostVisualizer = ({ posts, session }: PostVisualizerProps) => {
  if (posts.length === 0) return <p className="no-data-message">No posts found</p>;

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = (a.record as { createdAt: string })?.createdAt || "";
    const dateB = (b.record as { createdAt: string })?.createdAt || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="posts-container">
      {sortedPosts.map(post => {
        try {
          const record = post.record as Post;
          const handle = session?.handle || "";
          const displayName = handle.split('.')[0];
          const formattedDate = record.createdAt ? formatDate(record.createdAt) : "Unknown date";

          return (
            <div key={post.rkey} className="post-card">
              <div className="post-header">
                <span className="post-author">{displayName}</span>
                <span className="post-handle">@{handle}</span>
                <span className="post-date">{formattedDate}</span>
              </div>
              <div className="post-content">
                {record.text}
              </div>
            </div>
          );
        } catch (error) {
          return <div className="post-error">Error rendering post: {`${(error as Error).message}`}</div>;
        }
      })}
    </div>
  );
};
