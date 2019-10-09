import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
// import { FilterDefinition, SortDefinition, FiltersAndSorts, SORT_MODES, FILTER_TYPES } from "@bds/nt-communicator";
import { Azienda, Struttura } from "@bds/ng-internauta-model";
import { NextSdrServiceQueringWrapper, FiltersAndSorts, FilterDefinition, FILTER_TYPES, SortDefinition, SORT_MODES } from "@nfa/next-sdr";
import { StrutturaServiceNext } from "src/app/services/struttura.service";
import { PROJECTIONS } from "@bds/nt-communicator";


// ***********************************************
// NB
// DEPRECATO. usa app-combo-strutture-new invece
// ***********************************************
@Component({
  selector: "app-combo-strutture",
  templateUrl: "./combo-strutture.component.html",
  styleUrls: ["./combo-strutture.component.css"]
})
export class ComboStruttureComponent implements OnInit {

  private strutturaSelezionata: Struttura;
  public filteredstrutture: Struttura[];
  public _strutturaIniziale: Struttura;
  public _enabled: boolean = true;
  public serviceStruttureFiltrate: NextSdrServiceQueringWrapper;

  public _azienda: Azienda;

  @Input() set enabled(value: boolean) {
    this._enabled = value;
  }

  @Input() set strutturaIniziale(value: Struttura) {
    this._strutturaIniziale = value;
    if (this._strutturaIniziale) {
      this._strutturaIniziale["campoCustom"] = this._strutturaIniziale.nome + (this._strutturaIniziale.codice == null ? "" : " [" + this._strutturaIniziale.codice + "]");
    }
  }

  @Input() set azienda(value: Azienda) {
    this._azienda = value;
    if (this._azienda) {
      this.serviceStruttureFiltrate = {
        service: this.strutturaService,
        initialFiltersAndSorts: this.initialBuildStrutture(),
        projection: PROJECTIONS.struttura.standardProjections.StrutturaWithIdAzienda,
      };
    }
  }

  @Output() strutturaSelezionataEmit = new EventEmitter<Struttura>();

  // private filtersAndSorts: FiltersAndSorts;

  constructor(private strutturaService: StrutturaServiceNext) { }

  ngOnInit() {

  }

  /* private buildFiltersAndSorts(stringToSearch: string): FiltersAndSorts {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("idAzienda.id" , FILTER_TYPES.not_string.equals, this._azienda.id));
    filtersAndSorts.addFilter(new FilterDefinition("attiva" , FILTER_TYPES.not_string.equals, true));
    if (stringToSearch) {
      filtersAndSorts.addFilter(new FilterDefinition("nome" , FILTER_TYPES.string.containsIgnoreCase, stringToSearch));
    }
    filtersAndSorts.addSort(new SortDefinition("nome", SORT_MODES.asc));
    return filtersAndSorts;
  } */
  private initialBuildStrutture(): FiltersAndSorts {
    const initialConstraints: FiltersAndSorts = new FiltersAndSorts();
    initialConstraints.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._azienda.id));
    initialConstraints.addFilter(new FilterDefinition("attiva", FILTER_TYPES.not_string.equals, true));
    initialConstraints.addSort(new SortDefinition("nome", SORT_MODES.asc));
    return initialConstraints;
  }

  /* private filter(event) {
    this.filtersAndSorts = this.buildFiltersAndSorts(event.query);
        this.strutturaService.getData(null, this.filtersAndSorts, null).then(data => {
      if (data && data.results) {
        this.filteredstrutture = data.results;
      } else {
        this.filteredstrutture = [];
      }
    });
  } */

  private select(event) {
    this.strutturaSelezionata = event;
    this.strutturaSelezionataEmit.emit(this.strutturaSelezionata);
  }

  public handleEvent(nome: string, event) {
    switch (nome) {
      /* case "completeMethod":
        this.filter(event);
        break; */
      case "onSelect":
        this.select(event);
        break;
    }
  }

  public createQueryParamsComboStrutture(event: any): FiltersAndSorts {
    const filters: FiltersAndSorts = new FiltersAndSorts();
    filters.addFilter(new FilterDefinition("nome", FILTER_TYPES.string.containsIgnoreCase, event.query));
    return filters;
  }

  public trasformValuesAfterSearch(values: any[]): any[] {
    values.forEach(element => {
      element["campoCustom"] = element.nome + (element.codice == null ? "" : " [" + element.codice + "]");
    });

    return values;
  }
}
