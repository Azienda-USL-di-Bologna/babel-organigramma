import { Injectable  } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RibaltoneService {

    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    lanciaRibaltone(url: string, body: any, options: any){
        return this.http.post(url, body, options).subscribe(res => console.log(res))
    }
    
}


