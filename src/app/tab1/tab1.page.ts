import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ElementRef } from '@angular/core';
import { toCanvas as QRCodeToCanvas } from 'qrcode';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  scanActive: boolean = false;
  setup: boolean = false; //Are we set up?
  @ViewChild('qrtarget') qrtarget: ElementRef;

  constructor(private http: HttpClient) {  }

  async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        BarcodeScanner.openAppSettings();
        resolve(false);
      }
    });
  }

  async startScanner() {
    const allowed = await this.checkPermission();

    if (allowed) {
      this.scanActive = true;
      BarcodeScanner.hideBackground();
      document.body.style.background = "transparent";

      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        this.scanActive = false;
        document.body.style.background = "";

        this.http.post('https://poapmeet.xyz:8443/friends', {
          initiator: localStorage.getItem("publickey"),
          challenge: localStorage.getItem("challenge"),
          signature: localStorage.getItem("signedkey"),
          target: result.content
        }).subscribe((response) => {
          alert(result.content + ' has been added.');
        });

        
      } else {
        alert('NO DATA FOUND!');
      }
    } else {
      alert('NOT ALLOWED!');
    }
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  ionViewWillEnter() {
    if (!localStorage.getItem("publickey")) {
      this.setup = false;
    } else {
      this.setup = true;
      QRCodeToCanvas(this.qrtarget.nativeElement, localStorage.getItem("publickey"));
    }
  }

  ionViewWillLeave() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }
}
