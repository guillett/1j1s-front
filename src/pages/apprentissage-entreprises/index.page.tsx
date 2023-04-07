import { GetServerSidePropsResult } from 'next';

export default function ApprentissageEntreprises () {

	return <h1>Apprentissage Entreprises</h1>;
}

export async function getServerSideProps(): Promise<GetServerSidePropsResult<Record<never, never>>> {
	const featureActivated = process.env.NEXT_PUBLIC_CAMPAGNE_APPRENTISSAGE_FEATURE === '1';
	if (!featureActivated) {
		return {
			notFound: true,
		};
	}
	return {
		props: {},
	};
}
