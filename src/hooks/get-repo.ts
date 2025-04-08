import { iterateAtpRepo, RepoEntry } from "@atcute/car"
import AtpAgent from "@atproto/api"
import { useCallback, useEffect, useState } from "react"

export type State = "loading" | "idle"

export type RepoParams = {
  did: string;
  agent: AtpAgent
}

export const useRepo = ({ did, agent }: RepoParams) => {
  const [repo, setRepo] = useState<Uint8Array>()
  const [parsedRepo, setParsedRepo] = useState<RepoEntry[]>([])
  const [state, setState] = useState<State>("idle")

  const posts = parsedRepo.filter((repo) => repo.collection === "app.bsky.feed.post")
  const likes = parsedRepo.filter((repo) => repo.collection === "app.bsky.feed.like");
  const follows = parsedRepo.filter((repo) => repo.collection === "app.bsky.graph.follow")
  const reposts = parsedRepo.filter((repo) => repo.collection === "app.bsky.feed.repost")

  useEffect(() => {
    if (repo) {
      try {
        setState("loading")
        const repoData = [...iterateAtpRepo(repo as Uint8Array)]
        setParsedRepo(repoData)
      } catch(error) {
        console.error("Error parsing repo", error)
      } finally {
        setState("idle")
      }
    }
  }, [repo])

  const getRepo = useCallback(async (did: string) => {
    try {
      setState("loading");
      const data = await agent?.com.atproto.sync.getRepo({ did })
      setRepo(data?.data)
    } catch(error) {
      console.error("Error fetching repo:", error)
    } finally {
      setState("idle")
    }
  }, [agent])

  useEffect(() => {
    if (!repo) getRepo(did)
  }, [repo, did, getRepo])

  return {
    getRepo,
    repo: {
      posts: posts,
      likes: likes,
      follows: follows,
      reposts: reposts
    },
    loading: state === "loading"
  }
}
