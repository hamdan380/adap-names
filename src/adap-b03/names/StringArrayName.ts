import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {
  protected components: string[] = [];

  /** Expects that all components are already properly masked */
  constructor(source: string[], delimiter: string = DEFAULT_DELIMITER) {
    super(delimiter);

    if (!Array.isArray(source)) {
      throw new Error("components must be an array");
    }

    for (const c of source) {
      if (typeof c !== "string") {
        throw new Error("component must be string");
      }
      StringArrayName.validateMasked(c, this.delimiter);
    }

    this.components = source.slice(); // keep masked components
  }

  /** Deep copy of this instance */
  public clone(): Name {
    return new StringArrayName(this.components.slice(), this.delimiter);
  }

  /** Number of components */
  public getNoComponents(): number {
    return this.components.length;
  }

  /** Returns masked component at index i */
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

  // ---------- helpers (masking + index checks) ----------

  /** Ensure index is within [0, n-1] */
  private static checkIndexRange(i: number, n: number): void {
    if (!Number.isInteger(i)) {
      throw new Error("index must be integer");
    }
    if (i < 0 || i >= n) {
      throw new Error("index out of range");
    }
  }

  /**
   * Validate that `masked` contains no *unescaped* delimiter and no dangling ESC.
   * This is the same logic you used in B01.
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
