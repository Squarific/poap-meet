import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-friend-detail',
  templateUrl: './friend-detail.component.html',
  styleUrls: ['./friend-detail.component.scss'],
})

export class FriendDetailComponent implements OnInit {
  @Input() friend?: any;
  @Input() ourPoaps?: any;

  name: string;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('http://poapmeet.xyz:8080/name/' + this.friend.address + "/" + localStorage.getItem('publickey')).subscribe((response: any) => {
      this.name = response && response[0] && response[0].name;
    });
  }

  changeName() {
    var name = prompt("What name should " + (this.friend || { address: "this address"}).address + " be? Leave empty to reset.");
    this.name = name;
    
    this.http.post('http://poapmeet.xyz:8080/name/' + this.friend.address + "/" + localStorage.getItem('publickey'), {
      initiator: localStorage.getItem("publickey"),
      challenge: localStorage.getItem("challenge"),
      signature: localStorage.getItem("signedkey"),
      name
    }).subscribe((response: string) => {});
  }

  countKeys (map) {
    return Object.keys(map).length;
  }

  getCommonPoaps() {
    if (!this.friend) return [];
    if (!this.ourPoaps) return this.friend.poaps;

    return this.friend.poaps.filter(poap => this.isAlsoOurPoap(poap));
  }

  isAlsoOurPoap (target) {
    return this.ourPoaps.some(poap => poap.event.id == target.event.id);
  }
}
