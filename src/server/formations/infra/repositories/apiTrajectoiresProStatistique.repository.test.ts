import {
	createFailure,
	createSuccess,
} from '~/server/errors/either';
import { ErreurMétier } from '~/server/errors/erreurMétier.types';
import { ApiTrajectoiresProStatistiqueResponse } from '~/server/formations/infra/repositories/apiTrajectoiresProStatistique';
import { ApiTrajectoiresProStatistiqueRepository } from '~/server/formations/infra/repositories/apiTrajectoiresProStatistique.repository';
import { ApiGeoRepository } from '~/server/localisations/infra/repositories/apiGeo.repository';
import { CachedHttpClientService } from '~/server/services/http/cachedHttpClient.service';
import { anHttpError } from '~/server/services/http/httpError.fixture';
import { PublicHttpClientService } from '~/server/services/http/publicHttpClient.service';
import {
	aCachedHttpClientService,
	aPublicHttpClientService,
} from '~/server/services/http/publicHttpClient.service.fixture';
import { LoggerService } from '~/server/services/logger.service';
import { aLoggerService } from '~/server/services/logger.service.fixture';

describe('apiTrajectoiresProCertification.repository', () => {
	let apiGeoLocalisationHttpService: CachedHttpClientService;
	let httpService: PublicHttpClientService;
	let apiGeoLocalisationRepository: ApiGeoRepository;
	let loggerService: LoggerService;

	let codeCertification: string;
	let codePostal: string;

	beforeEach(() => {
		apiGeoLocalisationHttpService = aCachedHttpClientService();
		httpService = aPublicHttpClientService();
		loggerService = aLoggerService();
		apiGeoLocalisationRepository = new ApiGeoRepository(apiGeoLocalisationHttpService, loggerService);

		codeCertification = '123';
		codePostal = '75000';

	});
	describe('get', () => {
		it('appelle l’api geoLocalisation avec les bons paramètres', async () => {
			const repository = new ApiTrajectoiresProStatistiqueRepository(httpService, apiGeoLocalisationRepository, loggerService);
			await repository.get(codeCertification, codePostal);

			expect(apiGeoLocalisationHttpService.get).toHaveBeenCalledWith(`communes?codePostal=${codePostal}`);
		});

		describe('lorsque l’appel à l’api geoLocalisation échoue', () => {
			it('retourne une erreur SERVICE_INDISPONIBLE', async () => {
				(apiGeoLocalisationHttpService.get as jest.Mock).mockRejectedValue(anHttpError(500));
				const repository = new ApiTrajectoiresProStatistiqueRepository(httpService, apiGeoLocalisationRepository, loggerService);

				const returnValue = await repository.get(codeCertification, codePostal);

				expect(httpService.get).toHaveBeenCalledTimes(0);
				expect(returnValue).toEqual(createFailure(ErreurMétier.SERVICE_INDISPONIBLE));
			});
		});

		describe('lorsque l’appel à l’api geoLocalisation réussit', () => {
			describe('mais que le code région récupéré n’est pas défini', () => {
				it('retourne une erreur SERVICE_INDISPONIBLE', async () => {
					(apiGeoLocalisationHttpService.get as jest.Mock).mockResolvedValue({ data: [{ codeRegion: undefined }] });
					const repository = new ApiTrajectoiresProStatistiqueRepository(httpService, apiGeoLocalisationRepository, loggerService);

					const returnValue = await repository.get(codeCertification, codePostal);
					expect(returnValue).toEqual(createFailure(ErreurMétier.SERVICE_INDISPONIBLE));
				});
			});

			describe('lorsque l’appel à l’api trajectoiresProCertification échoue', () => {
				it('retourne une erreur SERVICE_INDISPONIBLE', async () => {
					(apiGeoLocalisationHttpService.get as jest.Mock).mockResolvedValue({ data: [{ codeRegion: '11' }] });
					(httpService.get as jest.Mock).mockRejectedValue(anHttpError(500));
					const repository = new ApiTrajectoiresProStatistiqueRepository(httpService, apiGeoLocalisationRepository, loggerService);

					const returnValue = await repository.get(codeCertification, codePostal);

					expect(httpService.get).toHaveBeenCalledTimes(1);
					expect(returnValue).toEqual(createFailure(ErreurMétier.SERVICE_INDISPONIBLE));
				});
			});

			describe('lorsque l’appel à l’api trajectoiresProCertification réussit', () => {
				describe('et que la région n’est pas retournée', () => {
					it('retourne une erreur CONTENU_INDISPONIBLE', async () => {
						const statistiquesFormation: ApiTrajectoiresProStatistiqueResponse = {
							millesime: '2020_2021',
							region: undefined,
							taux_autres_6_mois: '23',
							taux_en_emploi_6_mois: '77',
							taux_en_formation: '0',
						};

						(apiGeoLocalisationHttpService.get as jest.Mock).mockResolvedValue({ data: [{ codeRegion: '11' }] });
						(httpService.get as jest.Mock).mockResolvedValue({ data: statistiquesFormation });
						const repository = new ApiTrajectoiresProStatistiqueRepository(httpService, apiGeoLocalisationRepository, loggerService);

						const returnValue = await repository.get(codeCertification, codePostal);

						// Then
						expect(httpService.get).toHaveBeenCalledTimes(1);
						expect(returnValue).toEqual(createFailure(ErreurMétier.CONTENU_INDISPONIBLE));


					});
				});

				describe('et que la région est retournée mais pas les statistiques', () => {
					it('retourne une erreur CONTENU_INDISPONIBLE', async () => {
						const statistiquesFormation: ApiTrajectoiresProStatistiqueResponse = {
							millesime: '2020_2021',
							region: {
								nom: 'Ile-de-France',
							},
							taux_autres_6_mois: undefined,
							taux_en_emploi_6_mois: undefined,
							taux_en_formation: undefined,
						};

						(apiGeoLocalisationHttpService.get as jest.Mock).mockResolvedValue({ data: [{ codeRegion: '11' }] });
						(httpService.get as jest.Mock).mockResolvedValue({ data: statistiquesFormation });
						const repository = new ApiTrajectoiresProStatistiqueRepository(httpService, apiGeoLocalisationRepository, loggerService);

						const returnValue = await repository.get(codeCertification, codePostal);

						expect(httpService.get).toHaveBeenCalledTimes(1);
						expect(returnValue).toEqual(createFailure(ErreurMétier.CONTENU_INDISPONIBLE));


					});
				});

				describe('et que la region et au moins une statistique est disponible', () => {
					it('retourne les statistiques de la formation', async () => {
						// Given
						const statistiquesFormation: ApiTrajectoiresProStatistiqueResponse = {
							millesime: '2020_2021',
							region: {
								nom: 'Ile-de-France',
							},
							taux_en_emploi_6_mois: '77',
						};

						(apiGeoLocalisationHttpService.get as jest.Mock).mockResolvedValue({ data: [{ codeRegion: '11' }] });
						(httpService.get as jest.Mock).mockResolvedValue({ data: statistiquesFormation });
						const repository = new ApiTrajectoiresProStatistiqueRepository(httpService, apiGeoLocalisationRepository, loggerService);

						// When
						const returnValue = await repository.get(codeCertification, codePostal);

						// Then
						expect(httpService.get).toHaveBeenCalledTimes(1);
						expect(returnValue).toEqual(createSuccess({
							millesime: '2020-2021',
							region: 'Ile-de-France',
							tauxAutres6Mois: undefined,
							tauxEnEmploi6Mois: '77',
							tauxEnFormation: undefined,
						}));
					});
				});
			});
		});
	});
});
