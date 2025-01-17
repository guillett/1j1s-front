/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
	FormulaireRechercheJobEte,
} from '~/client/components/features/JobEte/FormulaireRecherche/FormulaireRechercheJobEte';
import { mockUseRouter } from '~/client/components/useRouter.mock';
import { mockLargeScreen, mockSmallScreen } from '~/client/components/window.mock';
import { DependenciesProvider } from '~/client/context/dependenciesContainer.context';
import { référentielDomaineList } from '~/client/domain/référentielDomaineList';
import { aLocalisationService } from '~/client/services/localisation/localisationService.fixture';
import { aLocalisationListWithCommuneAndDépartement } from '~/server/localisations/domain/localisation.fixture';

describe('FormulaireRechercheJobEte', () => {
	describe('en version mobile', () => {
		beforeEach(() => {
			mockSmallScreen();
		});

		describe('quand on recherche par mot clé', () => {
			it('ajoute le mot clé recherché aux query params', async () => {
				// GIVEN
				const localisationServiceMock = aLocalisationService();
				const routerPush = jest.fn();
				mockUseRouter({ push: routerPush });

				render(
					<DependenciesProvider localisationService={localisationServiceMock}>
						<FormulaireRechercheJobEte />
					</DependenciesProvider>,
				);

				const inputRechercheMotClé = screen.getByRole('textbox', { name: 'Métier, mot-clé' });
				fireEvent.change(inputRechercheMotClé, { target: { value: 'boulanger' } });
				const buttonRechercher = screen.getByRole('button', { name: 'Rechercher' });

				// WHEN
				fireEvent.click(buttonRechercher);

				// THEN
				expect(routerPush).toHaveBeenCalledWith({ query: 'motCle=boulanger&page=1' }, undefined, { shallow: true });
			});
		});

		describe('quand on recherche par localisation', () => {
			it('ajoute la localisation aux query params', async () => {
				// GIVEN
				const localisationServiceMock = aLocalisationService(aLocalisationListWithCommuneAndDépartement());
				const user = userEvent.setup();
				const routerPush = jest.fn();
				mockUseRouter({ push: routerPush });
				render(
					<DependenciesProvider localisationService={localisationServiceMock}>
						<FormulaireRechercheJobEte />
					</DependenciesProvider>,
				);

				const inputLocalisation = screen.getByRole('textbox', { name: 'Localisation' });
				const buttonRechercher = screen.getByRole('button', { name: 'Rechercher' });

				// WHEN
				await user.type(inputLocalisation, 'Par');
				const résultatsLocalisation = await screen.findByTestId('RésultatsLocalisation');

				// WHEN
				expect(localisationServiceMock.rechercherLocalisation).toHaveBeenCalledWith('Par');
				const résultatLocalisationList = within(résultatsLocalisation).getAllByRole('option');

				fireEvent.click(résultatLocalisationList[1]);

				fireEvent.click(buttonRechercher);

				// THEN
				expect(routerPush).toHaveBeenCalledWith({ query: 'libelleLocalisation=Paris+%2875001%29&typeLocalisation=COMMUNE&codeLocalisation=75101&page=1' }, undefined, { shallow: true });
			});
		});
	});

	describe('en version desktop', () => {
		beforeEach(() => {
			mockLargeScreen();
		});

		it('affiche les filtres avancés sans modale', async () => {
			// GIVEN
			const localisationServiceMock = aLocalisationService();
			mockUseRouter({ push: jest.fn() });
			render(
				<DependenciesProvider localisationService={localisationServiceMock}>
					<FormulaireRechercheJobEte />
				</DependenciesProvider>,
			);

			const button = screen.getByRole('button', { name: 'Domaines' });
			expect(button).toBeInTheDocument();

		});

		describe('quand on filtre par domaine', () => {
			it('ajoute le domaine sélectionné aux query params', async () => {
				const localisationServiceMock = aLocalisationService();
				const routerPush = jest.fn();
				mockUseRouter({ push: routerPush });

				render(
					<DependenciesProvider localisationService={localisationServiceMock}>
						<FormulaireRechercheJobEte />
					</DependenciesProvider>,
				);

				const button = screen.getByRole('button', { name: 'Domaines' });
				fireEvent.click(button);

				const domaineList = await screen.findByRole('listbox');

				const inputDomaine = within(domaineList).getAllByRole('checkbox');
				fireEvent.click(inputDomaine[2]);

				const buttonRechercher = screen.getByRole('button', { name: 'Rechercher' });
				fireEvent.click(buttonRechercher);

				expect(routerPush).toHaveBeenCalledWith({ query: 'grandDomaine=C&page=1' }, undefined, { shallow: true });
			});
		});
	});

	it('rempli automatiquement les champs avec les query params', () => {
		mockUseRouter({ query: {
			codeLocalisation: '75',
			grandDomaine: référentielDomaineList[0].code,
			libelleLocalisation: 'Paris (75)',
			motCle: 'Boulanger',
			typeLocalisation: 'Commune',
		} });

		render(
			<DependenciesProvider localisationService={aLocalisationService()}>
				<FormulaireRechercheJobEte />
			</DependenciesProvider>,
		);

		const motCle = screen.getByRole('textbox', { name: /Métier, mot-clé/i });
		expect(motCle).toHaveValue('Boulanger');
		const localisation = screen.getByRole('textbox', { name: /Localisation/i });
		expect(localisation).toHaveValue('Paris (75)');
		const domaine = screen.getByTestId('Select-InputHidden');
		expect(domaine).toHaveValue(référentielDomaineList[0].code);
	});
});
