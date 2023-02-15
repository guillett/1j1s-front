import axios, { AxiosError } from 'axios';

import { createFailure } from '~/server/errors/either';
import { ErreurMétier } from '~/server/errors/erreurMétier.types';
import { SentryException } from '~/server/exceptions/sentryException';
import { LoggerService } from '~/server/services/logger.service';

export interface ApiLaBonneAlternanceErrorResponse {
	message: string
}

export function handleSearchFailureError(e: unknown, context: string) {
	return handleFailureError(e, `search ${context}`);
}

export function handleGetMetierFailureError(e: unknown, context: string) {
	return handleFailureError(e, `get metier ${context}`);
}

export function handleFailureError(e: unknown, customContext: string) {
	if (axios.isAxiosError(e)) {
		const error = e as AxiosError<ApiLaBonneAlternanceErrorResponse>;
		LoggerService.errorWithExtra(
			new SentryException(
				'[API LaBonneAlternance] impossible d’effectuer une recherche',
				{ context: customContext, source: 'API LaBonneAlternance' },
				{ errorDetail: error.response?.data },
			),
		);
		return createFailure(ErreurMétier.DEMANDE_INCORRECTE);
	}
	LoggerService.errorWithExtra(
		new SentryException(
			'[API LaBonneAlternance] impossible d’effectuer une recherche',
			{ context: customContext, source: 'API LaBonneAlternance' },
			{ stacktrace: (<Error> e).stack },
		),
	);
	return createFailure(ErreurMétier.SERVICE_INDISPONIBLE);
}