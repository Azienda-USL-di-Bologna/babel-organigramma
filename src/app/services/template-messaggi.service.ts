import { Injectable } from "@angular/core";
import { getInternautaUrl, BaseUrlType } from "src/environments/app-constants";
import {HttpClient} from "@angular/common/http";
import { NextSDREntityProvider } from "@nfa/next-sdr";
import { DatePipe } from "@angular/common";
import { ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";

@Injectable({
  providedIn: "root"
})
export class TemplateMessaggiService extends NextSDREntityProvider {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe, ENTITIES_STRUCTURE.messaggero.templatemessaggio, getInternautaUrl(BaseUrlType.Messaggero));
  }
}
