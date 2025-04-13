import { RepoEntry } from "@atcute/car";

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
      serviceEndpoint: string;
    }[];
    verificationMethod: {
      controller: string;
      id: string;
      type: string;
      publicKeyMultibase: string;
    }[];
  };
  email: string;
  emailAuthFactor: boolean;
  emailConfirmed: boolean;
  handle: string;
  refreshJwt: string;
}

export interface BlockMap {
  [cid: string]: string;
}

export interface Repo {
  root: string;
  blocks: BlockMap;
}

export type Post = {
  createdAt: string;
  text: string;
  $type?: string;
  embed?:
    | ExternalEmbeds
    | ImageEmbeds
    | QuotedEmbeds;
};

/**
 * type definition for embedded content in a Bluesky Post, mostly external links
 * to blog posts etc
 */
export type ExternalEmbeds = {
  $type: "app.bsky.embed.external";
  external: {
    uri: string;
    title: string;
    description: string;
    thumb: {
      $type: string;
      mimeType: string;
      ref: {
        $link: string;
      }
    };
  };
};

/**
 * type definition for posts with images embedded in them
 */
export type ImageEmbeds = {
  $type: "app.bsky.embed.images";
  images: {
    alt?: string;
    image: {
      $type: string;
      mimeType: string
      ref: {
        $link: string;
      };
      size: number;
    };
  }[];
};

/**
 * type definition for quoted posts on Bluesky. Quite similar to quoted replies on Twitter
 */
export type QuotedEmbeds = {
  $type: "app.bsky.embed.record";
  record: {
    $type: "app.bsky.embed.record#viewRecord";
    uri: string;
    cid: string;
    author: {
      did: string;
      handle: string;
      displayName?: string;
    };
    // // @ts-expect-error for now, i'm entirely certain of this type
    // value?: any;
    // embeds?: Array<any>;
    // indexedAt: string;
  };
};

export interface ExtendedRepoEntry extends RepoEntry {
  record: Post;
}
