import { createFailure } from '~/server/errors/either';
import { ErreurMétier } from '~/server/errors/erreurMétier.types';
import { SentryException } from '~/server/exceptions/sentryException';
import { DefaultErrorManagementService, LogInformation } from '~/server/services/error/errorManagement.service';
import { anHttpError } from '~/server/services/http/httpError.fixture';
import { aLoggerService } from '~/server/services/logger.service.fixture';

const aLogInformation: LogInformation = {
	apiSource: 'API La bonne alternance',
	contexte: 'search alternance',
	message: '[API LaBonneAlternance] impossible d’effectuer une recherche',
};
describe('DefaultErrorManagementService', () => {
	describe('lorsque l‘erreur est une Http error', () => {
		it('qui commence par 50 doit créer une failure service indisponible', () => {
			// GIVEN
			const loggerService = aLoggerService();
			const errorManagementService = new DefaultErrorManagementService(loggerService);
			const httpError = anHttpError(500);
			const expectedFailure = createFailure(ErreurMétier.SERVICE_INDISPONIBLE);

			// WHEN
			const result = errorManagementService.handleFailureError(httpError, aLogInformation);

			// THEN
			expect(result).toStrictEqual(expectedFailure);
		});

		it('qui est une 404 doit créer une failure contenu indisponible', () => {
			// GIVEN
			const loggerService = aLoggerService();
			const errorManagementService = new DefaultErrorManagementService(loggerService);
			const httpError = anHttpError(404);
			const expectedFailure = createFailure(ErreurMétier.CONTENU_INDISPONIBLE);

			// WHEN
			const result = errorManagementService.handleFailureError(httpError, aLogInformation);

			// THEN
			expect(result).toStrictEqual(expectedFailure);
		});

		it('qui est une 400 doit créer une failure demande incorrecte', () => {
			// GIVEN
			const loggerService = aLoggerService();
			const errorManagementService = new DefaultErrorManagementService(loggerService);
			const httpError = anHttpError(400);
			const expectedFailure = createFailure(ErreurMétier.DEMANDE_INCORRECTE);

			// WHEN
			const result = errorManagementService.handleFailureError(httpError, aLogInformation);

			// THEN
			expect(result).toStrictEqual(expectedFailure);
		});

		it('qui est une autre erreur doit créer une failure contenu indisponible', () => {
			// GIVEN
			const loggerService = aLoggerService();
			const errorManagementService = new DefaultErrorManagementService(loggerService);
			const httpError = anHttpError(409);
			const expectedFailure = createFailure(ErreurMétier.CONTENU_INDISPONIBLE);

			// WHEN
			const result = errorManagementService.handleFailureError(httpError, aLogInformation);

			// THEN
			expect(result).toStrictEqual(expectedFailure);
		});

		it('doit envoyer les logs de l’erreur en précisant que c’est une erreur http', () => {
			// GIVEN
			const loggerService = aLoggerService();
			const httpError = anHttpError();
			const errorManagementService = new DefaultErrorManagementService(loggerService);
			const expectedLogDetails = new SentryException(
				`${aLogInformation.message} (erreur http)`,
				{ context: aLogInformation.contexte, source: aLogInformation.apiSource },
				{ errorDetail: httpError.response?.data },
			);

			// WHEN
			errorManagementService.handleFailureError(httpError, aLogInformation);

			// THEN
			expect(loggerService.errorWithExtra).toHaveBeenCalledWith(expectedLogDetails);
		});
	});

	describe('lorsque l‘erreur est une erreur interne', () => {
		it('doit créer une failure de contenu indisponible', () => {
			// GIVEN
			const loggerService = aLoggerService();
			const errorManagementService = new DefaultErrorManagementService(loggerService);
			const internalError = new Error('ceci est une erreur interne');
			const expectedFailure = createFailure(ErreurMétier.CONTENU_INDISPONIBLE);

			// WHEN
			const result = errorManagementService.handleFailureError(internalError, aLogInformation);

			// THEN
			expect(result).toStrictEqual(expectedFailure);
		});

		describe('doit envoyer les logs de l’erreur en précisant que c’est une erreur interne', () => {
			it('avec la stack trace lorsque l‘erreur est une Error', () => {
				// GIVEN
				const loggerService = aLoggerService();
				const internalError = new Error('ceci est une erreur interne');
				const errorManagementService = new DefaultErrorManagementService(loggerService);
				const expectedLogDetails = new SentryException(
					`${aLogInformation.message} (erreur interne)`,
					{ context: aLogInformation.contexte, source: aLogInformation.apiSource },
					{ stacktrace: internalError.stack },
				);

				// WHEN
				errorManagementService.handleFailureError(internalError, aLogInformation);

				// THEN
				expect(loggerService.errorWithExtra).toHaveBeenCalledWith(expectedLogDetails);
			});
			it('avec le contenu entier lorsque l‘erreur n‘est pas une Error', () => {
				// GIVEN
				const loggerService = aLoggerService();
				const internalError = 'une erreur qui n‘est pas une erreur';
				const errorManagementService = new DefaultErrorManagementService(loggerService);
				const expectedLogDetails = new SentryException(
					`${aLogInformation.message} (erreur interne)`,
					{ context: aLogInformation.contexte, source: aLogInformation.apiSource },
					{ error: internalError },
				);

				// WHEN
				errorManagementService.handleFailureError(internalError, aLogInformation);

				// THEN
				expect(loggerService.errorWithExtra).toHaveBeenCalledWith(expectedLogDetails);
			});
		});
	});
});
