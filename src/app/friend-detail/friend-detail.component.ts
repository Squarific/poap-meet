import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-friend-detail',
  templateUrl: './friend-detail.component.html',
  styleUrls: ['./friend-detail.component.scss'],
})

export class FriendDetailComponent implements OnInit {
  @Input() friend?: any;
  @Input() ourPoaps?: any;


  constructor() {
    
  }

  ngOnInit() {}

  getCommonPoaps() {
    if (!this.friend) return [];
    if (!this.ourPoaps) return this.friend.poaps;

    return this.friend.poaps.filter(poap => this.isAlsoOurPoap(poap));
  }

  isAlsoOurPoap (target) {
    return this.ourPoaps.some(poap => poap.event.id == target.event.id);
  }
}
