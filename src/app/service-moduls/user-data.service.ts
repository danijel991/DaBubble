import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface UserDataInterface {
  id: string;
  name: string;
  email: string;
  createdAt?: any;
  status?: any;
}

@Injectable({
  providedIn: 'root'
})

export class UserDataService {

  users: UserDataInterface[] = [];

  constructor(
    public firestore: Firestore
  ) {}

  getUserData(): Observable<UserDataInterface[]> {
    const userCollection = collection(this.firestore, 'users');
    const q = query(userCollection);

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const storedUserData: UserDataInterface[] = [];

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const { name, email } = data;
          const user: UserDataInterface = {
            id: doc.id,
            name: name,
            email: email
          };
          storedUserData.push(user);
        });
        this.users = storedUserData;
        return storedUserData;
      })
    );
  }
}