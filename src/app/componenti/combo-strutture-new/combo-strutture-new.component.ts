import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Azienda, Struttura, ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES, SortDefinition, SORT_MODES, PagingConf } from "@nfa/next-sdr";
import { StrutturaServiceNext } from "src/app/services/struttura.service";

@Component({
  selector: "app-combo-strutture-new",
  templateUrl: "./combo-strutture-new.component.html",
  styleUrls: ["./combo-strutture-new.component.css"]
})
export class ComboStruttureNewComponent implements OnInit {

  private strutturaSelezionata: Struttura;
  public _filteredStrutture: Struttura[];
  public _strutturaIniziale: Struttura;
  public _enabled: boolean = true;


  public _azienda: Azienda;

  @Input() set enabled(value: boolean) {
    this._enabled = value;
  }

  @Input() set strutturaIniziale(value: Struttura) {
    this._strutturaIniziale = value;
  }

  @Input() set azienda(value: Azienda) {
    this._azienda = value;
  }

  @Output() strutturaSelezionataEmit = new EventEmitter<Struttura>();


  constructor(private strutturaService: StrutturaServiceNext) { }

  ngOnInit() {

  }


  private buildInitialFilterAndSorts(): FiltersAndSorts {
    const initialConstraints: FiltersAndSorts = new FiltersAndSorts();
    initialConstraints.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._azienda.id));
    initialConstraints.addFilter(new FilterDefinition("attiva", FILTER_TYPES.not_string.equals, true));
    initialConstraints.addSort(new SortDefinition("nome", SORT_MODES.asc));

    return initialConstraints;
  }

  public createQueryParams(filterAndSorts: FiltersAndSorts, event: any): FiltersAndSorts {
    if (event && event.query) {
      filterAndSorts.addFilter(new FilterDefinition("nome", FILTER_TYPES.string.containsIgnoreCase, event.query));
    }
    return filterAndSorts;
  }


  private buildPageConfig(): PagingConf {
    const pageConf: PagingConf = {
      conf: {
        page: 0,
        size: 20
      },
      mode: "PAGE"
    };
    return pageConf;
  }

  private filter(event) {
    this.strutturaService.getData(
      ENTITIES_STRUCTURE.baborg.struttura.customProjections.StrutturaWithIdAzienda,
      this.createQueryParams(this.buildInitialFilterAndSorts(), event),
      null,
      this.buildPageConfig()
      )
      .subscribe(
        res => {
          this._filteredStrutture = this.trasformValuesAfterSearch(res.results);
        }
      );
  }

  private select(event) {
    this.strutturaSelezionata = event;
    this.strutturaSelezionataEmit.emit(this.strutturaSelezionata);
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



  public trasformValuesAfterSearch(values: any[]): any[] {
    values.forEach(element => {
      element["campoDaMostrare"] = element.nome + (element.codice == null ? "" : " [" + element.codice + "]");
    });

    return values;
  }
}
