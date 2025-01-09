import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/store/Authentication/auth.models';
import { environment } from 'src/environments/environment'
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    loginResponse: any;
    constructor(private http: HttpClient) { }
    /***
     * Get All User
     */
    getAll() {
        return this.http.get<User[]>(`api/users`);
    }

    setLoginResponse(data){
        this.loginResponse = data;
    }
    getLoginResponse(){
        return  this.loginResponse;
    }

   
    /***
     * Facked User Register
     */
    register(user: User) {
        return this.http.post(`/users/register`, user);
    }
    Login(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/Login`,data)

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

    GrPending(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/zprPending`,data)
    }
    QRRequest(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/qrcode`,data)
    }
    goodsreturn(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/goodsreturn`,data)
    }
    qrCodeSave(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.put(`${environment.API_URL_DEV}api/external/qrCodeSave`,data)
    }
    Grnprint(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/grnprint`,data)
    }
    fetchMb51Data(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/mb51`,data)

    }
    me23getData(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/me23`,data)
    }

    fetchMb52Data(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/mb52`,data)
    }
    print(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/print`,data)
    }
    zven(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/zven`,data)
    }
    zdebit(data){
        console.log("environment.API_URL_DEV",environment.API_URL_DEV)
        return this.http.post(`${environment.API_URL_DEV}api/external/zdebit`,data)
    }

    getLotReports(obj){
        console.log("environment.apiUrl",environment.apiUrl)
        return this.http.post(`${environment.apiUrl}orders/lot/reports`,obj)
    }
    updateResultRecording(obj){
        console.log("environment.apiUrl",environment.apiUrl)
        return this.http.post(`${environment.apiUrl}orders/resultrecord`,obj)
    }


}
