import { Component, OnInit, Input } from "@angular/core";
import { ENTITIES_STRUCTURE, StoricoAttivazione } from "@bds/ng-internauta-model";
import { PagingConf, FiltersAndSorts, SortDefinition, SORT_MODES, FILTER_TYPES, FilterDefinition } from "@nfa/next-sdr";
import { StoricoAttivazioneService } from "src/app/services/storico-attivazione.service";

@Component({
  selector: "app-storico-attivazione-ribaltoni",
  templateUrl: "./storico-attivazione-ribaltoni.component.html",
  styleUrls: ["./storico-attivazione-ribaltoni.component.css"]
})
export class StoricoAttivazioneRibaltoniComponent implements OnInit {
  private pageSizeThree: PagingConf = {
    conf: {
      page: 0,
      size: 3
    },
    mode: "PAGE"
  };

  @Input() idAzienda: string;

  public storicoAttivazioni: StoricoAttivazione[];
  public cols: any;

  constructor(private storicoAttivazioneService: StoricoAttivazioneService) {}

  ngOnInit() {
    this.cols = [
      {
        field: "dataInserimentoRiga",
        header: "Data",
        fieldType: "date",
        style: {
          width: "100px",
          textAlign: "center"
        }
      },
      {
        field: "ribaltaInternauta",
        header: "Ribalta internauta",
        fieldType: "boolean",
        style: {
          width: "70px",
          textAlign: "center"
        }
      },
      {
        field: "ribaltaArgo",
        header: "Ribalta locale",
        fieldType: "boolean",
        style: {
          width: "70px",
          textAlign: "center"
        }
      },
      {
        field: "idUtente.idPersona.descrizione",
        header: "Utente",
        fieldType: "string",
        style: {
          width: "100px",
          textAlign: "center"
        }
      },
      {
        field: "note",
        header: "Note",
        fieldType: "string",
        style: {
          width: "250px",
          textAlign: "center"
        }
      }
    ];

    this.getData();
  }

  /**
   * GetData principale. Recupera i dati che voglio mostrare dalla tabella storico_attivazioni
   */
  private getData(): void {
    this.storicoAttivazioneService.getData(
      ENTITIES_STRUCTURE.ribaltoneutils.storicoattivazione.customProjections.StoricoAttivazioneWithIdUtenteCustom,
      this.buildFilterAndSorts(), null, this.pageSizeThree)
      .subscribe(
        res => {
          console.log(res);
          this.storicoAttivazioni = res.results;
        }
      );
  }

  /**
   * Voglio lo storico dell'azienda selezionata.
   * E voglio gli utlimi 3 risultati in ordine di data desc.
   */
  private buildFilterAndSorts(): FiltersAndSorts {
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("idAzienda", FILTER_TYPES.not_string.equals, this.idAzienda));
    filtersAndSorts.addSort(new SortDefinition("dataInserimentoRiga", SORT_MODES.desc));
    return filtersAndSorts;
  }

  /**
   * Formatta la data passata nello standard di es.
   * "Martedì 26 marzo 2019, 03:01"
   * @param date
   */
  public getDateDisplay(date: string): string {
    if (date) {
      date = (new Date(date)).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      });
      return date.charAt(0).toUpperCase() + date.slice(1);
    }
  }
}
