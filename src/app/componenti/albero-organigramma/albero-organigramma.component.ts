import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PROJECTIONS, STATI_STR_UNIFICATE, TIPO_OPERAZIONE } from "src/environments/app-constants";
import { StrutturaUnificata, Azienda, Struttura, UtenteStruttura } from "@bds/ng-internauta-model";
import { StrutturaUnificataService } from "src/app/services/strutturaunificata-service";
import { FiltersAndSorts, AdditionalDataDefinition } from "@nfa/next-sdr";

@Component({
  selector: "app-albero-organigramma",
  templateUrl: "./albero-organigramma.component.html",
  styleUrls: ["./albero-organigramma.component.css"]
})
export class AlberoOrganigrammaComponent implements OnInit {

  private struttureUnificate: StrutturaUnificata[];
  public _azienda: Azienda;
  public _aziendaTmp: Azienda;

  @Input() set azienda(value: Azienda) {
    // Nel primo caricamento non posso settare subito l'azienda perchè questa viene passata al componente figlo e scatena il caricamento dei dati.
    // Questo dev'essere fatto quando le struttureUnificate sono caricate
    if (!!this.struttureUnificate) {
      this._azienda = value;
    } else {
      this._aziendaTmp = value;
    }
  }

  @Output() strutturaSelezionataEmit = new EventEmitter<Struttura>();
  @Output() utenteStrutturaSelezionatoDaComboEmit = new EventEmitter<UtenteStruttura>();

  constructor(private strutturaUnificataService: StrutturaUnificataService) { }

  ngOnInit() {
    this.loadStruttureUnificate();
    this.setNodeStyleUnificate = this.setNodeStyleUnificate.bind(this);
  }


  // passacarte dall'albero figlio al componente padre
  public strutturaSelezionataRecived(event: Struttura) {
    this.strutturaSelezionataEmit.emit(event);
  }
  public utenteStrutturaSelezionatoDaComboRecived(event: UtenteStruttura) {
    this.utenteStrutturaSelezionatoDaComboEmit.emit(event);
  }


  private loadStruttureUnificate(): void {
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addAdditionalData(new AdditionalDataDefinition("getDataByStato", STATI_STR_UNIFICATE.Corrente));
    this.strutturaUnificataService.getData(PROJECTIONS.strutturaunificata.customProjections.StrutturaUnificataCustom, initialFiltersAndSorts, null)
      .subscribe(data => {
        console.log("value subscribe", data);
        if (data.results) {
          this.struttureUnificate = <StrutturaUnificata[]>data.results;
          // ATTENZIONE: il settaggio dell'azienda (input del componente figlio) scatena anche il caricamento dei dati e
          // dev'essere fatto quando le struttureUnificate sono state caricate, se non si vede lo stile sui nodi mostrati all'inizio
        } else { this.struttureUnificate = []; }
        this._azienda = this._aziendaTmp;
      });
  }


  public setNodeStyleUnificate(struttura: any, node: any): any {
    if (!this.struttureUnificate) {
      return node;
    }
    if (struttura.fk_idStrutturaReplicata && struttura.fk_idStrutturaReplicata.id) {
      // è una replica (nell'azienda destinazione)
      // devo trovare la sua sorgente
      const unificataReplica: StrutturaUnificata = this.struttureUnificate.find(unificata => unificata.tipoOperazione === TIPO_OPERAZIONE.replica &&
        unificata.idStrutturaSorgente.id === struttura.fk_idStrutturaReplicata.id && unificata.idStrutturaDestinazione.id === struttura.fk_idStrutturaPadre.id);
      if (unificataReplica) {
        node["tooltip"] = "REPLICA da " + unificataReplica.idStrutturaSorgente.idAzienda.descrizione.toUpperCase();
      } else {
        // questa struttura ha l'idStrutturaRepicata, ma non abbiamo trovato una corrispondente riga nella tabella delle strutture unificate.
        // diamo per scontato che è il figlio di una struttura replicata
        node["tooltip"] = "struttura figlia di struttura REPLICA";
      }
      node.styleClass = "node-unificata";
    } else {
      // Controllo se sono una struttura sorgente di una replica. Oppure se sono una fusione.

      const unificataTrovata: StrutturaUnificata[] = this.struttureUnificate.filter(unificata => (unificata.tipoOperazione === TIPO_OPERAZIONE.fusione && (unificata.idStrutturaDestinazione.id === struttura.id ||
        unificata.idStrutturaSorgente.id === struttura.id)) || (unificata.tipoOperazione === TIPO_OPERAZIONE.replica && unificata.idStrutturaSorgente.id === struttura.id));
      if (unificataTrovata.length > 0) {

        node["tooltip"] = "";

        const aziendeReplicate = unificataTrovata.filter(obj => obj.tipoOperazione === TIPO_OPERAZIONE.replica);
        const aziendeFusione = unificataTrovata.filter(obj => obj.tipoOperazione === TIPO_OPERAZIONE.fusione);

        if (aziendeFusione.length > 0) {
          // è una fusione
          aziendeFusione.forEach(elem => {
            if (elem.idStrutturaDestinazione.id === struttura.id) {
              // è destinazione di una fusione
              node["tooltip"] += "FUSIONE con " + elem.idStrutturaSorgente.nome.toUpperCase() + " ("
                + elem.idStrutturaSorgente.idAzienda.descrizione.toUpperCase() + ")";
            } else if (elem.idStrutturaSorgente.id === struttura.id) {
              // è sorgente di una fuisone
              node["tooltip"] += "FUSIONE con " + elem.idStrutturaDestinazione.nome.toUpperCase() + " ("
                + elem.idStrutturaDestinazione.idAzienda.descrizione.toUpperCase() + ")";
            }
          });
        }

        if (aziendeReplicate.length > 0) {
          // è sorgente di una replica
          const descrizioneIdAziende = aziendeReplicate.map(arr => arr.idStrutturaDestinazione.idAzienda.descrizione);

          node["tooltip"] += "REPLICATA in ";

          node["tooltip"] = node["tooltip"] +  descrizioneIdAziende.join(", ");
        }
        node.styleClass = "node-unificata";
      } else { // Ci vuole anche l'else, se no vengono presi anche tutti i figli
        // non è ne fusione ne replica
        node.styleClass = "node-non-unificata";
      }
    }
    return node;
  }
}
