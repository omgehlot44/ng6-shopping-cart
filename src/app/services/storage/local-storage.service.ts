import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService) { }

  public set(key: string, value: string) {
    this.storage.set(key, value);
  }

  public get(key: string) {
    return this.storage.get(key);
  }

  public clear(key: string) {
    this.storage.remove(key);
  }
}
