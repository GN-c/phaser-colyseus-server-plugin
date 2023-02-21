/**
 * Queue Data structure
 */
export default class Queue<T extends any> {
  private readonly elements: T[] = [];

  constructor(readonly limit: number, elements: T[] = []) {
    for (const element of elements) this.add(element);
  }

  /**
   * Add New element to queue
   */
  add(element: T) {
    this.elements.push(element);

    /**
     * Remove elements untill we get to desired length
     */
    const length = this.elements.length;
    for (let i = length - this.limit; i > 0; i--) this.pop();
  }

  /**
   * Remove last element
   */
  pop() {
    return this.elements.shift();
  }

  get length() {
    return this.elements.length;
  }

  /**
   * Get element at specific index in queue starting from 0
   * @param index
   * @returns
   */
  at(index: number) {
    return this.elements.at(index);
  }

  get first() {
    return this.at(0);
  }

  get last() {
    return this.at(-1);
  }

  get isEmpty() {
    return this.length == 0;
  }
}
