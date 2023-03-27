export interface FupaPlayer {
  slug: string;
  firstName: string;
  lastName: string;
  image: Image;
}

export interface Image {
  path: string;
}

export interface FetchFupaSquadResponse {
  players: FupaPlayer[];
}
