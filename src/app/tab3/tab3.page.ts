import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  challenge: string = localStorage.getItem('challenge') || 'Loading challenge...';
  publicKey: string = localStorage.getItem('publickey');
  signedKey: string = localStorage.getItem('signedkey');
  loggedIn: boolean = false;
  error: string = "";

  constructor(private http: HttpClient) {
    if (this.challenge == 'Loading challenge...') {
      this.loggedIn = false;
      this.http.post('http://poapmeet.xyz:3000/challenge', {}).subscribe((response: ChallengeReponse) => {
        this.challenge = response.challenge;
      });
    } else {
      this.loggedIn = true;
    }
  }

  login () {
    const from = this.publicKey;
    const challenge  = this.challenge;
    const signature = this.signedKey;

    this.error = "";

    this.http.post('http://poapmeet.xyz:3000/verifySignature', {
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
    this.http.post('http://poapmeet.xyz:3000/challenge', {}).subscribe((response: ChallengeReponse) => {
      this.challenge = response.challenge;
    });
  }
}
