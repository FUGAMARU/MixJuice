export class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SpotifyAuthError"
    Object.setPrototypeOf(this, SpotifyAuthError.prototype)
  }
}
