import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

/**
 * Immutable Name implementation backed by a single masked string.
 *
 * The string is interpreted as a sequence of masked components separated
 * by the delimiter character, where the delimiter can appear inside a component
 * only if escaped using the escape character.
 */
export class StringName extends AbstractName {
  private readonly maskedName: string;
  private readonly components: ReadonlyArray<string>;

  /**
   * @param source masked name string (may contain escaped delimiter characters)
   * @param delimiter single character delimiter
   */
  constructor(source: string, delimiter?: string) {
    super(delimiter);

    if (source == null) throw new IllegalArgumentException("source must not be null");
    if (typeof source !== "string") throw new IllegalArgumentException("source must be a string");

    this.maskedName = source;

    // Parse masked string into masked components safely (respecting escapes)
    const parsed = StringName.parseMaskedName(source, this.delimiter);

    // Validate each parsed component is properly masked for this delimiter
    for (const c of parsed) {
      this.assertMaskedComponent(c, this.delimiter);
    }

    this.components = Object.freeze(parsed);
  }

  public getNoComponents(): number {
    return this.components.length;
  }

  public getComponent(i: number): string {
    if (!Number.isInteger(i)) throw new IllegalArgumentException("index must be integer");
    if (i < 0 || i >= this.components.length) throw new IllegalArgumentException("index out of range");
    return this.components[i];
  }

  protected withComponents(components: string[]): Name {
    // Join masked components using this delimiter (safe because components contain no unescaped delimiter)
    const joined = components.length === 0 ? "" : components.join(this.delimiter);
    return new StringName(joined, this.delimiter);
  }

  /**
   * Split masked name into masked components, where delimiter acts as separator
   * only when it is NOT escaped.
   *
   * Empty source string => empty component list (0 components).
   */
  private static parseMaskedName(source: string, delimiter: string): string[] {
    if (source.length === 0) return [];

    const parts: string[] = [];
    let current = "";

    // We treat backslash escapes as "take next char literally"
    for (let i = 0; i < source.length; i++) {
      const ch = source[i];

      if (ch === "\\") {
        // keep escape + next char inside the masked component
        current += ch;
        i++;
        if (i < source.length) {
          current += source[i];
        } else {
          // dangling escape will be validated later by assertMaskedComponent
          // keep it so validation can throw
        }
        continue;
      }

      if (ch === delimiter) {
        parts.push(current);
        current = "";
        continue;
      }

      current += ch;
    }

    parts.push(current);
    return parts;
  }
}

export default StringName;
