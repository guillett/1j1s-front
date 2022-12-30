
import { handleGetFailureError } from '~/server/entreprises/infra/apiRejoindreLaMobilisationError';
import { createSuccess, Either } from '~/server/errors/either';
import { HttpClientService } from '~/server/services/http/httpClientService';

import { Entreprise } from '../domain/Entreprise';
import { RejoindreLaMobilisationRepository } from '../domain/RejoindreLaMobilisation.repository';

export class ApiRejoindreLaMobilisationRepository implements RejoindreLaMobilisationRepository {
	constructor(private httpClientService: HttpClientService) {}

	async save(entreprise: Entreprise): Promise<Either<void>> {
		try {
			await this.httpClientService.post('/api/members', this.mapEntreprise(entreprise));
		} catch (e) {
			return handleGetFailureError(e, 'rejoindre mobilisation');
		}
		return createSuccess(undefined);
	}

	private mapEntreprise(e: Entreprise) {
		return {
			companyName: e.nomSociété,
			companyPostalCode: e.codePostal,
			companySector: e.secteur,
			companySiret: e.siret,
			companySize: e.taille,
			email: e.email,
			firstname: e.prénom,
			from1j1s: true,
			job: e.travail,
			lastname: e.nom,
			phone: e.téléphone,
		};
	}
}
