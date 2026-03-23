export class UsfmParseError extends Error {
  readonly offset: number;

  constructor(message: string, offset: number) {
    super(message);
    this.name = "UsfmParseError";
    this.offset = offset;
  }
}
