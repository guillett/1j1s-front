import { aRésultatsRechercheAlternance } from '@tests/fixtures/domain/alternance.fixture';
import { aAlternanceListResponse } from '@tests/fixtures/services/laBonneAlternanceHttpClientService.fixture';
import { testApiHandler } from 'next-test-api-route-handler';
import nock from 'nock';

import { rechercherAlternanceHandler } from '~/pages/api/alternances';
import { RésultatsRechercheAlternance } from '~/server/alternances/domain/alternance';
import { ErrorHttpResponse } from '~/server/errors/errorHttpResponse';

describe('rechercher une alternance', () => {
  it('retourne la liste des alternances filtrée', async () => {
    nock('https://labonnealternance.apprentissage.beta.gouv.fr/api/V1/')
      .get('/jobs?romes=D1103,D1101,H2101&caller=1j1s@octo.com')
      .reply(200, aAlternanceListResponse().data);

    await testApiHandler<RésultatsRechercheAlternance | ErrorHttpResponse>({
      handler: (req, res) => rechercherAlternanceHandler(req, res),
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const json = await res.json();
        expect(json).toEqual(aRésultatsRechercheAlternance());
      },
      url: '/alternances?codeRomes=D1103,D1101,H2101',
    });
  });
});