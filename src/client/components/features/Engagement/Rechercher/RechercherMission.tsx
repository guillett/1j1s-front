import { useRouter } from 'next/router';
import { stringify } from 'querystring';
import React, { useEffect, useMemo, useState } from 'react';

import {
	FormulaireRechercheMissionEngagement,
} from '~/client/components/features/Engagement/FormulaireRecherche/FormulaireRechercheMissionEngagement';
import { ÉtiquettesFiltreMission } from '~/client/components/features/Engagement/Rechercher/ÉtiquettesFiltreMission';
import {
	ListeRésultatsRechercherSolution,
} from '~/client/components/layouts/RechercherSolution/ListeRésultats/ListeRésultatsRechercherSolution';
import { RechercherSolutionLayout } from '~/client/components/layouts/RechercherSolution/RechercherSolutionLayout';
import {
	RésultatRechercherSolution,
} from '~/client/components/layouts/RechercherSolution/Résultat/RésultatRechercherSolution';
import { LightHero } from '~/client/components/ui/Hero/LightHero';
import { HeadTag } from '~/client/components/utils/HeaderTag';
import { useDependency } from '~/client/context/dependenciesContainer.context';
import { useMissionEngagementQuery } from '~/client/hooks/useMissionEngagementQuery';
import { MissionEngagementService } from '~/client/services/missionEngagement/missionEngagement.service';
import { EngagementCategory } from '~/client/utils/engagementsCategory.enum';
import { formatRechercherSolutionDocumentTitle } from '~/client/utils/formatRechercherSolutionDocumentTitle.util';
import { récupérerLibelléDepuisValeur } from '~/client/utils/récupérerLibelléDepuisValeur.utils';
import {
	bénévolatDomaineList,
	Mission,
	NOMBRE_RÉSULTATS_MISSION_PAR_PAGE,
	serviceCiviqueDomaineList,
} from '~/server/engagement/domain/engagement';
import { ErreurMétier } from '~/server/errors/erreurMétier.types';

interface RechercherMissionProps {
  category: EngagementCategory.BENEVOLAT | EngagementCategory.SERVICE_CIVIQUE
}

export function RechercherMission(props: RechercherMissionProps) {
	const { category } = props;
	const missionEngagementService = useDependency<MissionEngagementService>('missionEngagementService');
	const missionEngagementQuery = useMissionEngagementQuery();
	const router = useRouter();
	const [missionList, setMissionList] = useState<Mission[]>([]);
	const [nombreRésultats, setNombreRésultats] = useState(0);

	const isServiceCivique = useMemo(() => {
		return category === EngagementCategory.SERVICE_CIVIQUE;
	}, [category]);

	const [isLoading, setIsLoading] = useState(false);
	const [erreurRecherche, setErreurRecherche] = useState<ErreurMétier | undefined>(undefined);
	const [title, setTitle] = useState<string>(`Rechercher une mission de ${isServiceCivique ? 'service civique' : 'bénévolat'} | 1jeune1solution'`);

	useEffect(() => {
		const queryString = stringify(router.query);
		if (queryString) {
			setIsLoading(true);
			setErreurRecherche(undefined);
			missionEngagementService
				.rechercherMission(queryString, category)
				.then((response) => {
					if (response.instance === 'success') {
						setTitle(formatRechercherSolutionDocumentTitle(`Rechercher une mission de  ${isServiceCivique ? 'service civique' : 'bénévolat'} ${response.result.résultats.length === 0 ? ' - Aucun résultat' : ''}`));
						setMissionList(response.result.résultats);
						setNombreRésultats(response.result.nombreRésultats);
					} else {
						setTitle(formatRechercherSolutionDocumentTitle(`Rechercher une mission de ${isServiceCivique ? 'service civique' : 'bénévolat'}`, response.errorType));
						setErreurRecherche(response.errorType);
					}
					setIsLoading(false);
				});
		}
	}, [router.query, missionEngagementService, category, isServiceCivique]);

	const messageRésultatRecherche = useMemo(() => {
		const messageRésultatRechercheSplit: string[] = [`${nombreRésultats}`];
		if (nombreRésultats > 1) {
			messageRésultatRechercheSplit.push('missions');
		} else {
			messageRésultatRechercheSplit.push('mission');
		}
		if (isServiceCivique) {
			messageRésultatRechercheSplit.push('de service civique');
		} else {
			messageRésultatRechercheSplit.push('de bénévolat');
		}
		if (missionEngagementQuery.domain) {
			messageRésultatRechercheSplit.push(`pour ${récupérerLibelléDepuisValeur(isServiceCivique ? serviceCiviqueDomaineList : bénévolatDomaineList, missionEngagementQuery.domain)}`);
		}
		return messageRésultatRechercheSplit.join(' ');
	}, [missionEngagementQuery.domain, isServiceCivique, nombreRésultats]);

	return (
		<>
			<HeadTag
				title={title || `Rechercher une mission de ${isServiceCivique ? 'service civique' : 'bénévolat'} | 1jeune1solution`}
				description="Se rendre utile tout en préparant son avenir grâce aux missions de service civique"
			/>
			<main id="contenu">
				<RechercherSolutionLayout
					bannière={<BannièreMission isServiceCivique={isServiceCivique}/>}
					erreurRecherche={erreurRecherche}
					étiquettesRecherche={<ÉtiquettesFiltreMission/>}
					formulaireRecherche={<FormulaireRechercheMissionEngagement domainList={isServiceCivique ? serviceCiviqueDomaineList : bénévolatDomaineList}/>}
					isLoading={isLoading}
					messageRésultatRecherche={messageRésultatRecherche}
					nombreSolutions={nombreRésultats}
					paginationOffset={NOMBRE_RÉSULTATS_MISSION_PAR_PAGE}
					listeSolutionElement={<ListeMission résultatList={missionList} isServiceCivique={isServiceCivique}/>}
				/>
			</main>
		</>
	);
}

interface ListeRésultatProps {
  résultatList: Mission[]
  isServiceCivique: boolean
}

function ListeMission({ résultatList, isServiceCivique }: ListeRésultatProps) {
	if (!résultatList.length) {
		return null;
	}

	return (
		<ListeRésultatsRechercherSolution aria-label={isServiceCivique ? 'Offre pour le service civique' : 'Offre pour le bénévolat'}>
			{résultatList.map((mission: Mission) => (
				<li key={mission.id}>
					<RésultatRechercherSolution
						intituléOffre={mission.titre}
						nomEntreprise={mission.nomEntreprise}
						lienOffre={isServiceCivique ? `/service-civique/${mission.id}` : `/benevolat/${mission.id}`}
						logoEntreprise={isServiceCivique ? '/images/logos/service-civique.svg' : '/images/logos/je-veux-aider.svg'}
						étiquetteOffreList={mission.étiquetteList}
					/>
				</li>
			))}
		</ListeRésultatsRechercherSolution>
	);
}

interface BannièreMissionProps {
  isServiceCivique: boolean
}

function BannièreMission({ isServiceCivique }: BannièreMissionProps) {
	const secondaryText = `grâce aux missions de ${isServiceCivique ? 'Service Civique' : 'Bénévolat'}`;
	return (
		<LightHero primaryText="Se rendre utile tout en préparant son avenir" secondaryText={secondaryText}/>
	);
}
