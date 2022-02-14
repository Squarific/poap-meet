import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

class ChallengeReponse {
  challenge: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  challenge: string = 'Loading challenge...';

  constructor(private http: HttpClient) {
    this.http.post('http://localhost:3000/challenge', {}).subscribe((response: ChallengeReponse) => {
      this.challenge = response.challenge;
    });
  }


}
