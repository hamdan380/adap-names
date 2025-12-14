import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

/**
 * Immutable Name implementation backed by an array of masked components.
 */
export class StringArrayName extends AbstractName {
  private readonly components: ReadonlyArray<string>;

  /**
   * @param source masked components (each component must be properly masked)
   * @param delimiter single character delimiter
   */
  constructor(source: string[], delimiter?: string) {
    super(delimiter);

    if (source == null) throw new IllegalArgumentException("source must not be null");
    if (!Array.isArray(source)) throw new IllegalArgumentException("source must be an array");

    // Validate that all components are properly masked for this delimiter
    for (const c of source) {
      this.assertMaskedComponent(c, this.delimiter);
    }

    // Immutable copy (no sharing)
    this.components = Object.freeze([...source]);
  }

  public getNoComponents(): number {
    return this.components.length;
  }

  public getComponent(i: number): string {
    // Use AbstractName's index checks via copy+assert
    if (!Number.isInteger(i)) throw new IllegalArgumentException("index must be integer");
    if (i < 0 || i >= this.components.length) throw new IllegalArgumentException("index out of range");
    return this.components[i];
  }

  protected withComponents(components: string[]): Name {
    // components are already masked; create a new immutable value object
    return new StringArrayName(components, this.delimiter);
  }
}

export default StringArrayName;
