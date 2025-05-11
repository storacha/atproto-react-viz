import { ChangeEvent, useEffect, useState } from 'react'
import AtpAgent from '@atproto/api'
import { BlueSkySessionData } from './utils/types'
import { LikedPosts, Posts } from './components/Posts'
import { useRepo } from './hooks/get-repo'
import { PostWithEmbed } from './components/Embeds'
import { useBlobs } from './hooks/get-blobs'
import { BlobsVisualizer } from './components/BlobsVisualizer'
import { PreferenceVisualizer } from './components/PreferenceVisualizer'

export interface VisualizerProps {
  session?: BlueSkySessionData
  agent?: AtpAgent
}

const Visualizer = ({ session, agent }: VisualizerProps) => {
  const [activeView, setActiveView] = useState<string>('posts')
  const did: string = session?.did || ''
  const {
    repo,
    getRepo,
    loading: repoLoading,
  } = useRepo({ did, agent: agent as AtpAgent })
  const {
    blobs,
    loading: blobsLoading,
    refreshBlobs,
  } = useBlobs({
    agent: agent as AtpAgent,
    did: did,
  })

  const embedsCount = repo?.embeds ? (
    (repo.embeds.external?.length || 0) +
    (repo.embeds.withImages?.length || 0) +
    (repo.embeds.withQuotes?.length || 0)
  ) : 0

  useEffect(() => {
    if (session && !repo) {
      getRepo(did)
      setActiveView('posts')
    }
  }, [session])

  const handleRefresh = () => {
    if (activeView === 'blobs') {
      refreshBlobs()
    } else {
      getRepo(did)
    }
  }

  if (!session) {
    return (
      <div className="visualizer">
        <h2>Please log in to see your data visualization</h2>
      </div>
    )
  }

  return (
    <div className="visualizer">
      <div className="viz-controls">
        <div className="viz-tabs">
          <button
            onClick={() => setActiveView('posts')}
            className={activeView === 'posts' ? 'active' : ''}
          >
            Posts ({repo?.posts?.length || 0})
          </button>
          <button
            onClick={() => setActiveView('embeds')}
            className={activeView === 'embeds' ? 'active' : ''}
          >
            Embeds ({embedsCount})
          </button>
          <button
            onClick={() => setActiveView('likes')}
            className={activeView === 'likes' ? 'active' : ''}
          >
            Likes ({repo?.likes?.length || 0})
          </button>
          <button
            onClick={() => setActiveView('follows')}
            className={activeView === 'follows' ? 'active' : ''}
          >
            Follows ({repo?.follows?.length || 0})
          </button>
          <button
            onClick={() => setActiveView('blobs')}
            className={activeView === 'blobs' ? 'active' : ''}
          >
            Blobs ({blobs?.length || 0})
          </button>
          <button
            onClick={() => setActiveView('preferences')}
            className={activeView === 'preferences' ? 'active' : ''}
          >
            Preferences
          </button>
        </div>
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh Data
        </button>
      </div>

      {repoLoading && activeView !== 'blobs' && activeView !== 'preferences' && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your data...</p>
        </div>
      )}

      {!repoLoading && activeView === 'posts' && (
        <div className="posts-container">
          <Posts agent={agent as AtpAgent} did={session.did} />
        </div>
      )}

      {!repoLoading && activeView === 'embeds' && (
        <div className="posts-container">
          <PostWithEmbed agent={agent as AtpAgent} did={session.did} />
        </div>
      )}

      {!repoLoading && activeView === 'likes' && (
        <div className="posts-container">
          <LikedPosts agent={agent as AtpAgent} />
        </div>
      )}

      {!repoLoading && activeView === 'follows' && (
        <div className="follows-container">
          <p>Follows visualization will go here</p>
        </div>
      )}

      {activeView === 'blobs' && (
        <div className="blobs-container">
          <BlobsVisualizer blobs={blobs} loading={blobsLoading} />
        </div>
      )}

      {activeView === 'preferences' && (
        <div className="preferences-container">
          <PreferenceVisualizer agent={agent as AtpAgent} />
        </div>
      )}
    </div>
  )
}

function App() {
  const [handle, setHandle] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [appSession, setAppSession] = useState<BlueSkySessionData>()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [agent, setAgent] = useState<AtpAgent>()

  useEffect(() => {
    const newAgent = new AtpAgent({
      service: 'https://bsky.social',
    })
    setAgent(newAgent)
  }, [])

  const login = async () => {
    if (!handle || !password) {
      setError('Please enter both handle and password')
      return
    }

    if (!agent) {
      setError('Agent is not initialized')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const result = await agent.login({
        identifier: handle,
        password,
      })
      setAppSession(result.data as BlueSkySessionData)
    } catch (err) {
      console.error('Login error:', err)
      setError(
        `Login failed: ${err instanceof Error ? err.message : String(err)}`
      )
    } finally {
      setIsLoading(false)
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
          ) : (
            <div className="input-group">
              <input
                type="text"
                placeholder="Bluesky handle. e.g. kaf.bsky.social"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setHandle(e.target.value)
                }}
                value={handle}
                className="handle-input"
              />
              <input
                type="password"
                placeholder="Password"
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
          <Visualizer session={appSession} agent={agent} />
        </div>
      </div>
    </div>
  )
}

export default App
