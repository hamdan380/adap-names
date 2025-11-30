import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/**
 * AbstractName:
 *  - Implements all behavior that only depends on the Name interface
 *  - Leaves storage-specific operations to subclasses
 *  - Provides common printing, equality and hashing logic
 */
export abstract class AbstractName implements Name {
  protected delimiter: string = DEFAULT_DELIMITER;

  constructor(delimiter: string = DEFAULT_DELIMITER) {
    this.delimiter = delimiter;
  }

  // -------- Cloneable --------
  // Subclasses know best how to clone themselves (array vs single string)
  abstract clone(): Name;

  // -------- Printable --------

  /**
   * Human-readable representation:
   *  - unescape each component
   *  - join with the given delimiter
   * No escaping in the result.
   */
  public asString(delimiter: string = this.delimiter): string {
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

  /**
   * toString delegates to the machine-readable representation.
   */
  public toString(): string {
    return this.asDataString();
  }

  /**
   * Machine-readable representation using DEFAULT_DELIMITER:
   *  - unescape each component
   *  - escape for DEFAULT_DELIMITER
   *  - join with DEFAULT_DELIMITER
   */
  public asDataString(): string {
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
   * all corresponding components (masked form) are equal.
   */
  public isEqual(other: Name): boolean {
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
    const s = this.asDataString();
    let hash = 17;
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) | 0; // keep it in 32-bit range
    }
    return hash;
  }

  // -------- Name interface parts that are generic --------

  public isEmpty(): boolean {
    return this.getNoComponents() === 0;
  }

  /**
   * Concatenate all components of `other` to this Name instance.
   * We assume components from `other` are already properly masked.
   */
  public concat(other: Name): void {
    for (let i = 0; i < other.getNoComponents(); i++) {
      this.append(other.getComponent(i));
    }
  }

  // -------- Abstract operations that depend on storage format --------

  abstract getNoComponents(): number;

  abstract getComponent(i: number): string;
  abstract setComponent(i: number, c: string): void;

  abstract insert(i: number, c: string): void;
  abstract append(c: string): void;
  abstract remove(i: number): void;

  // -------- Shared helper functions (masking logic from B01) --------

  /** Unescape a masked component: turns '\x' into 'x' for any x */
  protected static unescape(masked: string): string {
    let result = "";
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        if (i === masked.length - 1) {
          // dangling escape at end → ignore (same behaviour as B01)
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
