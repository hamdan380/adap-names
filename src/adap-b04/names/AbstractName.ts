import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";

/**
 * AbstractName:
 *  - Implements shared behaviour for all Name implementations
 *  - Enforces basic design-by-contract rules:
 *      * Preconditions  → IllegalArgumentException
 *      * Invariants     → InvalidStateException
 *      * Postconditions → MethodFailedException
 */
export abstract class AbstractName implements Name {
  protected delimiter: string = DEFAULT_DELIMITER;

  constructor(delimiter: string = DEFAULT_DELIMITER) {
    // Precondition: delimiter must be a non-empty single character
    if (!delimiter || delimiter.length !== 1) {
      throw new IllegalArgumentException(
        "Delimiter must be a single, non-empty character",
      );
    }
    this.delimiter = delimiter;
    this.checkInvariant();
  }

  // -------- Cloneable --------
  // Subclasses know how to construct their own type.
  public abstract clone(): Name;

  // -------- Printable --------

  /**
   * Human-readable representation:
   *  - unescape each component
   *  - join with the given delimiter
   * No escaping in the result.
   *
   * Precondition: delimiter non-empty
   * Invariant: number of components >= 0
   */
  public asString(delimiter: string = this.delimiter): string {
    if (!delimiter || delimiter.length === 0) {
      throw new IllegalArgumentException("Delimiter must not be empty");
    }
    this.checkInvariant();

    if (this.getNoComponents() === 0) {
      return "";
    }

    const rawParts: string[] = [];
    for (let i = 0; i < this.getNoComponents(); i++) {
      const masked = this.getComponent(i);
      rawParts.push(AbstractName.unescape(masked));
    }
    return rawParts.join(delimiter);
  }

  public toString(): string {
    return this.asDataString();
  }

  /**
   * Machine-readable representation using DEFAULT_DELIMITER:
   *  - unescape each component
   *  - escape for DEFAULT_DELIMITER
   *  - join with DEFAULT_DELIMITER
   *
   * Invariant: number of components >= 0
   */
  public asDataString(): string {
    this.checkInvariant();

    if (this.getNoComponents() === 0) {
      return "";
    }

    const rawParts: string[] = [];
    for (let i = 0; i < this.getNoComponents(); i++) {
      const masked = this.getComponent(i);
      rawParts.push(AbstractName.unescape(masked));
    }
    const escapedParts = rawParts.map((r) =>
      AbstractName.escapeForDelimiter(r, DEFAULT_DELIMITER),
    );
    return escapedParts.join(DEFAULT_DELIMITER);
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  // -------- Equality --------

  /**
   * Two Names are equal if they have the same number of components and
   * each corresponding (masked) component is equal.
   *
   * Precondition: other must not be null/undefined
   */
  public isEqual(other: Name): boolean {
    if (!other) {
      throw new IllegalArgumentException("Other name must not be null");
    }
    this.checkInvariant();

    if (this.getNoComponents() !== other.getNoComponents()) {
      return false;
    }
    for (let i = 0; i < this.getNoComponents(); i++) {
      if (this.getComponent(i) !== other.getComponent(i)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Simple hash code based on the machine-readable representation.
   */
  public getHashCode(): number {
    this.checkInvariant();

    const s = this.asDataString();
    let hash = 17;
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) | 0; // keep 32-bit
    }
    return hash;
  }

  // -------- Name generic parts --------

  public isEmpty(): boolean {
    this.checkInvariant();
    return this.getNoComponents() === 0;
  }

  /**
   * Concatenate all components of `other` to this Name instance.
   *
   * Precondition:
   *  - other != null
   *
   * Postcondition:
   *  - newNoComponents == oldNoComponents + other.getNoComponents()
   */
  public concat(other: Name): void {
    if (!other) {
      throw new IllegalArgumentException("Other name must not be null");
    }

    this.checkInvariant();
    const oldNo = this.getNoComponents();
    const addNo = other.getNoComponents();

    for (let i = 0; i < addNo; i++) {
      this.append(other.getComponent(i));
    }

    const newNo = this.getNoComponents();
    if (newNo !== oldNo + addNo) {
      throw new MethodFailedException(
        "concat postcondition violated: component count did not increase correctly",
      );
    }
    this.checkInvariant();
  }

  // -------- Abstract operations (storage-specific) --------

  public abstract getNoComponents(): number;

  public abstract getComponent(i: number): string;
  public abstract setComponent(i: number, c: string): void;

  public abstract insert(i: number, c: string): void;
  public abstract append(c: string): void;
  public abstract remove(i: number): void;

  // -------- Invariants & shared helpers --------

  /**
   * Class invariant:
   *  - getNoComponents() >= 0
   */
  protected checkInvariant(): void {
    const n = this.getNoComponents();
    if (n < 0) {
      throw new InvalidStateException(
        "Invariant violated: number of components must be >= 0",
      );
    }
  }

  /** Unescape a masked component: turns '\x' into 'x' for any x */
  protected static unescape(masked: string): string {
    let result = "";
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        if (i === masked.length - 1) {
          // dangling escape at end → ignore (same behaviour as before)
          break;
        }
        i++; // skip escape and take next char literally
        if (i < masked.length) result += masked[i];
      } else {
        result += ch;
      }
    }
    return result;
  }

  /** Escape raw component for a given delimiter: escape '\' and the delimiter char */
  protected static escapeForDelimiter(raw: string, delimiter: string): string {
    const delimChar = delimiter;
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === ESCAPE_CHARACTER || ch === delimChar) {
        result += ESCAPE_CHARACTER;
      }
      result += ch;
    }
    return result;
  }
}
