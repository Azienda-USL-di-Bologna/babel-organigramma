import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from "@angular/core";
import { DatePipe } from "@angular/common";
import { LazyLoadEvent } from "primeng/api";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { UtenteStrutturaService } from "../../services/utentestruttura-service";
import { PROJECTIONS } from "../../../environments/app-constants";
import { Struttura, UtenteStruttura } from "@bds/ng-internauta-model";
import { Table } from "primeng/table";
import { FiltersAndSorts, FILTER_TYPES, SortDefinition, FilterDefinition, SORT_MODES, PagingPageConf, PagingConf } from "@nfa/next-sdr";

@Component({
  selector: "app-tabella-utenti",
  templateUrl: "./tabella-utenti.component.html",
  styleUrls: ["./tabella-utenti.component.css"],
  providers: [DatePipe]
})
export class TabellaUtentiComponent implements OnInit {

  private componentDescription = "tabella-utenti";

  public cols: any[];

  public utentiStruttura: UtenteStruttura[];
  public _strutturaSelezionata: Struttura = null;
  public _utenteStrutturaSelezionatoDaCombo: UtenteStruttura = null;


  public totalRecords: number;
  public rows: number = 10;

  public loading: boolean = false;

  public selectedRow: UtenteStruttura;

  private initialFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();



  @ViewChild("dt", null) private dt: Table;

  @Input() set strutturaSelezionata(value: Struttura) {
    // this._utenteStrutturaSelezionatoDaCombo = null; // non so perchè c"era.. monitoriamo
    this._strutturaSelezionata = value;
    this.loadData(null);
  }

  @Input() set utenteSelezionato(value: UtenteStruttura) {
    this._utenteStrutturaSelezionatoDaCombo = value;
  }


  @Output() totalElementsEmit = new EventEmitter<number>();

  constructor(private utenteStrutturaService: UtenteStrutturaService, private datepipe: DatePipe) { }

  ngOnInit() {
    this.cols = [
      { field: "idUtente.idPersona.cognome", header: "Cognome", filterMatchMode: FILTER_TYPES.string.containsIgnoreCase },
      { field: "idUtente.idPersona.nome", header: "Nome", filterMatchMode: FILTER_TYPES.string.containsIgnoreCase },
      { field: "idUtente.idPersona.codiceFiscale", header: "Codice Fiscale", filterMatchMode: FILTER_TYPES.string.containsIgnoreCase },
      { field: "idAfferenzaStruttura.descrizione", header: "Afferenza", filterMatchMode: FILTER_TYPES.string.containsIgnoreCase }
    ];
  }

  public handleEvent(nome: string, event) {
    switch (nome) {
      case "onLazyLoad":
        this.loadLazy(event);
        break;
    }
  }

  private loadLazy(event: LazyLoadEvent) {
    this.loadData(event);
  }

  private loadData(event: LazyLoadEvent) {

    this.loading = true;

    this.lazyLoadFiltersAndSorts = buildLazyEventFiltersAndSorts(event, this.cols, this.datepipe);

    if (this._strutturaSelezionata) {
      this.initialFiltersAndSorts = this.buildInitialFiltersAndSorts(); // non so se è corretto metterlo qui o forse nel set strutturaSelezionata
      const pageConfNoLimit: PagingConf = {
        conf: {
          page: 0,
          size: 999999
        },
        mode: "PAGE"
      };
      this.utenteStrutturaService.getData(PROJECTIONS.utentestruttura.customProjections.UtenteStrutturaWithIdAfferenzaStrutturaCustom, this.initialFiltersAndSorts, this.lazyLoadFiltersAndSorts, pageConfNoLimit)
        .subscribe(
          data => {
            this.utentiStruttura = undefined;
            this.totalRecords = 0;
            if (data && data.results && data.page) {
              this.utentiStruttura = <UtenteStruttura[]>data.results;
              this.totalRecords = data.page.totalElements;
              if (this._utenteStrutturaSelezionatoDaCombo) {
                console.log("_utenteStrutturaSelezionatoDaCombo", this._utenteStrutturaSelezionatoDaCombo);
                // come selectedRow non gli posso passare direttamente this._utenteStrutturaSelezionatoDaCombo, ma devo filtrare this.utentiStruttura basandomi
                this.selectedRow = this.utentiStruttura.filter(e =>
                  this._utenteStrutturaSelezionatoDaCombo.idUtente.idPersona.codiceFiscale === e.idUtente.idPersona.codiceFiscale &&
                  this._utenteStrutturaSelezionatoDaCombo.idAfferenzaStruttura.codice === e.idAfferenzaStruttura.codice
                )[0];
                this._utenteStrutturaSelezionatoDaCombo = null;
                setTimeout(() => {
                  const selRowsElm: any[] = this.dt.el.nativeElement.getElementsByClassName("row-class ui-state-highlight");
                  selRowsElm[0].scrollIntoView();
                }, 0);
              }
            }
            this.totalElementsEmit.emit(this.totalRecords);
            this.loading = false;
          }
        );
    } else {
      // se non ho nessuna struttura selezionata svuoto i dati della tabella,
      // se non lo facevo, al cambio azienda prendevo la selezione della struttura ma in tabella mi rimanevano i vecchi utenti
      this.utentiStruttura = null;
    }
  }

  private buildInitialFiltersAndSorts(): FiltersAndSorts {

    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addFilter(new FilterDefinition("idStruttura.id", FILTER_TYPES.not_string.equals, this._strutturaSelezionata.id));
    initialFiltersAndSorts.addSort(new SortDefinition("idUtente.idPersona.cognome", SORT_MODES.asc));
    initialFiltersAndSorts.addSort(new SortDefinition("idUtente.idPersona.nome", SORT_MODES.asc));
    // initialFiltersAndSorts.rows = NO_LIMIT;

    return initialFiltersAndSorts;
  }
}
