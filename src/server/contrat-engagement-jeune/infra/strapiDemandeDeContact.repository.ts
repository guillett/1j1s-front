import { createFailure, createSuccess, Either } from '~/server/errors/either';
import { ErreurMétier } from '~/server/errors/erreurMétier.types';
import { StrapiHttpClientService } from '~/server/services/http/strapiHttpClient.service';

import { DemandeDeContact } from '../domain/DemandeDeContact';
import { DemandeDeContactRepository } from '../domain/DemandeDeContact.repository';

export class StrapiDemandeDeContactRepository implements DemandeDeContactRepository {

  constructor(private strapiHttpClientService: StrapiHttpClientService) {
  }
  async save(demandeDeContact: DemandeDeContact): Promise<Either<void>> {
    try {
      await this.strapiHttpClientService.post('contacts', {
        data: {
          age: demandeDeContact.age,
          email: demandeDeContact.email,
          nom: demandeDeContact.nom,
          prenom: demandeDeContact.prénom,
          telephone: demandeDeContact.téléphone,
          ville: demandeDeContact.ville,
        },
      });
    } catch (error) {
      return createFailure(ErreurMétier.SERVICE_INDISPONIBLE);
    }
    return createSuccess(undefined);
  }
}