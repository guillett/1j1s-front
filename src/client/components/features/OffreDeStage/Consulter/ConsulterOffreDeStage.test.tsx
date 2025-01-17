/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';

import { ConsulterOffreDeStage } from '~/client/components/features/OffreDeStage/Consulter/ConsulterOffreDeStage';
import { mockUseRouter } from '~/client/components/useRouter.mock';
import { OffreDeStage } from '~/server/cms/domain/offreDeStage.type';

describe('ConsulterOffreDeStage', () => {
	const offreDeStage: OffreDeStage = {
		dateDeDebut: '2022-09-01',
		description: 'stage en graphisme description',
		domaines: [],
		dureeEnJour: 180,
		dureeEnJourMax: 180,
		employeur: {
			description: '',
			logoUrl: '',
			nom: 'Gras Fisme',
			siteUrl: '',
		},
		id: '1111',
		localisation: {
			codePostal: '75001',
			departement: '75',
			pays: 'FR',
			region: 'IDF',
			ville: 'Paris',
		},
		remunerationBase: 1500,
		slug: 'stage-en-graphisme',
		teletravailPossible: true,
		titre: 'stage en graphisme',
		urlDeCandidature: 'http://candidature',
	};

	beforeEach(() => {
		mockUseRouter({});
	});

	it('affiche l‘offre de stage', () => {
		render(<ConsulterOffreDeStage offreDeStage={offreDeStage}/>);

		const nomEntreprise = screen.getByText('Gras Fisme');
		const intituléOffreDeStage = screen.getByText('stage en graphisme');

		expect(nomEntreprise).toBeInTheDocument();
		expect(intituléOffreDeStage).toBeInTheDocument();
	});

	it('permet de postuler à l‘offre de stage', () => {
		render(<ConsulterOffreDeStage offreDeStage={offreDeStage}/>);

		const linkPostulerOffreEmploi = screen.getByRole('link', { name: 'Postuler' });

		expect(linkPostulerOffreEmploi).toHaveAttribute('href', offreDeStage.urlDeCandidature);
		expect(linkPostulerOffreEmploi).toHaveAttribute('target', '_blank');
	});
});
