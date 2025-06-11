import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-license-bunker',
  templateUrl: './license-bunker.component.html',
  styleUrls: ['./license-bunker.component.scss']
})
export class LicenseBunkerComponent implements OnInit {
  public license: boolean = false;
  public isHovered: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.checkLicense();

  }

async checkLicense(): Promise<void> {
  try {
    // Add mode: 'no-cors' if you don't need to read the response
    const response = await fetch('https://bunkertechsolutions.com', {
      mode: 'no-cors' // This will let the request go through but you won't read response
    });
    // With no-cors, you can't read the response but the request will complete
    this.license = true;
  } catch (error) {
    this.license = false;
  }
}
}
