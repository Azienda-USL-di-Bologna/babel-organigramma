import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { StrutturaService } from "../../services/struttura-service";
import { TreeNode, SelectItem } from "primeng/api";
import { Struttura, Azienda, UtenteStruttura } from "@bds/ng-internauta-model";
import { NO_LIMIT } from "../../../environments/app-constants";
import { StrutturaUnificataService } from "src/app/services/strutturaunificata-service";
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES, SORT_MODES, SortDefinition, PagingConf } from "@nfa/next-sdr";
import { Observable } from "rxjs";
import { tap, map } from "rxjs/operators";

@Component({
  selector: "app-albero-strutture",
  templateUrl: "./albero-strutture.component.html",
  styleUrls: ["./albero-strutture.component.css"],
})
export class AlberoStruttureComponent {
  public nodes: TreeNode[] = [];
  // public selectedNode: TreeNode;
  public selectedNode: any; // metto any perch* può essere un TreeNode o un TreeNode[].
  public _azienda: Azienda;
  public _strutturaSelezionata: Struttura;
  public filtersAndSorts: FiltersAndSorts;
  public strutturaSelezionataCombo: Struttura;
  public struttureToExpandArray: number[];
  public _setNodeStyle: any;
  public _searchType: string = "entrambi";
  public _selectionType: string = "single";
  public _propagateSelectionDown: boolean = false;
  public _alreadyChecked: number[];


  public searchButtons: SelectItem[] = [
    { label: "Cerca per struttura", value: "strutture", icon: "pi pi-home" },
    { label: "Cerca per utente", value: "utenti", icon: "pi pi-users" },
  ];

  public selectedSearchType: string = "strutture";

  @ViewChild("mytree", null) private mytree: any;

  // setta l'azienda e carica i dati iniziali.
  // ATTENZIONE: se il caricamento dei dati dev'essere fatto in un particolare momento, anche il passaggio dell'azienda in input va fatto in quel momento
  @Input() set azienda(value: Azienda) {
    if (value) {
      this._azienda = value;
      this.loadInitialData();
    }
  }

  /**
   *  Funzione che calcola lo stile e i tooltip dei nodi
   */
  @Input() set setNodeStyle(value: string) {
    this._setNodeStyle = value;
  }

  /**
   * Tipo di ricerca
   * Possibili valori: utenti, strutture, entrambi
   */
  @Input() set searchType(value: string) {
    this._searchType = value;
    // setto la ricerca di default
    if (this._searchType === "entrambi") {
      this.selectedSearchType = "strutture";
    } else {
      this.selectedSearchType = this._searchType;
    }
  }

  /**
   * Tipo di selezione
   * Possibili valori: single, multiple, checkbox
   */
  @Input() set selectionType(value: string) {
    this._selectionType = value;
    if (this._selectionType === "checkbox") {
      this.selectedNode = [];
    }
  }

  /**
   * In caso di tipo di selezione "checkbox" ho dei check già inseriti.
   * Il value è un number[], contiene gli id delle strutture da flaggare.
   */
  @Input() set alreadyChecked(value: any) {
    this._alreadyChecked = value;

    // Faccio un primo giro per flaggare opportunamente.
    if (this._alreadyChecked && this._alreadyChecked.length > 0) {
      this.nodes.forEach(node => {
        this.flagger(node);
      });
    }
  }

  @Output() strutturaSelezionataEmit = new EventEmitter<Struttura>();
  @Output() utenteStrutturaSelezionatoDaComboEmit = new EventEmitter<UtenteStruttura>();
  // @Output() checked = new EventEmitter<number[]>();

  constructor(private strutturaService: StrutturaService, private strutturaUnificataService: StrutturaUnificataService) {

  }

  public strutturaSelezionataDaComboRecived(strutturaSelezionata: Struttura) {
    this._strutturaSelezionata = strutturaSelezionata;
    this.activateStruttura(this._strutturaSelezionata);
    this.selectNode(this._strutturaSelezionata);
  }

  public utenteStrutturaSelezionatoRecived(utenteStrutturaSelezionato: UtenteStruttura) {
    this._strutturaSelezionata = utenteStrutturaSelezionato.idStruttura;
    this.activateStruttura(this._strutturaSelezionata);
    this.selectNode(this._strutturaSelezionata);
    this.utenteStrutturaSelezionatoDaComboEmit.emit(utenteStrutturaSelezionato);
  }

  private loadInitialData(): void {
    if (this._azienda) {
      // 999999999 viene interpretato dal server come null. Devo fare così perchè si aspetta un numero.
      this.loadData(999999999).subscribe(
        data => {
          this.nodes = data;
          // voglio che quando mi carica l'albero la prima volta il nodo radice sia espanso
          this.nodes.forEach(element => {
            element.expanded = true;
            this.expandNode(element).subscribe(res => {});
          });
        });
    }
  }

  private loadData(parentId: number): Observable<any> {
    let nodes: TreeNode[];
    this.filtersAndSorts = this.buildFiltersAndSorts(parentId);
    const pageConfNoLimit: PagingConf = {
      conf: {
        page: 0,
        size: 999999
      },
      mode: "PAGE"
    };
    return this.strutturaService.getData(null, this.filtersAndSorts, null, pageConfNoLimit).pipe(
      map(
      data => {
        if (data && data.results) {
          nodes = this.buildNodes(data.results);
          return nodes;
        }
      }));
  }

