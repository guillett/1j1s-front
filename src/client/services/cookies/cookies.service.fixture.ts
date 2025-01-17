import { CookiesService, TarteAuCitron } from './cookies.service';

export function aCookiesService(override?: Partial<CookiesService>): CookiesService {
	return {
		addService: jest.fn(),
		addUser: jest.fn(),
		isServiceAllowed: jest.fn(() => true),
		...override,
	};
}

export function aTarteAuCitron(override?: Partial<TarteAuCitron>): TarteAuCitron {
	return {
		init: jest.fn(),
		job: undefined,
		services: {},
		user: {},
		userInterface: {
			openPanel: jest.fn(),
			respond: jest.fn(),
		},
		...override,
	};
}
