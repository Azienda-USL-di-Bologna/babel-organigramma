import {ValidationErrorsNextSDR} from "@nfa/next-sdr";

export class PecValidations {
  public static validate(pec: any): ValidationErrorsNextSDR[] {
    const errors: ValidationErrorsNextSDR[] = [];
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!pec.indirizzo) {
      errors.push({message: "É necessario specificare un indirizzo per la pec.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Indirizzo"});
    } else {
      pec.indirizzo = pec.indirizzo.trim();
      if (!re.test(String(pec.indirizzo).toLowerCase())) {
        errors.push({message: "L'indirizzo non ha un formato valido.",
          validationSeverity: "ERROR", isBlocking: true, fieldName: "Indirizzo"});
      }
    }

    if (!pec.username) {
      errors.push({message: "É necessario specificare un username per la pec.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Username"});
    }

    if (!pec.password) {
      errors.push({message: "É necessario specificare un password per la pec.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Password"});
    }

    if (!pec.idPecProvider) {
      errors.push({message: "É necessario specificare un provider per la pec.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Provider"});
    }

    if (pec.attiva == null || pec.attiva === undefined) {
      errors.push({message: "É necessario specificare se la pec è attiva.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Attiva"});
    }

    if (!pec.messagePolicy && pec.messagePolicy !== 0) {
      errors.push({message: "É necessario specificare un valore di policy per la pec.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Policy"});
    }

    if (pec.perRiservato == null || pec.perRiservato === undefined) {
      errors.push({message: "É necessario specificare se la pec è per riservato.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Per riservato"});
    }

    if (pec.massiva == null || pec.massiva === undefined) {
      errors.push({message: "É necessario specificare se la pec è massiva.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Massiva"});
    }

    if (pec.chiusa == null || pec.chiusa === undefined) {
      errors.push({message: "É necessario specificare se la pec è chiusa.",
        validationSeverity: "ERROR", isBlocking: true, fieldName: "Chiusa"});
    }

    return errors;
  }
}
