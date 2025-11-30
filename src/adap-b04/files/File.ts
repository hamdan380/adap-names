import { Node } from "./Node";
import { Directory } from "./Directory";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";

enum FileState {
  OPEN,
  CLOSED,
  DELETED,
}

export class File extends Node {
  protected state: FileState = FileState.CLOSED;

  /**
   * Preconditions handled in Node constructor:
   * - baseName must be non-empty
   * - parent must not be null
   */
  constructor(baseName: string, parent: Directory) {
    super(baseName, parent);
    this.checkInvariant();
  }

  /**
   * OPEN the file.
   *
   * Preconditions:
   *  - file must currently be CLOSED
   *
   * Postconditions:
   *  - file must be OPEN afterward
   */
  public open(): void {
    this.checkInvariant();

    if (this.state !== FileState.CLOSED) {
      throw new IllegalArgumentException(
        "File.open() precondition violated: File must be CLOSED before opening",
      );
    }

    this.state = FileState.OPEN;

    if (this.state !== FileState.OPEN) {
      throw new MethodFailedException(
        "File.open() postcondition violated: File not OPEN after call",
      );
    }

    this.checkInvariant();
  }

  /**
   * READ bytes from file.
   *
   * Preconditions:
   *  - noBytes >= 0
   *  - file must be OPEN
   */
  public read(noBytes: number): Int8Array {
    this.checkInvariant();

    if (!Number.isInteger(noBytes) || noBytes < 0) {
      throw new IllegalArgumentException(
        "File.read() precondition violated: noBytes must be >= 0",
      );
    }

    if (this.state !== FileState.OPEN) {
      throw new IllegalArgumentException(
        "File.read() precondition violated: file must be OPEN to read",
      );
    }

    // return dummy data
    return new Int8Array(noBytes);
  }

  /**
   * CLOSE the file.
   *
   * Preconditions:
   *  - file must be OPEN
   *
   * Postconditions:
   *  - file must be CLOSED afterward
   */
  public close(): void {
    this.checkInvariant();

    if (this.state !== FileState.OPEN) {
      throw new IllegalArgumentException(
        "File.close() precondition violated: File must be OPEN before closing",
      );
    }

    this.state = FileState.CLOSED;

    if (this.state !== FileState.CLOSED) {
      throw new MethodFailedException(
        "File.close() postcondition violated: File not CLOSED after call",
      );
    }

    this.checkInvariant();
  }

  protected doGetFileState(): FileState {
    return this.state;
  }

  /**
   * Class invariant for File:
   *  - state must be OPEN, CLOSED, or DELETED
   *  - Node invariant still applies
   */
  protected override checkInvariant(): void {
    super.checkInvariant();

    if (
      this.state !== FileState.OPEN &&
      this.state !== FileState.CLOSED &&
      this.state !== FileState.DELETED
    ) {
      throw new InvalidStateException(
        `File invariant violated: illegal state '${this.state}'`,
      );
    }
  }
}
