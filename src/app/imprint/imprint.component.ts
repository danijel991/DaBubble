import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserDataService } from '../service-moduls/user.service';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent {

    constructor(
      private location: Location,
      private router: Router,
      public userDataService: UserDataService,
    ) { }

    navigateBack() {
      this.location.back();
    }

    rootPage() {
      const userId = this.userDataService.currentUser;

      if (userId === '') {
        this.router.navigateByUrl('/');
      } else {
        this.router.navigateByUrl(`/board/${userId}`);
      }
    }
}
