import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { HttpClientModule } from '@angular/common/http';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { FriendDetailComponent } from '../friend-detail/friend-detail.component';
import { FriendGraphComponent } from '../friend-graph/friend-graph.component';

import { Tab2PageRoutingModule } from './tab2-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule
  ],
  declarations: [Tab2Page, FriendDetailComponent, FriendGraphComponent]
})
export class Tab2PageModule {}
