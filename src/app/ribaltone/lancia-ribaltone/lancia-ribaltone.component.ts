import { Component, OnInit, EventEmitter } from "@angular/core";
import { Azienda } from "@bds/ng-internauta-model";
import { RibaltoneService } from "../../services/ribaltone-service";
import { getInternautaUrl, BaseUrlType } from "../../../environments/app-constants";
import { HttpHeaders } from "@angular/common/http";
import { ConfirmationService } from "primeng/api";


@Component({
  selector: "lancia-ribaltone",
  templateUrl: "./lancia-ribaltone.component.html",
  styleUrls: ["./lancia-ribaltone.component.css"]
})
export class LanciaRibaltoneComponent implements OnInit {

  private ribaltoneService : RibaltoneService;
  public email: string;
  public azienda: Azienda;
  public btnLanciaDisabled: boolean = false;

  constructor(ribaltoneService: RibaltoneService, private confirmationService: ConfirmationService) {
    this.ribaltoneService = ribaltoneService;
  }

  ngOnInit() {
  }

  aziendaSelectedChanged(event: Azienda){
    this.azienda = event;
  }

  handleLanciaRibaltone(event: any) {
    if (!this.azienda && !this.email) return;

    const url: string = getInternautaUrl(BaseUrlType.Ribaltone);
    const ribaltoneParams = {
      "indirizzoMail": this.email,
      "codiceAzienda": this.azienda.codice
    };

    const options =  {
      headers: new HttpHeaders({"Content-Type": "application/json"})
    };

    this.ribaltoneService.lanciaRibaltone(url, ribaltoneParams, options);
    this.confirmationService.confirm({
      message: "Il ribaltone è stato lanciato. Riceverai a breve una mail con l'estito",
      accept: () => {
        this.btnLanciaDisabled = true;
      }
  });
  }

}
