import nock from 'nock';

import {
	aContenuEntreprise,
	anEntreprise,
} from '~/client/services/lesEntreprisesSEngagent/lesEntreprisesSEngagentService.fixture';
import {
	StrapiRejoindreLaMobilisationRepository,
} from '~/server/entreprises/infra/strapiRejoindreLaMobilisation.repository';
import { createFailure, createSuccess } from '~/server/errors/either';
import { ErreurMétier } from '~/server/errors/erreurMétier.types';
import { AuthenticatedHttpClientService } from '~/server/services/http/authenticatedHttpClient.service';
import { aLoggerService } from '~/server/services/logger.service.fixture';

describe('StrapiRejoindreLaMobilisationRepository', () => {
	const entreprise = anEntreprise();
	afterEach(() => {
		nock.cleanAll();
	});

	const strapiUrl = 'http://strapi.local/api';

	describe('.save()', () => {
		const client = new AuthenticatedHttpClientService({
			apiName: 'test strapi',
			apiUrl: strapiUrl,
			tokenAgent: {
				getToken: jest.fn(),
			},
		}, aLoggerService());
		const repository = new StrapiRejoindreLaMobilisationRepository(client, aLoggerService());

		it('fait un POST vers Strapi', async () => {
			// Given
			const strapi = nock(strapiUrl)
				.post('/entreprises', {
					data: aContenuEntreprise(),
				})
				.reply(201, {});
			// When
			await repository.save(entreprise);
			// Then
			expect(strapi.isDone()).toBe(true);
		});

		it('résout un Success', async () => {
			// Given
			nock(strapiUrl)
				.post('/entreprises')
				.reply(201, {});
			// When
			const result = await repository.save(entreprise);
			// Then
			expect(result).toEqual(createSuccess(undefined));
		});

		describe('Quand il y a une annotation', () => {
			it('ajoute l‘annotation aux champs envoyés', async () => {
				// Given
				const annotation = 'un petit mot pour plus tard';

				const strapi = nock(strapiUrl)
					.post('/entreprises', {
						data: {
							...aContenuEntreprise(),
							erreur: annotation,
						},
					})
					.reply(201, {});

				// When
				await repository.save(entreprise, annotation);

				// Then
				expect(strapi.isDone()).toBe(true);
			});
		});

		describe('Quand la requête HTTP échoue', () => {
			it('Résout une Failure', async () => {
				// Given
				nock(strapiUrl)
					.post('/entreprises')
					.reply(500, {});
				// When
				const result = await repository.save(entreprise);
				// Then
				expect(result).toEqual(createFailure(ErreurMétier.SERVICE_INDISPONIBLE));
			});
		});
	});
});

