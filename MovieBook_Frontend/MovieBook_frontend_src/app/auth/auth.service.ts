import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthLoginInfo} from './login-info';
import {Observable} from 'rxjs';
import {JwtResponse} from './jwt-response';
import {SignupInfo} from './signup-info';
import { AuthChangePassInfo } from './changepass-info';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = 'http://localhost:8080/api/auth/login';
  private signupUrl = 'http://localhost:8080/api/auth/signup';
  private forgotpass = 'http://localhost:8080/api/auth/change_password';


  constructor(private http: HttpClient) {}

  attemptAuth(credentials: AuthLoginInfo): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(this.loginUrl, credentials, httpOptions);
  }

  signUp(info: SignupInfo): Observable<string> {
    return this.http.post<string>(this.signupUrl, info, httpOptions);
  }

    changePassword(info: AuthChangePassInfo): Observable<string> {
    const { username, newPassword, confirmPassword } = info; // Extract values from the info object
    const payload = { username, newPassword, confirmPassword };
    return this.http.post<string>(this.forgotpass, payload, httpOptions);
  }
}

