import { Printable } from "../common/Printable";
import { Equality } from "../common/Equality";

/**
 * B06 Value Object:
 * Name is immutable. All "modifying" operations return a NEW Name instance.
 *
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 */
export interface Name extends Printable, Equality {
  /**
   * Returns true iff number of components == 0.
   */
  isEmpty(): boolean;

  /**
   * Returns number of components in this Name.
   */
  getNoComponents(): number;

  /**
   * Returns the i-th (masked) component.
   */
  getComponent(i: number): string;

  /**
   * Returns a new Name with the i-th component replaced by c.
   * Expects c to be properly masked.
   */
  setComponent(i: number, c: string): Name;

  /**
   * Returns a new Name with c inserted at index i.
   * Expects c to be properly masked.
   */
  insert(i: number, c: string): Name;

  /**
   * Returns a new Name with c appended at the end.
   * Expects c to be properly masked.
   */
  append(c: string): Name;

  /**
   * Returns a new Name with the i-th component removed.
   */
  remove(i: number): Name;

  /**
   * Returns a new Name that is the concatenation of this and other.
   */
  concat(other: Name): Name;

  /**
   * Returns the delimiter character of this Name.
   */
  getDelimiterCharacter(): string;
}
