export abstract class BaseFactory<T> {
  abstract create(data?: Partial<T>): Promise<T>;

  async createMany(count: number, data?: Partial<T>): Promise<T[]> {
    const items: T[] = [];
    for (let i = 0; i < count; i++) items.push(await this.create(data));

    return items;
  }
}
