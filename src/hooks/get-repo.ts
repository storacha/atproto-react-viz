import { iterateAtpRepo, RepoEntry } from "@atcute/car"
import AtpAgent from "@atproto/api"
import { useEffect, useState } from "react"

export type State = "loading" | "idle"

export const useRepo = ({did, agent}: {did: string, agent: AtpAgent}) => {
  const [repo, setRepo] = useState<Uint8Array>()
  const [parsedRepo, setParsedRepo] = useState<RepoEntry[]>([])
  const [state, setState] = useState<State>("idle")

  useEffect(() => {
    if (repo) {
      setState("loading")
      try {
        const repoData = [...iterateAtpRepo(repo as Uint8Array)]
        setParsedRepo(repoData)
      } catch(error) {
        console.error("Error parsing repo", error)
      }
    }
  }, [repo])

  useEffect(() => {
    if (!repo) getRepo(did)
  }, [repo])

  const getRepo = async (did: string) => {
    setState("loading");
    try {
      const data = await agent.com.atproto.sync.getRepo({ did })
      setRepo(data.data)
    } catch(error) {
      console.error("Error fetching repo:", error)
    } finally {
      setState("idle")
    }
  }

  return {
    getRepo,
    repo: parsedRepo,
    loading: state === "loading"
  }
}
