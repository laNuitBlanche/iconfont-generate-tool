export default class ThrottleSync {
  private num: number = 0;
  private current: number = 0;
  private queue: Function[] = [];
  private fn:Function;
  constructor(protected max: number) {
    if (typeof max !== "number") {
      throw new Error("asyncThrottle error:`max` params must be a number");

    }
  }

  run<T>(fn:Function):Promise<T> {
    this.fn = fn;
    return new Promise(async (resolve, reject) => {
      this.handleFn(resolve, reject);
    })
  }

  callback() {
    this.current = --this.num;
    if (this.queue.length > 0) {
      this.queue.shift()();
    }
  }

  async handleFn(resolve, reject) {
    if (this.current < this.max) {
      this.current = ++this.num;
      try {
        const res = await this.fn();
        resolve(res);
      } catch (error) {
        reject(error);
      }
      this.callback();
    } else {
      this.queue.push(this.handleFn.call(this, resolve, reject))
    }
  }
}