import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/**
 * StringName:
 * - implements the Name interface
 * - stores the whole name as ONE masked string `name`
 * - components are separated by the instance's delimiter
 * - each component is masked like in B01 (delimiter + '\' escaped)
 */
export class StringName implements Name {
  protected delimiter: string = DEFAULT_DELIMITER;
  protected name: string = "";
  protected noComponents: number = 0;

  /**
   * `source` is a machine-style string:
   * masked components joined by this.delimiter.
   */
  constructor(source: string, delimiter?: string) {
    this.delimiter = delimiter ?? DEFAULT_DELIMITER;
    this.name = source ?? "";

    if (this.name === "") {
      this.noComponents = 0;
    } else {
      const comps = StringName.splitMasked(this.name, this.delimiter);
      // validate components for correct masking
      for (const c of comps) {
        StringName.validateMasked(c, this.delimiter);
      }
      this.noComponents = comps.length;
      // normalize internal representation
      this.name = comps.join(this.delimiter);
    }
  }

  /**
   * Human-readable representation:
   * - parse into masked components
   * - unescape each component
   * - join raw components with the chosen delimiter
   * No escaping in the result.
   */
  public asString(delimiter: string = this.delimiter): string {
    if (this.noComponents === 0 || this.name === "") return "";
    const comps = this.getComponents(); // masked
    const rawParts = comps.map((c) => StringName.unescape(c));
    return rawParts.join(delimiter);
  }

  /**
   * Machine-readable representation using DEFAULT_DELIMITER:
   * - parse into masked components
   * - unescape to raw
   * - escape again for DEFAULT_DELIMITER
   * - join with DEFAULT_DELIMITER
   */
  public asDataString(): string {
    if (this.noComponents === 0 || this.name === "") return "";
    const comps = this.getComponents(); // masked
    const rawParts = comps.map((c) => StringName.unescape(c));
    const escapedParts = rawParts.map((r) =>
      StringName.escapeForDelimiter(r, DEFAULT_DELIMITER),
    );
    return escapedParts.join(DEFAULT_DELIMITER);
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  public isEmpty(): boolean {
    return this.noComponents === 0;
  }

  public getNoComponents(): number {
    return this.noComponents;
  }

  /** Returns the (masked) component at index i */
  public getComponent(i: number): string {
    const components = this.getComponents();
    this.checkIndex(i, components);
    return components[i];
  }

  /** Expects that new Name component c is properly masked */
  public setComponent(n: number, c: string): void {
    const components = this.getComponents();
    this.checkIndex(n, components);
    StringName.validateMasked(c, this.delimiter);
    components[n] = c;
    this.updateName(components);
  }

  /** Expects that new Name component c is properly masked */
  public insert(n: number, c: string): void {
    const components = this.getComponents();
    this.checkInsertIndex(n, components);
    StringName.validateMasked(c, this.delimiter);
    components.splice(n, 0, c);
    this.updateName(components);
  }

  /** Expects that new Name component c is properly masked */
  public append(c: string): void {
    const components = this.getComponents();
    StringName.validateMasked(c, this.delimiter);
    components.push(c);
    this.updateName(components);
  }

  public remove(n: number): void {
    const components = this.getComponents();
    this.checkIndex(n, components);
    components.splice(n, 1);
    this.updateName(components);
  }

  public concat(other: Name): void {
    const components = this.getComponents();
    for (let i = 0; i < other.getNoComponents(); i++) {
      const part = other.getComponent(i);
      // ensure component is valid for this delimiter
      StringName.validateMasked(part, this.delimiter);
      components.push(part);
    }
    this.updateName(components);
  }

  // ---------- internal representation helpers ----------

  /**
   * Parse `this.name` (one masked string) into masked components.
   * This respects ESCAPE_CHARACTER, so delimiters can appear escaped inside components.
   */
  private getComponents(): string[] {
    if (this.noComponents === 0 || this.name === "") return [];
    return StringName.splitMasked(this.name, this.delimiter);
  }

  /**
   * Update internal single-string representation from masked components.
   */
  private updateName(components: string[]): void {
    if (components.length === 0) {
      this.name = "";
      this.noComponents = 0;
    } else {
      // all components are expected to be masked already
      for (const c of components) {
        StringName.validateMasked(c, this.delimiter);
      }
      this.name = components.join(this.delimiter);
      this.noComponents = components.length;
    }
  }

  private checkIndex(i: number, components: string[]): void {
    if (!Number.isInteger(i) || i < 0 || i >= components.length) {
      throw new RangeError(`index ${i} out of range`);
    }
  }

  private checkInsertIndex(i: number, components: string[]): void {
    if (!Number.isInteger(i) || i < 0 || i > components.length) {
      throw new RangeError(`insert index ${i} out of range`);
    }
  }

  // ---------- masking helpers (copied/adapted from B01) ----------

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
   * Same semantics as in your B01 `Name`.
   */
  private static validateMasked(masked: string, delimiter: string): void {
    const delimChar = delimiter;
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        i++; // skip the next char (escaped)
        if (i >= masked.length) {
          throw new Error("dangling escape in component");
        }
        continue;
      }
      if (ch === delimChar) {
        throw new Error("unmasked delimiter in component");
      }
    }
  }

  /**
   * Split a single masked string into components, respecting escapes.
   * - unescaped delimiter → split
   * - escaped delimiter (like '\.') → stays inside component
   */
  private static splitMasked(text: string, delimiter: string): string[] {
    const parts: string[] = [];
    let current = "";

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (ch === ESCAPE_CHARACTER) {
        // escape: add '\' + next char (if any) to current, but do NOT treat next as delimiter
        if (i === text.length - 1) {
          // dangling escape: we'll just add '\' and break, validateMasked will catch if needed
          current += ESCAPE_CHARACTER;
          break;
        }
        current += ESCAPE_CHARACTER;
        i++;
        current += text[i];
      } else if (ch === delimiter) {
        // unescaped delimiter → end of current component
        parts.push(current);
        current = "";
      } else {
        current += ch;
      }
    }

    parts.push(current); // last component
    return parts;
  }
}
