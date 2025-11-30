import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

/**
 * StringName:
 *  - extends AbstractName
 *  - stores the whole name as ONE masked string
 *  - components are separated by this.delimiter
 *  - uses Design by Contract (preconditions + invariants)
 */
export class StringName extends AbstractName {
  protected name: string = "";
  protected noComponents: number = 0;

  /**
   * `source` is a machine-style string:
   *  masked components joined by the chosen delimiter.
   */
  constructor(source: string, delimiter: string = DEFAULT_DELIMITER) {
    super(delimiter);

    this.name = source ?? "";

    if (this.name === "") {
      this.noComponents = 0;
    } else {
      const comps = StringName.splitMasked(this.name, this.delimiter);
      // validate components for correct masking (precondition)
      for (const c of comps) {
        StringName.validateMasked(c, this.delimiter);
      }
      this.noComponents = comps.length;
      // normalize internal representation
      this.name = comps.join(this.delimiter);
    }

    this.checkInvariant();
  }

  /** Deep copy of this instance */
  public clone(): Name {
    this.checkInvariant();
    return new StringName(this.name, this.delimiter);
  }

  // ------- implementations of abstract methods from AbstractName -------

  public getNoComponents(): number {
    return this.noComponents;
  }

  /** Returns masked component at index i */
  public getComponent(i: number): string {
    this.checkInvariant();
    const components = this.getComponents();
    StringName.checkIndex(i, components.length);
    return components[i];
  }

  /** Expects that new Name component c is properly masked */
  public setComponent(i: number, c: string): void {
    this.checkInvariant();
    const components = this.getComponents();
    StringName.checkIndex(i, components.length);
    StringName.validateMasked(c, this.delimiter);
    components[i] = c;
    this.updateName(components);
    this.checkInvariant();
  }

  /** Expects that new Name component c is properly masked */
  public insert(i: number, c: string): void {
    this.checkInvariant();
    const components = this.getComponents();
    StringName.checkInsertIndex(i, components.length);
    StringName.validateMasked(c, this.delimiter);
    components.splice(i, 0, c);
    this.updateName(components);
    this.checkInvariant();
  }

  /** Expects that new Name component c is properly masked */
  public append(c: string): void {
    this.checkInvariant();
    const components = this.getComponents();
    StringName.validateMasked(c, this.delimiter);
    components.push(c);
    this.updateName(components);
    this.checkInvariant();
  }

  public remove(i: number): void {
    this.checkInvariant();
    const components = this.getComponents();
    StringName.checkIndex(i, components.length);
    components.splice(i, 1);
    this.updateName(components);
    this.checkInvariant();
  }

  // ------------- internal representation helpers -------------

  /**
   * Parse `this.name` (one masked string) into masked components,
   * respecting ESCAPE_CHARACTER so delimiters can be escaped.
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
      return;
    }
    for (const c of components) {
      StringName.validateMasked(c, this.delimiter);
    }
    this.name = components.join(this.delimiter);
    this.noComponents = components.length;
  }

  private static checkIndex(i: number, n: number): void {
    if (!Number.isInteger(i)) {
      throw new IllegalArgumentException("index must be an integer");
    }
    if (i < 0 || i >= n) {
      throw new IllegalArgumentException("index out of range");
    }
  }

  private static checkInsertIndex(i: number, n: number): void {
    if (!Number.isInteger(i)) {
      throw new IllegalArgumentException("index must be an integer");
    }
    if (i < 0 || i > n) {
      throw new IllegalArgumentException("insert index out of range");
    }
  }

  // ------------- masking / parsing helpers -------------

  /**
   * Validate that `masked` contains no unescaped delimiter and no dangling ESC.
   * Throws IllegalArgumentException on violation (precondition).
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

  /**
   * Split a single masked string into components, respecting escapes:
   *  - unescaped delimiter → split
   *  - escaped delimiter (like '\.') stays inside a component
   */
  private static splitMasked(text: string, delimiter: string): string[] {
    const parts: string[] = [];
    let current = "";

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (ch === ESCAPE_CHARACTER) {
        // keep '\' and the next char inside the component
        if (i === text.length - 1) {
          current += ESCAPE_CHARACTER;
          break;
        }
        current += ESCAPE_CHARACTER;
        i++;
        current += text[i];
      } else if (ch === delimiter) {
        // unescaped delimiter → split
        parts.push(current);
        current = "";
      } else {
        current += ch;
      }
    }

    parts.push(current);
    return parts;
  }
}
