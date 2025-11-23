import { Name } from "./Name";

// to stay independent of B01 and keep logic identical.
export const DEFAULT_DELIMITER: string = ".";
export const ESCAPE_CHARACTER = "\\";

/**
 * StringArrayName:
 * - implements the Name interface
 * - uses a string[] as internal representation
 * - stores components in *masked* form for its delimiter
 */
export class StringArrayName implements Name {
  public getDelimiterCharacter(): string {
  return this.delimiter;
}

  private delimiter: string = DEFAULT_DELIMITER;
  private components: string[] = [];

  /** Expects that all components are already properly masked */
  constructor(source: string[], delimiter?: string) {
    this.delimiter = delimiter ?? DEFAULT_DELIMITER;

    if (!Array.isArray(source)) {
      throw new Error("components must be an array");
    }

    for (const c of source) {
      if (typeof c !== "string") throw new Error("component must be string");
      StringArrayName.validateMasked(c, this.delimiter);
    }

    this.components = source.slice(); // keep masked components
  }

  /**
   * Human-readable representation:
   * - unescape each component
   * - join using the given delimiter
   * No escaping in the result.
   */
  public asString(delimiter: string = this.delimiter): string {
    const rawParts = this.components.map((c) => StringArrayName.unescape(c));
    return rawParts.join(delimiter);
  }

  /**
   * Machine-readable representation using default special characters:
   * - unescape
   * - escape again for DEFAULT_DELIMITER
   * - join with DEFAULT_DELIMITER
   */
  public asDataString(): string {
    const rawParts = this.components.map((c) => StringArrayName.unescape(c));
    const escapedParts = rawParts.map((r) =>
      StringArrayName.escapeForDelimiter(r, DEFAULT_DELIMITER),
    );
    return escapedParts.join(DEFAULT_DELIMITER);
  }

  /** Returns true if there are no components */
  public isEmpty(): boolean {
    return this.components.length === 0;
  }

  /** Returns number of components in Name instance */
  public getNoComponents(): number {
    return this.components.length;
  }

  /** Returns properly masked component string at index i */
  public getComponent(i: number): string {
    StringArrayName.checkIndexRange(i, this.components.length);
    return this.components[i];
  }

  /** Expects that new Name component c is properly masked */
  public setComponent(i: number, c: string): void {
    StringArrayName.checkIndexRange(i, this.components.length);
    StringArrayName.validateMasked(c, this.delimiter);
    this.components[i] = c;
  }

  /** Expects that new Name component c is properly masked */
  public insert(i: number, c: string): void {
    // allow insert at end as well
    if (i < 0 || i > this.components.length) {
      throw new Error("index is out of range");
    }
    StringArrayName.validateMasked(c, this.delimiter);
    this.components.splice(i, 0, c);
  }

  /** Expects that new Name component c is properly masked */
  public append(c: string): void {
    StringArrayName.validateMasked(c, this.delimiter);
    this.components.push(c);
  }

  public remove(i: number): void {
    StringArrayName.checkIndexRange(i, this.components.length);
    this.components.splice(i, 1);
  }

  /**
   * Concatenate another Name onto this one.
   * We assume other.getComponent(i) returns masked components compatible with this delimiter.
   */
  public concat(other: Name): void {
    for (let i = 0; i < other.getNoComponents(); i++) {
      const c = other.getComponent(i);
      // validate for this delimiter to be safe
      StringArrayName.validateMasked(c, this.delimiter);
      this.components.push(c);
    }
  }

  // ---------- helpers (copied/adapted from B01) ----------

  /** Ensure index is within [0, n-1] */
  private static checkIndexRange(i: number, n: number): void {
    if (!Number.isInteger(i)) throw new Error("index must be integer");
    if (i < 0 || i >= n) throw new Error("index out of range");
  }

  /** Unescape a masked component: turns '\x' into 'x' for any x */
  private static unescape(masked: string): string {
    let result = "";
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        if (i === masked.length - 1) {
          // dangling escape at end → ignore it (same as your B01 behavior)
          break;
        }
        i++; // skip escape and take next char literally (if exists)
        if (i < masked.length) result += masked[i];
      } else {
        result += ch;
      }
    }
    return result;
  }

  /** Escape raw component for a given delimiter: escape '\' and the delimiter char */
  private static escapeForDelimiter(raw: string, delimiter: string): string {
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

  /**
   * Validate that `masked` contains no *unescaped* delimiter and no dangling ESC.
   * We walk left-to-right; when we see '\', skip the next char (whatever it is).
   * Any delimiter seen outside an escape is invalid.
   */
  private static validateMasked(masked: string, delimiter: string): void {
    const delimChar = delimiter;
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        i++; // skip the next char (escaped)
        if (i >= masked.length) {
          // dangling escape at end is invalid per masking expectation
          throw new Error("dangling escape in component");
        }
        continue;
      }
      if (ch === delimChar) {
        // found an unescaped delimiter inside component -> invalid
        throw new Error("unmasked delimiter in component");
      }
    }
  }
}
