import { Injectable } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';


import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class AuthService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;

  // private userDatabaseCheck: Observable<any[]>;
  // private userDatabaseCheckDetails: any[] = null;

  public busca: any;

  constructor(private _firebaseAuth: AngularFireAuth, private router: Router, private db: AngularFireDatabase) {

    /*
    this.db.list('/users/UrYMKpPRdDh6rL7zTk0hB0A1Aln1').push({
      email: 'gustavoafonso.gu@gmail.com',
      type: 'adm'
    });*/

    this.user = _firebaseAuth.authState;

    this.user.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
          // console.log(this.userDetails);
          // console.log(user);
          // console.log(user.providerData[0].providerId);

          this.checkUser();

          /* if (user.providerData[0].providerId !== 'google.com') {
            this.checkUser();
          } else {
            if (this.router.url === '/login') {
              this.router.navigate(['home']);
            }
          } */

        } else {
          this.userDetails = null;
        }
      }
    );


  }

  signInWithGoogle() {
    return this._firebaseAuth.auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    )
  }

  signInRegular(email, password) {

    const credential = firebase.auth.EmailAuthProvider.credential(email, password);

    return this._firebaseAuth.auth.signInWithEmailAndPassword(email, password).then((res => {

      this.router.navigate(['home']); // talvez nao precise desse kkkkk
    }));

  }

  checkUser() {
    // check se o user existe na base de dados (chamado quando o auth é positivo), se nao existir faz o logoff do auth
    console.log('checando user');

    // Verificar token para continuar logado

    const myRef = this.db.list('users/' + this.userDetails.uid).valueChanges();

    myRef.subscribe((busca) => {
      if (busca.length > 0) {
        // console.log(busca);
        // console.log('Ok');
        // this.router.navigate(['home']);
        this.busca = busca[0];
        console.log(busca[0]['type']);
        // localStorage.setItem('user_type', busca[0]['type']);

        // console.log(this.router.url);

        console.log('user autenticado');

        if (this.router.url === '/login') {
          this.router.navigate(['home']);
        }
      } else if (this.userDetails.providerData[0].providerId === 'google.com') {
        console.log('user anon');

        if (this.router.url === '/login') {
          this.router.navigate(['home']);
        }

      } else {

        console.log('nao autenticado nem anon, fazendo logout');
        this.logout();
      }
    });

    // console.log(myRef);
  }

  isLoggedIn() {
    if (this.userDetails == null) {
      return false;
    } else {
      return true;
    }
  }

  logout() {
    this._firebaseAuth.auth.signOut()
      .then((res) => this.router.navigate(['/']));
  }


  createUserEmailPassword(email, password, type): any {
    return this._firebaseAuth.auth.createUserWithEmailAndPassword(email, password).then((res => {

      //console.log(res);
      var uid;

      if(res.user.uid){
        uid = res.user.uid
      }
      /* else if(res.uid){
        uid = res.uid
      } */

      this.db.list('/users/' + uid + "/").push({
        email: email,
        type: type
      }).then((resp) => {
        // this.router.navigate(['home']);
      });

    })).catch((err) => {
      // console.log('error: ' + err)
      return err.message;
    });
  }

  updateUserPassword(newPassword) {
    this.userDetails.updatePassword(newPassword).then((res) => {
      // do stuff *meme*
    });
  }

}




