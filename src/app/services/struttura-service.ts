import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { CUSTOM_SERVER_METHODS, getInternautaUrl, BaseUrlType } from "../../environments/app-constants";
import { NextSDREntityProvider } from "@nfa/next-sdr";
import { ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";


@Injectable()
export class StrutturaService extends NextSDREntityProvider {

    constructor(protected http: HttpClient, protected datepipe: DatePipe) {
      super(http, datepipe, ENTITIES_STRUCTURE.baborg.struttura, getInternautaUrl(BaseUrlType.Baborg));
    }

    public getStruttureAntenate(idStruttura: number) {
      console.log("StrutturaService", "getStruttureAntenate");
      // metodo che data un' idStruttura ci restituisce un array con gli id delle sue strutture antenate
      // come primo elemento c'è il nodo radice e come ultimo il nodo passato come parametro
      const url = getInternautaUrl(BaseUrlType.Baborg) + "/" + CUSTOM_SERVER_METHODS.struttureAntenate + "/" + idStruttura;
      return this.http.get<Array<number>>(url)
      .toPromise()
      .then(data => {
          return data;
      });
    }


}
