import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

class ChallengeReponse {
  challenge: string;
}

class VerifyResponse {
  correct: boolean;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  scanActive: boolean = false;

  challenge: string = localStorage.getItem('challenge') || 'Loading challenge...';
  publicKey: string = localStorage.getItem('publickey');
  signedKey: string = localStorage.getItem('signedkey');
  loggedIn: boolean = false;
  error: string = "";

  constructor(private http: HttpClient) {
    if (this.challenge == 'Loading challenge...') {
      this.loggedIn = false;
      this.http.post('http://poapmeet.xyz:8080/challenge', {}).subscribe((response: ChallengeReponse) => {
        this.challenge = response.challenge;
      });
    } else {
      this.loggedIn = true;
    }
  }

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
        this.publicKey = result.content.split("-")[0];
        this.signedKey = result.content.split("-")[1];
        this.login();
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

  ionViewWillLeave() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  login () {
    const from = this.publicKey;
    const challenge  = this.challenge;
    const signature = this.signedKey;

    this.error = "";

    this.http.post('http://poapmeet.xyz:8080/verifySignature', {
      from: from,
      challenge: challenge,
      signature: signature
    }).subscribe((response: VerifyResponse) => {
      if (response.correct) {
        localStorage.setItem('publickey', from);
        localStorage.setItem('challenge', challenge);
        localStorage.setItem('signedkey', signature);
        this.loggedIn = true;
      } else {
        this.error = "Invalid signature!";
      }
    });
  }

  logout () {
    localStorage.setItem('publickey', '');
    localStorage.setItem('challenge', '');
    localStorage.setItem('signedkey', '');
    this.publicKey = '';
    this.challenge = '';
    this.signedKey = '';
    this.loggedIn = false;
    this.http.post('http://poapmeet.xyz:8080/challenge', {}).subscribe((response: ChallengeReponse) => {
      this.challenge = response.challenge;
    });
  }
}
