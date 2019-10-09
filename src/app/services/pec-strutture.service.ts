import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { getInternautaUrl, BaseUrlType } from "src/environments/app-constants";
import { PermissionManagerService } from "@bds/nt-communicator";
import { DatePipe } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class PecStruttureService extends PermissionManagerService {

  constructor(protected _http: HttpClient, protected datepipe: DatePipe) {
    super(_http, getInternautaUrl(BaseUrlType.Permessi), datepipe);
  }

}
