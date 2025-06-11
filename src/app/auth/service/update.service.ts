// shared/update.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private updateAvailableSubject = new Subject<boolean>();
  updateAvailable$ = this.updateAvailableSubject.asObservable();

  notifyUpdateAvailable(isAvailable: boolean) {
    this.updateAvailableSubject.next(isAvailable);
  }
}