import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AziendaService } from "../../services/azienda-service";
import { Azienda, CODICI_RUOLO } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from "rxjs";
import { COD_AZIENDA_INESISTENTE } from "src/environments/app-constants";
import { FiltersAndSorts, FILTER_TYPES, FilterDefinition, SortDefinition, SORT_MODES } from "@nfa/next-sdr";


@Component({
  selector: "app-combo-aziende",
  templateUrl: "./combo-aziende.component.html",
  styleUrls: ["./combo-aziende.component.css"]
})
export class ComboAziendeComponent implements OnInit {

  public filteredAziende: Azienda[];
  public _descrizioneIniziale: string;
  public _enabled: boolean = true;
  public _readonly: boolean = false;
  public _filterByRole: boolean = false;
  public _azienda: Azienda[];
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;
  public _multiple: boolean = false;

  @Input() set azienda(value: Azienda[]) {
    if (value) {
      this._azienda = value;
      this.aziendaChange.emit(value);
    }
  }

  // @Input() azienda: Azienda[];

  @Input() set enabled(value: boolean) {
    this._enabled = value;
  }

  @Input() set readonly(value: boolean) {
    this._readonly = value;
  }

  /**
   * se true mostro solo le aziende che l'utente può vedere in base al ruolo. La politica è la seguente
   * CI: vede tutte le aziende
   * CA: vede solo le aziende di cui è CA
   * altri ruoli aziendali: non vedo niente
   */
  @Input() set filterByRole(value: boolean) {
    this._filterByRole = value;
  }

  @Input() set multiple(value: boolean) {
    this._multiple = value;
  }

  @Output() aziendaChange: EventEmitter<Azienda[]> = new EventEmitter();

  private filtersAndSorts: FiltersAndSorts;

  constructor(
    private aziendaService: AziendaService,
    private loginService: NtJwtLoginService
    ) {
      this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
        this.loggedUtenteUtilities = utenteUtilities;
      })
      );
    }

  ngOnInit() {
  }

  private buildFiltersAndSorts(stringToSearch: string): FiltersAndSorts {
    const filtersAndSorts = new FiltersAndSorts();
    if (this._filterByRole) {
      if (!this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
        if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CA)) {
          this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona[CODICI_RUOLO.CA].forEach(element => {
            filtersAndSorts.addFilter(new FilterDefinition("codice" , FILTER_TYPES.string.equals, element));
          });
        } else {
          // se non ho i ruoli richiesti non devo recuperare nessun'azienda. Modo brutto per farlo. filtro per un codice_azienda che non esiste
          filtersAndSorts.addFilter(new FilterDefinition("codice" , FILTER_TYPES.string.equals, COD_AZIENDA_INESISTENTE));
        }
      }
    }
    if (stringToSearch) {
      filtersAndSorts.addFilter(new FilterDefinition("descrizione" , FILTER_TYPES.string.containsIgnoreCase, stringToSearch));
    }
    filtersAndSorts.addSort(new SortDefinition("descrizione", SORT_MODES.asc));
    return filtersAndSorts;
  }

  private filter(event) {
    this.filtersAndSorts = this.buildFiltersAndSorts(event.query);
        this.aziendaService.getData(null, this.filtersAndSorts).subscribe(data => {
      if (data && data.results) {
        this.filteredAziende = data.results;
      } else {
        this.filteredAziende = [];
      }
    });
  }

  private select(event) {
    if (!this._multiple) {
      this.aziendaChange.emit(event);
    }
  }

  // serve una gestione diversa per il caso in cui l'autocomplete è multipla oppure no.
  public valueChange(event) {
    // se non si mettesse questo if, nel caso non multiple, scatterebbe l'emit ad ogni carattere che digitiamo
    // mentre vogliamo che venga emesso solo quando si seleziona il campo
    // stranamente quando è multipla invece, non scatta ogni volta e in quel caso voglio avere aggiornato l'array
    // ho bindato al widget e per farlo devo fare l'emit nel ngModelChange
    if (this._multiple) {
      this.aziendaChange.emit(event);
    }
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
