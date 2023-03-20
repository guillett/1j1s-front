import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiRequest } from 'next';

import { ConsulterFormation } from '~/client/components/features/Formation/Consulter/ConsulterFormation';
import { Head } from '~/client/components/head/Head';
import useAnalytics from '~/client/hooks/useAnalytics';
import { formationQuerySchema } from '~/pages/api/formations/[id].controller';
import { formationFiltreMapper } from '~/pages/api/formations/index.controller';
import analytics from '~/pages/formations/apprentissage/[id].analytics';
import { isFailure } from '~/server/errors/either';
import { Formation, FormationFiltre } from '~/server/formations/domain/formation';
import { removeUndefinedKeys } from '~/server/removeUndefinedKeys.utils';
import { dependencies } from '~/server/start';

interface ConsulterFormationPageProps {
	formation: Formation
}

export default function ConsulterFormationPage(props: ConsulterFormationPageProps) {
	useAnalytics(analytics);

	const { formation } = props;
	return (
		<>
			<Head
				title={`${formation.titre} | 1jeune1solution`}
				robots="noindex"
			/>
			<ConsulterFormation formation={formation} />
		</>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }>): Promise<GetServerSidePropsResult<ConsulterFormationPageProps>> {
	const isFormationActive = process.env.NEXT_PUBLIC_FORMATION_LBA_FEATURE === '1';
	if (!isFormationActive) {
		return { notFound: true };
	}

	if (formationQuerySchema.validate(context.query).error) {
		return { notFound: true };
	}

	const id = context.params?.id as string;
	const filtre: FormationFiltre = formationFiltreMapper({ query: context.query } as NextApiRequest);
	const formation = await dependencies.formationDependencies.consulterFormation.handle(id, filtre);

	if (isFailure(formation)) {
		return { notFound: true };
	}

	return {
		props: {
			formation: removeUndefinedKeys(formation.result),
		},
	};
}