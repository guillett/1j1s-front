import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';

import { ButtonRetour } from '~/client/components/features/ButtonRetour/ButtonRetour';
import { ConsulterFicheMétier } from '~/client/components/features/FicheMétier/Consulter/ConsulterFicheMétier';
import { ServiceCard } from '~/client/components/features/ServiceCard/Card/ServiceCard';
import { Head } from '~/client/components/head/Head';
import { Container } from '~/client/components/layouts/Container/Container';
import { EnTete } from '~/client/components/ui/EnTete/EnTete';
import { Icon } from '~/client/components/ui/Icon/Icon';
import useAnalytics from '~/client/hooks/useAnalytics';
import { usePopstate } from '~/client/hooks/usePopstate';
import analytics from '~/pages/decouvrir-les-metiers/[nomMetier].analytics';
import styles from '~/pages/decouvrir-les-metiers/[nomMetier].module.scss';
import { isFailure } from '~/server/errors/either';
import { PageContextParamsException } from '~/server/exceptions/pageContextParams.exception';
import { FicheMétier } from '~/server/fiche-metier/domain/ficheMetier';
import { dependencies } from '~/server/start';

interface ConsulterFicheMetierPageProps {
	ficheMetier: FicheMétier
}

export default function ConsulterFicheMetierPage({ ficheMetier }: ConsulterFicheMetierPageProps) {
	useAnalytics(analytics);
	usePopstate();

	if (!ficheMetier) return null;

	return (
		<>
			<Head
				title={`${ficheMetier.nomMetier.charAt(0).toUpperCase()}${ficheMetier.nomMetier.slice(1)} | 1jeune1solution`}
				robots="index,follow"
			/>
			<main id="contenu">
				<Container className={styles.container}>
					<ButtonRetour className={styles.backButton}/>
					<ConsulterFicheMétier ficheMetier={ficheMetier}/>
				</Container>
				<div className={'background-white-lilac'}>
					<EnTete heading="Informations fournies par ONISEP"/>
					<Container className={styles.container}>
						<ServiceCard
							logo="/images/logos/onisep.svg"
							link="https://www.onisep.fr/"
							linkLabel="Aller sur le site de l’ONISEP"
							title={'Onisep : l’information pour l’orientation'}
							titleAs={'h3'}
						>
							L’Onisep est un établissement public, sous tutelle du ministère de
							l’Education nationale, de la Jeunesse et des Sports, et du
							ministère de l’Enseignement supérieur, de la Recherche et de
							l’Innovation. Il a pour mission d’informer sur les secteurs
							professionnels, les métiers et les formations via ses productions
							numériques, imprimées, et ses services. Il accompagne les familles
							et les équipes éducatives en leur fournissant des ressources, des
							outils et dispositifs permettant de construire un parcours de
							formation et un projet professionnel tout au long de la vie.
						</ServiceCard>
						<div className={styles.partnerInfo}>
							<Icon name="information" className={styles.partnerInfoIcon}/>
							<span>Idéo-fiches métiers, Onisep, 14/09/2022, sous licence ODBL</span>
						</div>
					</Container>
				</div>
			</main>
		</>
	);
}

interface FicheMetierContext extends ParsedUrlQuery {
	nomMetier: string
}

export async function getStaticProps(context: GetStaticPropsContext<FicheMetierContext>): Promise<GetStaticPropsResult<ConsulterFicheMetierPageProps>> {
	if (!context.params) {
		throw new PageContextParamsException();
	}

	const { nomMetier } = context.params;
	const response = await dependencies.cmsDependencies.consulterFicheMetier.handle(nomMetier);

	if (response.instance === 'failure') {
		return { notFound: true, revalidate: 1 };
	}

	return {
		props: {
		   ficheMetier: JSON.parse(JSON.stringify(response.result)),
		},
		revalidate: 86400,
	};
}


export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	const NomMétierFicheMétierList = await dependencies.cmsDependencies.listerNomMétierFicheMétier.handle();

	if (isFailure(NomMétierFicheMétierList)) {
		return {
			fallback: 'blocking',
			paths: [],
		};
	}

	const paths = NomMétierFicheMétierList.result.map((nomMetier) => ({
		params: { nomMetier: nomMetier },
	}));
	return {
		fallback: 'blocking',
		paths,
	};
}
