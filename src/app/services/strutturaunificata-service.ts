import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import {  getInternautaUrl, BaseUrlType } from "../../environments/app-constants";
import { StrutturaUnificata, ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";
import { Observable } from "rxjs";
import { NextSDREntityProvider, BatchOperation } from "@nfa/next-sdr";

@Injectable()
export class StrutturaUnificataService extends NextSDREntityProvider {
  private classDescriptionLocal = "StrutturaUnificataService";

  constructor(protected http: HttpClient, protected datepipe: DatePipe) {
    super(http, datepipe, ENTITIES_STRUCTURE.baborg.strutturaunificata, getInternautaUrl(BaseUrlType.Baborg));
  }

  update(elementToUpdate: StrutturaUnificata): Observable<any> {
    return super.patchHttpCall(elementToUpdate, elementToUpdate.id);
  }

  insert(elementToInsert: StrutturaUnificata, datepipe: DatePipe): Observable<any> {
    return super.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: StrutturaUnificata): Observable<any> {
    return super.deleteHttpCall(elementToDelete.id);
  }

  batch(batchOperations: BatchOperation[]): Observable<any> {
    return super.batchHttpCall(batchOperations);
  }

}

