export class InvalidSteamIDError extends Error {
  constructor(steamID: string) {
    super(`Invalid Steam ID: ${steamID}.`);
    this.name = 'InvalidSteamIDError';
  }
}
