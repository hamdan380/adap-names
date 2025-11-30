import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

/**
 * StringArrayName:
 *  - extends AbstractName
 *  - uses a string[] as internal representation
 *  - stores components in masked form for its delimiter
 *  - adds preconditions for indices and inputs
 */
export class StringArrayName extends AbstractName {
  protected components: string[] = [];

  /** Expects that all components are already properly masked */
  constructor(source: string[], delimiter: string = DEFAULT_DELIMITER) {
    super(delimiter);

    if (!Array.isArray(source)) {
      throw new IllegalArgumentException("components must be an array");
    }

    for (const c of source) {
      if (typeof c !== "string") {
        throw new IllegalArgumentException("component must be a string");
      }
      StringArrayName.validateMasked(c, this.delimiter);
    }

    this.components = source.slice(); // keep masked components
    this.checkInvariant();
  }

  /** Deep copy of this instance */
  public clone(): Name {
    this.checkInvariant();
    return new StringArrayName(this.components.slice(), this.delimiter);
  }

  /** Number of components */
  public getNoComponents(): number {
    return this.components.length;
  }

  /** Returns masked component at index i */
  public getComponent(i: number): string {
    this.checkInvariant();
    StringArrayName.checkIndexRange(i, this.components.length);
    return this.components[i];
  }

  /** Expects that new Name component c is properly masked */
  public setComponent(i: number, c: string): void {
    this.checkInvariant();
    StringArrayName.checkIndexRange(i, this.components.length);
    StringArrayName.validateMasked(c, this.delimiter);
    this.components[i] = c;
    this.checkInvariant();
  }

  /** Expects that new Name component c is properly masked */
  public insert(i: number, c: string): void {
    this.checkInvariant();
    StringArrayName.checkInsertIndex(i, this.components.length);
    StringArrayName.validateMasked(c, this.delimiter);
    this.components.splice(i, 0, c);
    this.checkInvariant();
  }

  /** Expects that new Name component c is properly masked */
  public append(c: string): void {
    this.checkInvariant();
    StringArrayName.validateMasked(c, this.delimiter);
    this.components.push(c);
    this.checkInvariant();
  }

  public remove(i: number): void {
    this.checkInvariant();
    StringArrayName.checkIndexRange(i, this.components.length);
    this.components.splice(i, 1);
    this.checkInvariant();
  }

  // ---------- helpers (masking + index checks) ----------

  /** Precondition: i must be a valid index [0, n-1] */
  private static checkIndexRange(i: number, n: number): void {
    if (!Number.isInteger(i)) {
      throw new IllegalArgumentException("index must be an integer");
    }
    if (i < 0 || i >= n) {
      throw new IllegalArgumentException("index out of range");
    }
  }

  /** Precondition: i must be a valid insertion index [0, n] */
  private static checkInsertIndex(i: number, n: number): void {
    if (!Number.isInteger(i)) {
      throw new IllegalArgumentException("index must be an integer");
    }
    if (i < 0 || i > n) {
      throw new IllegalArgumentException("insert index out of range");
    }
  }

  /**
   * Validate that `masked` contains no *unescaped* delimiter and no dangling ESC.
   * Throws IllegalArgumentException on contract violation.
   */
  private static validateMasked(masked: string, delimiter: string): void {
    const delimChar = delimiter;
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        i++; // skip the next char (escaped)
        if (i >= masked.length) {
          throw new IllegalArgumentException(
            "dangling escape in component (incomplete masking)",
          );
        }
        continue;
      }
      if (ch === delimChar) {
        throw new IllegalArgumentException(
          "unescaped delimiter in component (masking violated)",
        );
      }
    }
  }
}
