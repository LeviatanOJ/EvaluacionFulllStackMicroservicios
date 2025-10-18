import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  counter = signal(0);
  get loading() {
    return this.counter() > 0;
  }
  start() {
    this.counter.update((v) => v + 1);
  }
  stop() {
    this.counter.update((v) => Math.max(0, v - 1));
  }
}
