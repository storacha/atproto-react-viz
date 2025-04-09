export interface BlueSkySessionData {
  accessJwt: string;
  active: boolean;
  did: string;
  didDoc: {
    $context: string[];
    alsoKnownAs: string[];
    id: string;
    service: {
      id: string;
      type: string;
      serviceEndpoint: string
    }[];
    verificationMethod: {
      controller: string,
      id: string,
      type: string,
      publicKeyMultibase: string
    }[];
  };
  email: string;
  emailAuthFactor: boolean;
  emailConfirmed: boolean;
  handle: string;
  refreshJwt: string;
}

export interface BlockMap {
  [cid: string]: string
}

export interface Repo {
  root: string;
  blocks: BlockMap
}

export type Post = {
  createdAt: string;
  text: string;
}
