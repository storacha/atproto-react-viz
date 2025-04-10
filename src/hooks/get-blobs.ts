import AtpAgent from "@atproto/api"
import { useCallback, useEffect, useState } from "react"

export type State = "loading" | "idle"

export type BlobItem = {
  cid: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  imageUrl?: string;
  isImage?: boolean;
}

export type BlobsParams = {
  did: string;
  agent: AtpAgent;
}

export const useBlobs = ({ did, agent }: BlobsParams) => {
  const [blobs, setBlobs] = useState<BlobItem[]>([])
  const [state, setState] = useState<State>("idle")

  const getBlobs = useCallback(async (did: string) => {
    if (!agent || !did) return;
    
    try {
      setState("loading");
      const response = await agent.com.atproto.sync.listBlobs({
        did,
        limit: 1000
      });
      
      if (response?.data) {
        const newBlobs: BlobItem[] = response.data.cids.map((cid) => ({ 
          cid,
          isImage: false,
          createdAt: new Date().toISOString()
        }));
        
        const blobsWithData = await Promise.all(
          newBlobs.map(async (blob) => {
            try {
              const blobResponse = await agent.com.atproto.sync.getBlob({
                did,
                cid: blob.cid
              });
              
              const contentType = blobResponse.headers['content-type'];
              const isImage = contentType ? contentType.startsWith('image/') : false;
              
              let imageUrl = undefined;
              if (isImage && blobResponse.data) {
                const blob = new Blob([blobResponse.data], { type: contentType });
                imageUrl = URL.createObjectURL(blob);
              }
              
              return {
                ...blob,
                mimeType: contentType,
                isImage,
                imageUrl
              };
            } catch (error) {
              console.error(`Error fetching blob ${blob.cid}:`, error);
              return blob;
            }
          })
        );
        
        setBlobs(blobsWithData);
      }
    } catch(error) {
      console.error("Error fetching blobs:", error)
    } finally {
      setState("idle")
    }
  }, [agent])
  
  const refreshBlobs = useCallback(() => {
    if (did && agent) {
      setBlobs([]); 
      getBlobs(did);
    }
  }, [did, agent, getBlobs]);

  useEffect(() => {
    return () => {
      blobs.forEach(blob => {
        if (blob.imageUrl) {
          URL.revokeObjectURL(blob.imageUrl);
        }
      });
    };
  }, [blobs]);

  useEffect(() => {
    if (did && agent) {
      getBlobs(did);
    }
  }, [did, agent, getBlobs])

  return {
    blobs,
    loading: state === "loading",
    refreshBlobs
  }
}
