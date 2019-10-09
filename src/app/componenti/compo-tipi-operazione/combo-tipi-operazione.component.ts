import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TIPI_OPERAZIONE } from '../../../environments/app-constants';


@Component({
  selector: 'app-combo-tipi-operazione',
  templateUrl: './combo-tipi-operazione.component.html',
  styleUrls: ['./combo-tipi-operazione.component.css']
})


export class ComboTipiOperazioneComponent implements OnInit {

  private tipoOperazioneSelezionata: string;
  public filteredTipiOperazione: string[];
  public _tipoOperazioneIniziale: string;
  public _descrizioneIniziale: string;
  public _enabled: boolean = true;

  @Input() set tipoOperazioneIniziale(value: string) {
    this._tipoOperazioneIniziale = value;
    this._descrizioneIniziale = this._tipoOperazioneIniziale? this._tipoOperazioneIniziale: undefined;
  }

  @Input() set enabled(value: boolean) {
    this._enabled = value;
  }

  @Output() tipoOperazioneSelezionataEmit = new EventEmitter<string>();


  constructor() { }

  ngOnInit() {
  }



  private filter(event) {
      this.filteredTipiOperazione = [];
      for(let i = 0; i < TIPI_OPERAZIONE.length; i++) {
          let tipoOperazione = TIPI_OPERAZIONE[i];
          if(tipoOperazione.toLowerCase().indexOf(event.query.toLowerCase()) == 0) {
              this.filteredTipiOperazione.push(tipoOperazione);
          }
      }
  }

  private select(event) {
    this.tipoOperazioneSelezionata = event;
    this.tipoOperazioneSelezionataEmit.emit(this.tipoOperazioneSelezionata);
  }



  public handleEvent(nome: string, event){
    switch(nome){
      case "completeMethod":
        this.filter(event);
        break;
      case "onSelect":
        this.select(event);
        break;
    }
  }

}
