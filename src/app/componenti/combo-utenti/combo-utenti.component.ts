import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Azienda, Struttura, UtenteStruttura } from "@bds/ng-internauta-model";
import { UtenteStrutturaService } from "../../services/utentestruttura-service";
import { PROJECTIONS, ADDIDTIONAL_DATA } from "../../../environments/app-constants";
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES, AdditionalDataDefinition, SORT_MODES, SortDefinition } from "@nfa/next-sdr";

@Component({
  selector: "app-combo-utenti",
  templateUrl: "./combo-utenti.component.html",
  styleUrls: ["./combo-utenti.component.css"]
})
export class ComboUtentiComponent implements OnInit {


  private utenteSelezionato: UtenteStruttura = null;
  public _utenteIniziale: UtenteStruttura = null;
  public filteredUtenti: UtenteStruttura[];
  public _struttura: Struttura;
  public _enabled: boolean = true;

  public _azienda: Azienda;

  @Input() set enabled(value: boolean) {
    this._enabled = value;
  }

  @Input() set struttura(value: Struttura) {
    this._struttura = value;
  }

  @Input() set azienda(value: Azienda) {
    this._azienda = value;
  }

  @Input() set utenteIniziale(value: UtenteStruttura) {
    this._utenteIniziale = value;
  }

  @Output() utenteStrutturaSelezionatoEmit = new EventEmitter<UtenteStruttura>();

  private filtersAndSorts: FiltersAndSorts;

  constructor(private utenteStrutturaService: UtenteStrutturaService) { }

  ngOnInit() {
   // this._enabled = true;
  }

  private buildFiltersAndSorts(stringToSearch: string): FiltersAndSorts {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("idUtente.attivo", FILTER_TYPES.not_string.equals, true));
    if (this._azienda) {
      filtersAndSorts.addFilter(new FilterDefinition("idStruttura.idAzienda.id", FILTER_TYPES.not_string.equals, this._azienda.id));
    }
    if (this._struttura) {
      filtersAndSorts.addFilter(new FilterDefinition("idStruttura.id", FILTER_TYPES.not_string.equals, this._struttura.id));
    }

    if (stringToSearch) {
      filtersAndSorts.addAdditionalData(new AdditionalDataDefinition(ADDIDTIONAL_DATA.utentestruttura.filterCombo, stringToSearch));
    }

    filtersAndSorts.addSort(new SortDefinition("idUtente.idPersona.cognome", SORT_MODES.asc));
    filtersAndSorts.addSort(new SortDefinition("idUtente.idPersona.nome", SORT_MODES.asc));

    return filtersAndSorts;
  }

  private filter(event) {
    this.filtersAndSorts = this.buildFiltersAndSorts(event.query);
    this.utenteStrutturaService.getData(PROJECTIONS.utentestruttura.customProjections.UtenteStrutturaWithIdAfferenzaStrutturaCustom,
      this.filtersAndSorts, null).subscribe(data => {
        if (data && data.results) {
          this.filteredUtenti = data.results;
          this.filteredUtenti.forEach(element => {
            element["campoDaMostrare"] = element.idUtente.idPersona.cognome + " " + element.idUtente.idPersona.nome
              + " (" + element.idStruttura.nome + ") - " + element.idAfferenzaStruttura.descrizione;
          });
        } else {
          this.filteredUtenti = [];
        }
      });
  }

  private select(event) {
    this.utenteSelezionato = event;
    this.utenteStrutturaSelezionatoEmit.emit(this.utenteSelezionato);
  }



  public handleEvent(nome: string, event) {
    switch (nome) {
      case "completeMethod":
        this.filter(event);
        break;
      case "onSelect":
        this.select(event);
        break;
      case "onClear":
        this.select(null);
        break;
    }
  }
}
