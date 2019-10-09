import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { getInternautaUrl, BaseUrlType } from "../../environments/app-constants";
import { NextSDREntityProvider } from "@nfa/next-sdr";
import { ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";

@Injectable()
export class UtenteStrutturaService extends NextSDREntityProvider {

    constructor(protected http: HttpClient, protected datepipe: DatePipe) {
      super(http, datepipe, ENTITIES_STRUCTURE.baborg.utentestruttura, getInternautaUrl(BaseUrlType.Baborg));
    }

}


