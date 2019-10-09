
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Azienda, Struttura, UtenteStruttura } from "@bds/ng-internauta-model";
import { UtenteStrutturaService } from "../../services/utentestruttura-service";
import { PROJECTIONS, ADDIDTIONAL_DATA } from "../../../environments/app-constants";
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES, AdditionalDataDefinition, SORT_MODES, SortDefinition } from "@nfa/next-sdr";

@Component({
  selector: "app-dropdown-utenti",
  templateUrl: "./dropdown-utenti.component.html",
  styleUrls: ["./dropdown-utenti.component.css"]
})
export class DropDownUtentiComponent implements OnInit {


  public _utenteIniziale: UtenteStruttura = null;
  public filteredUtenti: UtenteStruttura[];
  public items: any[];
  public _struttura: Struttura;
  public _descrizioneIniziale: string;
  public _enabled: boolean;

  public _appendTo: string;
  public _style: any;

  public _azienda: Azienda;

  @Input() set enabled(value: boolean) {
    this._enabled = value;
  }

  @Input() set appendTo(value: string) {
    this._appendTo = value;
  }

  @Input() set style(value: any) {
    this._style = value;
  }

  @Input() set struttura(value: Struttura) {
    this._struttura = value;
  }

  @Input() set azienda(value: Azienda) {
    this._azienda = value;
  }

  // @Input() set utenteIniziale(value: UtenteStruttura) {
  //   this._utenteIniziale = value;
  // }

  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() filter: any;
  @Input() filterBy: any;

  @Output() utenteStrutturaSelezionatoEmit = new EventEmitter<UtenteStruttura>();

  private filtersAndSorts: FiltersAndSorts;

  constructor(private utenteStrutturaService: UtenteStrutturaService) { }

  ngOnInit() {
    console.log("in ngOnInit di dropDownUtenti");
    this._enabled = true;
    this.loadData();
  }

  private buildFiltersAndSorts(stringToSearch?: string): FiltersAndSorts {
    const filtersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("idUtente.attivo" , FILTER_TYPES.not_string.equals, true));
    if (this._azienda) {
      filtersAndSorts.addFilter(new FilterDefinition("idStruttura.idAzienda.id" , FILTER_TYPES.not_string.equals, this._azienda.id));
    }
    if (this._struttura) {
      filtersAndSorts.addFilter(new FilterDefinition("idStruttura.id", FILTER_TYPES.not_string.equals, this._struttura.id));
    }

    if (stringToSearch) {
      filtersAndSorts.addAdditionalData(new AdditionalDataDefinition(ADDIDTIONAL_DATA.utentestruttura.filterCombo , stringToSearch));
    }

    filtersAndSorts.addSort(new SortDefinition("idUtente.idPersona.cognome", SORT_MODES.asc));
    filtersAndSorts.addSort(new SortDefinition("idUtente.idPersona.nome", SORT_MODES.asc));

    return filtersAndSorts;
  }

  private loadData() {
    this.items = [];
    this.filtersAndSorts = this.buildFiltersAndSorts();
        this.utenteStrutturaService.getData(PROJECTIONS.utentestruttura.customProjections.UtenteStrutturaWithIdAfferenzaStrutturaCustom,
          this.filtersAndSorts, null).subscribe(data => {
      if (data && data.results) {
        this.filteredUtenti = data.results;
        this.filteredUtenti.forEach(element => {
          const label =  element.idUtente.idPersona.cognome + " " + element.idUtente.idPersona.nome
          + " (" +  element.idStruttura.nome + ") - " + element.idAfferenzaStruttura.descrizione;
          this.items.push({label: label, value: element});
        });
      } else {
        this.items = [];
      }
    });
  }

  public onChange(event: any) {
    console.log("onChange", event);
  }

  public onClick(event: any) {
    console.log("onClick", event);
  }


  // private select(event) {
  //   this.utenteSelezionato = event;
  //   this.utenteStrutturaSelezionatoEmit.emit(this.utenteSelezionato);
  // }



  // public handleEvent(nome: string, event){
  //   switch(nome){
  //     case "completeMethod":
  //       this.filter(event);
  //       break;
  //     // case "onSelect":
  //     //   this.select(event);
  //     //   break;
  //   }
  // }
}
