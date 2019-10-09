import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NtJwtLoginService } from "@bds/nt-jwt-login";
import { CODICI_RUOLO, Struttura } from "@bds/ng-internauta-model";

@Component({
  selector: "app-tabella-associa-pec-strutture-wrapper",
  templateUrl: "./tabella-associa-pec-strutture-wrapper.component.html",
  styleUrls: ["./tabella-associa-pec-strutture-wrapper.component.css"]
})
export class TabellaAssociaPecStruttureWrapperComponent implements OnInit {

  public _aziendaAndStruttura: any;
  public _strutturaSelezionata: Struttura;

  public _CODICI_RUOLO: any;

  @Input() set aziendaAndStruttura(value: any) {
    this._aziendaAndStruttura = value;
    if (value) {
      this._strutturaSelezionata = value.struttura;
    }
  }

  constructor(
    public loginService: NtJwtLoginService
  ) { }

  ngOnInit() {
    this._CODICI_RUOLO = CODICI_RUOLO;
  }

}
