import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  friends = {};             // Hashmap of addresses of people we are friends with
  peopleWeInvited = {};     // Hashmap of addresses of people we sent a request to
  peopleThatInvitedUs = {}; // Hashmap of addresses of people that sent us a request

  ourPoaps;
  ourPoapsPromise;

  loading = true;

  constructor(private http: HttpClient) {
    this.http.get('http://poapmeet.xyz:8080/friends/' + localStorage.getItem("publickey")).subscribe((invites) => {
      this.processInvites(invites);
      this.loading = false;
    });

    this.getOurPoaps();
    //setInterval(() => { this.processWeInvited("test" + Math.random()) }, 1000);
  }

  processInvites (invites) {
    for (var k = 0; k < invites.length; k++) {
      this.processInvite(invites[k]);
    }
  }

  processInvite (invite) {
    var ourAddress = localStorage.getItem("publickey");

    if (invite.initiator == ourAddress) {
      this.processWeInvited(invite.target);
    } else if (invite.target == ourAddress) {
      this.processWeGotInvited(invite.initiator)
    }
  }

  processWeInvited (otherPartyAddress) {
    // If they also invited us already, become friends
    if (this.peopleThatInvitedUs[otherPartyAddress]) {
      this.friends[otherPartyAddress] = this.peopleThatInvitedUs[otherPartyAddress];
      delete this.peopleThatInvitedUs[otherPartyAddress];

    // Just add them to the list of people that we invited
    } else {
      this.peopleWeInvited[otherPartyAddress] = {
        address: otherPartyAddress,
        poaps: []
      };

      this.getPoapsForInvite(this.peopleWeInvited[otherPartyAddress]);
    }
  }

  processWeGotInvited (otherPartyAddress) {
    // If they also invited us already, become friends
    if (this.peopleWeInvited[otherPartyAddress]) {
      this.friends[otherPartyAddress] = this.peopleWeInvited[otherPartyAddress];
      delete this.peopleWeInvited[otherPartyAddress];

    // Just add them to the list of people that we invited
    } else {
      this.peopleThatInvitedUs[otherPartyAddress] = {
        address: otherPartyAddress,
        poaps: []
      };

      this.getPoapsForInvite(this.peopleThatInvitedUs[otherPartyAddress]);
    }
  }

  async getOurPoaps () {
    this.ourPoaps = await this.getPoaps(localStorage.getItem('publickey'));
  }

  async getPoapsForInvite (invite) {
    //await this.ourPoapsPromise;
    invite.poaps = await this.getPoaps(invite.address);
  }

  async getPoaps (address) {
    try {
      return await this.http.get('https://api.poap.xyz/actions/scan/' + address).toPromise();
    } catch (err) {
      console.log("Loading poaps error: ", err);
      return [];
    }
  }

  ionViewWillEnter() {
    this.friends = {};
    this.peopleWeInvited = {};
    this.peopleThatInvitedUs = {};

    this.loading = true;

    this.http.get('http://poapmeet.xyz:8080/friends/' + localStorage.getItem("publickey")).subscribe((invites) => {
      this.processInvites(invites);
      this.loading = false;
    });

    this.getOurPoaps();
  }
}
