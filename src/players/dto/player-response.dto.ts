export class PlayerResponseDto {
  steamName: string;
  steamID: string;
  steamUrl: string;
  country: string;
  relatedSteamIDs: string[];
  avatar: string;
  creationTime: number;
  latestActivity: number;
  isBanned: boolean;
  banReason?: string | null;
  nicknames: string[];
}

export class PlayerBanStatusDto {
  isBanned: boolean;
}