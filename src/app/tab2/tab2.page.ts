import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  friends = {};             // Hashmap of addresses of people we are friends with
  friendLinks = [];         // List of links of our friends
  peopleWeInvited = {};     // Hashmap of addresses of people we sent a request to
  peopleThatInvitedUs = {}; // Hashmap of addresses of people that sent us a request
  cache = 0;

  ourPoaps;
  ourPoapsPromise;

  constructor(private http: HttpClient) {
    this.http.get('http://poapmeet.xyz:8080/friends/' + localStorage.getItem("publickey")).subscribe((invites) => {
      this.processInvites(invites);
      this.getFriendLinks();
    });

    this.getOurPoaps();
    //setInterval(() => { this.processWeInvited("test" + Math.random()) }, 1000);
  }

  countKeys (map) {
    return Object.keys(map).length;
  }

  processInvites (invites) {
    for (var k = 0; k < invites.length; k++) {
      this.processInvite(invites[k]);
    }

    this.cache++;
  }

  processInvite (invite) {
    var ourAddress = (localStorage.getItem("publickey") || "").toLowerCase();

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
    this.cache++;
  }

  async getPoapsForInvite (invite) {
    //await this.ourPoapsPromise;
    invite.poaps = await this.getPoaps(invite.address);
    this.cache++;
  }

  async getPoaps (address) {
    try {
      return await this.http.get('https://api.poap.xyz/actions/scan/' + address).toPromise();
    } catch (err) {
      console.log("Loading poaps error: ", err);
      return [];
    }
  }

  getFriendWithoutLinks () {
    for (var address in this.friends) {
      if (!this.friends[address].processedLinks) {
        return address;
      }
    }
  }

  getFriendLinks () {
    var target = this.getFriendWithoutLinks();    

    if (target) {
      this.friends[target].processedLinks = true;

      this.http.get('http://poapmeet.xyz:8080/friends/' + target).subscribe((invites) => {
        this.processFriendLink(target, invites);
      });
    }

    setTimeout(() => {
      this.getFriendLinks();
    }, 500);
  }

  processFriendLink (address, invites) {
    var tempFriends = {};
    var tempInvites = {};

    for (var k = 0; k < invites.length; k++) {
      var target = invites[k].initiator;
      if (target == address) target = invites[k].target;
      
      if (!tempInvites[target]) tempFriends[target] = true;
      else tempInvites[target] = true;
    }

    for (var friendAddress in tempFriends) {
      this.friendLinks.push([address, friendAddress]);
    }

    this.cache++;
  }

  ionViewWillEnter() {
    this.friends = {};
    this.peopleWeInvited = {};
    this.peopleThatInvitedUs = {};

    this.http.get('http://poapmeet.xyz:8080/friends/' + localStorage.getItem("publickey")).subscribe((invites) => {
      this.processInvites(invites);
    });

    this.getOurPoaps();
  }
}
