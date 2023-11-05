export class UserDataOperationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UserDataOperationError"
    Object.setPrototypeOf(this, UserDataOperationError.prototype)
  }
}
