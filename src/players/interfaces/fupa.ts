export interface Player {
  slug: string;
  firstName: string;
  lastName: string;
  image: Image;
}

export interface Image {
  path: string;
}

export interface FetchFupaSquadResponse {
  players: Player[];
}
