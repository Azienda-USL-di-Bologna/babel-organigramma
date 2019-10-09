import { Injectable } from "@angular/core";
import { ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";
import { HttpClient } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { getInternautaUrl, BaseUrlType } from "src/environments/app-constants";
import { NextSDREntityProvider } from "@nfa/next-sdr";

@Injectable({
  providedIn: "root"
})
export class RibaltoneDaLanciareService extends NextSDREntityProvider {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe, ENTITIES_STRUCTURE.ribaltoneutils.ribaltonedalanciare, getInternautaUrl(BaseUrlType.RibaltoneUtils));
  }
}
