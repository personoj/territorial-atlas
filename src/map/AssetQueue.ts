interface Task {
  key: string;
  priority: number;
  running: boolean;
  controller: AbortController;
  run: (signal: AbortSignal) => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  promise: Promise<unknown>;
}

/** Bounds network/decode work and drops obsolete queued requests during navigation. */
export class AssetQueue {
  private tasks = new Map<string, Task>();
  private active = 0;
  private disposed = false;

  constructor(private concurrency = 3) {}

  enqueue<T>(
    key: string,
    priority: number,
    run: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const current = this.tasks.get(key);
    if (current) {
      current.priority = Math.min(current.priority, priority);
      return current.promise as Promise<T>;
    }
    if (this.disposed)
      return Promise.reject(new DOMException("地图已卸载", "AbortError"));
    let resolve!: (value: unknown) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise((yes, no) => {
      resolve = yes;
      reject = no;
    });
    const task: Task = {
      key,
      priority,
      running: false,
      controller: new AbortController(),
      run,
      resolve,
      reject,
      promise,
    };
    this.tasks.set(key, task);
    this.pump();
    return promise as Promise<T>;
  }

  retain(keys: Set<string>) {
    for (const [key, task] of this.tasks) {
      if (!task.running && !keys.has(key)) {
        this.tasks.delete(key);
        task.reject(new DOMException("定位已改变", "AbortError"));
      }
    }
  }

  prioritize(key: string, priority: number) {
    const task = this.tasks.get(key);
    if (task) task.priority = Math.min(task.priority, priority);
  }

  private pump() {
    if (this.disposed) return;
    while (this.active < this.concurrency) {
      const task = [...this.tasks.values()]
        .filter((item) => !item.running)
        .sort((a, b) => a.priority - b.priority)[0];
      if (!task) break;
      task.running = true;
      this.active++;
      Promise.resolve()
        .then(() => task.run(task.controller.signal))
        .then(task.resolve, task.reject)
        .finally(() => {
          this.tasks.delete(task.key);
          this.active--;
          this.pump();
        });
    }
  }

  destroy() {
    this.disposed = true;
    for (const task of this.tasks.values()) {
      if (task.running) task.controller.abort();
      else task.reject(new DOMException("地图已卸载", "AbortError"));
    }
    this.tasks.clear();
  }

  getState() {
    return {
      active: this.active,
      queued: [...this.tasks.values()].filter((task) => !task.running).length,
    };
  }
}