  private buildFiltersAndSorts(parentId: number): FiltersAndSorts {
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addFilter(new FilterDefinition("idStrutturaPadre.id", FILTER_TYPES.not_string.equals, parentId));
    initialFiltersAndSorts.addFilter(new FilterDefinition("attiva", FILTER_TYPES.not_string.equals, "true"));
    initialFiltersAndSorts.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._azienda.id));
    initialFiltersAndSorts.addSort(new SortDefinition("codice", SORT_MODES.asc));
    // initialFiltersAndSorts.rows = NO_LIMIT;
    return initialFiltersAndSorts;
  }

  private expandNode(node: TreeNode): Observable<TreeNode[]> {
    // espande il nodo passato
    // se non ho i figli caricati li ricarico
    // se li ricaricassi ogni volta perderei la selezione su un nodo figlio oltre a fare una chiamata inutile
    if (node && !node.children) {
      return this.loadData(node.data.id).pipe(
        map(
          data => {
          node.children = data;
          return node.children;
      }));
    } else { // devo comunque ritornare una Promise coi dati
      return new Observable((observer) => {
        // observable execution
        observer.next(node.children);
      });
      // return Promise.resolve().then(val => node.children);
    }
  }

  private buildNodes(strutture: Struttura[]): TreeNode[] {
    const nodesToReturn: TreeNode[] = [];
    strutture.forEach(struttura => {
      let node: TreeNode = {};
      node.label = struttura.nome + (struttura.codice != null ? " [" + struttura.codice + "]" : "");
      node.data = struttura;
      node.expandedIcon = "fa fa-folder-open";
      node.collapsedIcon = "fa fa-folder";
      node.leaf = struttura.foglia;

      if (this._setNodeStyle) {
        // Chi mi chiama vuole maneggiare i nodes.
        node = this._setNodeStyle(struttura, node);
      }

      if (this._alreadyChecked && this._selectionType === "checkbox") {
        // Chi mi chiama vuole prefleggare alcuni nodi
        this.flagger(node);
      }
      nodesToReturn.push(node);
    });
    return nodesToReturn;
  }

  private flagger(node: TreeNode) {
    console.log("Confronto il node: ", node.data.id);
    if (this._alreadyChecked.indexOf(node.data.id) > -1) {
      console.log("trovato", node);
      this.selectedNode.push(node);
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(nodechild => {
        this.flagger(nodechild);
      });
    }
  }

  public handleEvent(nome: string, event) {
    switch (nome) {
      case "onNodeExpand":
        this.expandNode(event.node).subscribe();
      break;
      case "onNodeSelect":
        if (this._alreadyChecked && this._selectionType === "checkbox") {
          this._alreadyChecked.push(event.node.data.id);
        console.log("bello come il sole", this._alreadyChecked);
        } else {
          this.selectNode(event.node.data);
        }
      break;
      case "onNodeUnselect":
        if (this._alreadyChecked && this._selectionType === "checkbox") {
          const index = this._alreadyChecked.indexOf(event.node.data.id, 0);
          if (index > -1) {
            this._alreadyChecked.splice(index, 1);
          }
        }
      break;
    }
  }

  public selectNode(strutturaSelezionata: Struttura): void {
    this.strutturaSelezionataEmit.emit(strutturaSelezionata);
  }

  public activateStruttura(strutturaSelezionata: Struttura) {
    if (strutturaSelezionata) {
      // ci dobbiamo trovare tutte le strutture antenate di quella trovata nella ricerca per poterle espandere
      // usiamo una funione custom che ci restituisce gli id delle strutture antenate
      this.strutturaService.getStruttureAntenate(strutturaSelezionata.id).then(
        data => {
          this.struttureToExpandArray = data;
          if (this.struttureToExpandArray.length > 0)
            // selezioniamo il nodo trovato dalla ricerca
            this.selectNodeAfterSearch(0, this.nodes);
        }).catch(error => { console.log("ERRORE", error); });
    }
  }

  private selectNodeAfterSearch(struttureToExpandArrayIndex: number, nodeToSearch: TreeNode[]) {
    const strutturaToExpand: number = this.struttureToExpandArray[struttureToExpandArrayIndex];
    const nodeToSelect: TreeNode = nodeToSearch.find(x => x.data.id === strutturaToExpand);
    // dobbiamo espandere tutti i nodi antenati del nodo che stiamo cercando
    // espandiamo anche il nodo stesso se non è una foglia
    if (!nodeToSelect.data.foglia) {
      nodeToSelect.expanded = true;
      this.expandNode(nodeToSelect).subscribe(childrens => {
        if (this.struttureToExpandArray.length - 1 > struttureToExpandArrayIndex) {
          this.selectNodeAfterSearch(struttureToExpandArrayIndex + 1, childrens);
        }
      });
    }
    if (struttureToExpandArrayIndex === this.struttureToExpandArray.length - 1) {
      // siamo sul nodo che stiamo cercando
      // quindi lo selezioniamo e scrolliamo a quell'elemento nell'albero
      if (this._selectionType === "checkbox") {
        this._alreadyChecked.push(nodeToSelect.data.id);
        this.flagger(nodeToSelect);
      } else {
        this.selectedNode = nodeToSelect;
      }
      this.scrollToSelectedNode();
    }
  }

  private scrollToSelectedNode() {
    // devo mettere un timeout altrimenti il nodo non ha ancora la classe "ui-treenode-content-selected" impostata.
    // basta un timeout di 0, perchè serve solo a far si che venga schedulato in avanti dall'event looper
    setTimeout(() => {
      const selNodeElm: any[] = this.mytree.el.nativeElement.getElementsByClassName("ui-treenode-content-selected");
      selNodeElm[0].scrollIntoView();
    }, 0);
  }
}
