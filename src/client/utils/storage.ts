export default class Storage {
  get(key: string): string | null {
    return window.localStorage.getItem(key);
  }

  set(key: string, value: string | boolean | number): void {
    window.localStorage.setItem(key, value as string);
  }

  del(key: string): void {
    window.localStorage.removeItem(key);
  }
}
