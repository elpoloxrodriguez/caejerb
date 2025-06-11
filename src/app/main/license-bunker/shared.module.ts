// shared.module.ts
import { CommonModule } from '@angular/common'; // Añade esta importación
import { NgModule } from '@angular/core';
import { LicenseBunkerComponent } from './license-bunker.component';

@NgModule({
  declarations: [LicenseBunkerComponent],
  imports: [CommonModule], // Añade esto
  exports: [LicenseBunkerComponent]
})
export class SharedModule { }