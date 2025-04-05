import { ChangeEvent, useEffect, useState } from 'react'
import AtpAgent from "@atproto/api"
import { BlueSkySessionData } from './utils/types'
import { iterateAtpRepo, RepoEntry } from "@atcute/car"
import { PostVisualizer } from './stories/PostsVisualizer';

interface VisualizerProps {
  session?: BlueSkySessionData;
  agent: AtpAgent
}

const Visualizer = ({ session, agent }: VisualizerProps) => {
  const [repo, setRepo] = useState<Uint8Array>();
  const [parsedRepo, setParsedRepo] = useState<RepoEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<string | null>(null);

  const posts = parsedRepo.filter((repo) => repo.collection === "app.bsky.feed.post");
  const likes = parsedRepo.filter((repo) => repo.collection === "app.bsky.feed.like");
  const follows = parsedRepo.filter((repo) => repo.collection === "app.bsky.graph.follow");
  // there's a repost collection too
  // const reposts = parsedRepo.filter((repo) => repo.collection === "app.bsky.feed.repost");

  useEffect(() => {
    if (repo) {
      setLoading(true);
      try {
        const repoData = [...iterateAtpRepo(repo as Uint8Array)];
        setParsedRepo(repoData);
      } catch (error) {
        console.error("Error parsing repo:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [repo]);

  useEffect(() => {
    if (session && !repo) {
      getRepo();
      setActiveView("posts");
    }
  }, [session]);

  if (!session) {
    return (
      <div className="visualizer">
        <h2>Please log in to see your data visualization</h2>
      </div>
    );
  }

  const did: string = session.did || "";

  const getRepo = async () => {
    setLoading(true);
    try {
      const data = await agent.com.atproto.sync.getRepo({ did });
      setRepo(data.data);
    } catch (error) {
      console.error("Error fetching repo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="visualizer">
      <div className="viz-controls">
        <div className="viz-tabs">
          <button
            onClick={() => setActiveView("posts")}
            className={activeView === "posts" ? "active" : ""}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveView("likes")}
            className={activeView === "likes" ? "active" : ""}
          >
            Likes ({likes.length})
          </button>
          <button
            onClick={() => setActiveView("follows")}
            className={activeView === "follows" ? "active" : ""}
          >
            Follows ({follows.length})
          </button>
        </div>
        <button className="refresh-button" onClick={getRepo}>
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your data...</p>
        </div>
      )}

      {!loading && activeView === "posts" && (
        <div className="posts-container">
          <PostVisualizer posts={posts} session={session} />
        </div>
      )}

      {!loading && activeView === "likes" && (
        <div className="likes-container">
          <p>I'll get to this soon</p>
        </div>
      )}

      {!loading && activeView === "follows" && (
        <div className="follows-container">
          <p>Follows</p>
        </div>
      )}
    </div>
  );
};

function App() {
  const [handle, setHandle] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [appSession, setAppSession] = useState<BlueSkySessionData>()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [agent, setAgent] = useState<AtpAgent>()

  useEffect(() => {
    const newAgent = new AtpAgent({
      service: "https://bsky.social"
    })
    setAgent(newAgent)
  }, [])

  const login = async () => {
    if (!handle || !password) {
      setError("Please enter both handle and password")
      return
    }

    if (!agent) {
      setError("Agent is not initialized")
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await agent.login({
        identifier: handle,
        password
      });
      setAppSession(result.data as BlueSkySessionData);
    } catch (err) {
      console.error("Login error:", err);
      setError(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container">
      <div className="content-container">
        <div className="auth-container">
          {appSession ? (
            <div className="user-info">
              <img
                alt="avatar"
                src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${appSession.handle}&backgroundColor=b6e3f4`}
              />
              <p>logged in as {appSession?.handle}</p>
            </div>
          ):
          (
            <div className="input-group">
              <input
                type="text"
                placeholder='Bluesky handle. e.g. kaf.bsky.social'
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setHandle(e.target.value)
                }}
                value={handle}
                className="handle-input"
              />
              <input
                type="password"
                placeholder='Password'
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value)
                }}
                value={password}
                className="password-input"
              />
              <button onClick={login} disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>
        <div className="repo-visualizer-container">
          <Visualizer session={appSession} agent={agent as AtpAgent} />
        </div>
      </div>
    </div>
  )
}

export default App
