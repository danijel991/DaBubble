import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserDataService } from '../service-moduls/user.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent {

  constructor(private location: Location,
    private router: Router,
    public userDataService: UserDataService,) {}

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
