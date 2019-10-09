import { Component, OnInit } from "@angular/core";
import { Azienda, Struttura, UtenteStruttura, CODICI_RUOLO } from "@bds/ng-internauta-model";
import { ActivatedRoute } from "@angular/router";
import { AziendaService } from "src/app/services/azienda-service";
import { NtJwtLoginService } from "@bds/nt-jwt-login";
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES } from "@nfa/next-sdr";

@Component({
  selector: "app-organigramma",
  templateUrl: "./organigramma.component.html",
  styleUrls: ["./organigramma.component.css"]
})
export class OrganigrammaComponent implements OnInit {

  public _aziendaSelezionata: Azienda;
  public _aziendaInput: Azienda;
  public _strutturaSelezionata: Struttura;
  public _utenteStrutturaSelezionatoDaCombo: UtenteStruttura;
  public _totalUtentiInStruttura: number;
  public totalUtentiInStrutturaText: string;
  public CODICI_RUOLO: any;


  constructor(
    public loginService: NtJwtLoginService,
    private route: ActivatedRoute,
    private aziendaService: AziendaService) { }

  ngOnInit() {
    this.CODICI_RUOLO = CODICI_RUOLO;

    const idAzienda = this.route.snapshot.queryParams["idAzienda"];
    if (idAzienda) {
      const filter: FiltersAndSorts = new FiltersAndSorts();
      filter.addFilter(new FilterDefinition("id", FILTER_TYPES.not_string.equals, idAzienda));
      this.aziendaService.getData(null, filter).subscribe(data => {
        this._aziendaInput = data.results[0];
      });
    }
}

  public aziendaSelezionataRecived(event: Azienda) {
    this._aziendaSelezionata = event;
    // se non metto questo if mi dà l'errore ExpressionChangedAfterItHasBeenCheckedError
    // perchè _strutturaSelezionata è in un ngIf
    if (this._strutturaSelezionata) {
      this._strutturaSelezionata = null;
    }
  }

  public strutturaSelezionataRecived(event: Struttura) {
    // se non metto questo setTimeout mi dà l'errore ExpressionChangedAfterItHasBeenCheckedError
    // perchè _strutturaSelezionata è in un ngIf
    setTimeout(() => {
      this._strutturaSelezionata = event;
    }, 0);
  }

  public utenteStrutturaSelezionatoDaComboRecived(event: UtenteStruttura) {
    this._utenteStrutturaSelezionatoDaCombo = event;
  }

  public totalElementTabellaUtentiRecived(event: number) {
    this._totalUtentiInStruttura = event;
    this.totalUtentiInStrutturaText = "";
    this.totalUtentiInStrutturaText = this._totalUtentiInStruttura === 1 ? " (" + this._totalUtentiInStruttura + " utente)" : " (" + this._totalUtentiInStruttura + " utenti)";
  }



}
