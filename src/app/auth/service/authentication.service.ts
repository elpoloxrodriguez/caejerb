import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { IToken, LoginService } from '@core/services/seguridad/login.service';
import jwt_decode from "jwt-decode";


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser: Observable<any>;
  public token
  public iToken: IToken = { token: '', };
  public itk: IToken;


  //private
  // private currentUserSubject: BehaviorSubject<User>;
  private currentUserSubject;
  /**
   *
   * @param {HttpClient} _http
   */
  constructor() {

      if (sessionStorage.getItem('token') != undefined || sessionStorage.getItem('token') != null) {
        this.token = jwt_decode(sessionStorage.getItem('token')) 
        this.currentUserSubject = new BehaviorSubject(this.token.Usuario[0])
        this.currentUser = this.currentUserSubject.asObservable();
      }  else {        
        this.currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('token')));
        this.currentUser = this.currentUserSubject.asObservable();
    }
  }
  
  // getter: currentUserValue
  public get currentUserValue() {
    return this.currentUserSubject.value;
  }



  /**
   * User logout
   *
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    // notify
    this.currentUserSubject.next(null);
  }
}
