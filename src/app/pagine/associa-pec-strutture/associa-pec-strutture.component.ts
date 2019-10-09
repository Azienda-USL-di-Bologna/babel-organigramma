import { Component, OnInit } from "@angular/core";
import { Azienda, Struttura, UtenteStruttura, CODICI_RUOLO } from "@bds/ng-internauta-model";
import { ActivatedRoute } from "@angular/router";
import { AziendaService } from "src/app/services/azienda-service";
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES } from "@nfa/next-sdr";
import { NtJwtLoginService } from "@bds/nt-jwt-login";

@Component({
  selector: "app-associa-pec-strutture",
  templateUrl: "./associa-pec-strutture.component.html",
  styleUrls: ["./associa-pec-strutture.component.css"]
})
export class AssociaPecStruttureComponent implements OnInit {
  private componentDefinition = "AssociaPecStruttureComponent";

  public _aziendaSelezionata: Azienda;
  public _strutturaSelezionata: Struttura;
  public _utenteStrutturaSelezionatoDaCombo: UtenteStruttura;
  // devo fare un oggetto che mi passi sia azienda che struttura
  // perchè devo basare l'ngIf del componente figlio sull'unico oggetto
  // che cambia e che quando leggo fa scattare il caricamento
  // se no c'è il rischio che uno dei due dati non sia ancora settato quando scatta il caricamento
  // TODO: Provare con gli observable. Questo mi sembra un po un accrocchio
  public _aziendaAndStruttura: any;


  constructor(
    private route: ActivatedRoute,
    private aziendaService: AziendaService) { }

  ngOnInit() {

    const idAzienda = this.route.snapshot.queryParams["idAzienda"];
    if (idAzienda) {
      const filter: FiltersAndSorts = new FiltersAndSorts();
      filter.addFilter(new FilterDefinition("id", FILTER_TYPES.not_string.equals, idAzienda));
      this.aziendaService.getData(null, filter).subscribe(data => {
        this._aziendaSelezionata = data.results[0];
      });
    }
  }

  public aziendaSelezionataRecived(event: Azienda) {
    this._aziendaSelezionata = event;
    console.log("aziendaSelezionataRecived", this._aziendaSelezionata);
    // se non metto questo if mi dà l'errore ExpressionChangedAfterItHasBeenCheckedError
    // perchè _strutturaSelezionata è in un ngIf
    if (this._strutturaSelezionata) {
      this._strutturaSelezionata = null;
    }
  }

  public strutturaSelezionataRecived(event: Struttura) {
    // se non metto questo setTimeout mi dà l'errore ExpressionChangedAfterItHasBeenCheckedError
    // perchè _aziendaAndStruttura è in un ngIf

    console.log(this.componentDefinition, "strutturaSelezionataRecived", event);
    this._strutturaSelezionata = event;
    this._aziendaAndStruttura = {
      azienda: this._aziendaSelezionata,
      struttura: this._strutturaSelezionata
    };
  }

}
