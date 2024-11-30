import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/store/Authentication/auth.models';
import { environment } from 'src/environments/environment'

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient) { }
    /***
     * Get All User
     */
    getAll() {
        return this.http.get<User[]>(`api/users`);
    }

    /***
     * Facked User Register
     */
    register(user: User) {
        return this.http.post(`/users/register`, user);
    }
    OpenPoList(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/OpenPoList`,data)
        // return this.http.post(<url.API_URL_DEV>`/api/external/OpenPoList`,data)
    }
    OpenINBOUND(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/OpenINBOUND`,data)
       
    }

    saveInbound(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/InboundCreate`,data)
     
    }
    grnlist(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/grnlist`,data)
     
    }
    zprClose(data){
        return this.http.post(`${environment.API_URL_DEV}api/external/zprClose`,data)
    }

}
