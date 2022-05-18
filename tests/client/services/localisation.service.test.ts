/**
 * @jest-environment jsdom
 */
import { aHttpClientService } from '@tests/fixtures/client/services/httpClientService.fixture';
import {
  aCommune,
  aCommuneList,
  aDépartement,
  aDépartementList,
  aRégion,
} from '@tests/fixtures/domain/localisation.fixture';
import { anAxiosResponse } from '@tests/fixtures/services/httpClientService.fixture';

import { LocalisationService } from '~/client/services/localisation.service';
import { TypeLocalisation } from '~/server/localisations/domain/localisation';


describe('LocalisationService', () => {
  describe('rechercheLocalisation', () => {
    const list = ['1','3','4','6'];
    list.forEach((value) => {
      it(`quand la recherche contient ${value}, on renvoie null`, async () => {
        const httpClientService = aHttpClientService();
        const localisationService = new LocalisationService(httpClientService);

        const result = await localisationService.rechercheLocalisation(value);

        expect(result).toEqual(null);
      });
    });

    it('quand la recherche contient un caractère spécial sauf accents et espaces, on renvoie null', async () => {
      const httpClientService = aHttpClientService();
      const localisationService = new LocalisationService(httpClientService);

      const result = await localisationService.rechercheLocalisation('$$');

      expect(result).toEqual(null);
    });

    it('quand la recherche contient qu\'un seul caractère, on renvoie null', async () => {
      const httpClientService = aHttpClientService();
      const localisationService = new LocalisationService(httpClientService);

      const result = await localisationService.rechercheLocalisation('a');

      expect(result).toEqual(null);
    });

    it('quand on recherche un nombre, on renvoie les départements et les communes', async () => {
      const httpClientService = aHttpClientService();
      const localisationService = new LocalisationService(httpClientService);

      jest.spyOn(httpClientService, 'get').mockResolvedValue(anAxiosResponse({
        communeList: aCommuneList(),
        départementList: aDépartementList(),
        régionList: [],
      }));

      const result = await localisationService.rechercheLocalisation('34');

      expect(result).toEqual({
        communeList: [
          {
            code: '34290',
            codeInsee: '34001',
            libelle: 'Abeilhan',
          },
          {
            code: '34230',
            codeInsee: '34002',
            libelle: 'Adissan',
          },
        ],
        départementList: [
          {
            code: '34',
            codeInsee: '34',
            libelle: 'Hérault',
          },
        ],
        régionList: [],
      });
      expect(httpClientService.get).toHaveBeenCalledWith('localisations?recherche=34');
    });

    it('quand la recherche contient des lettres, on renvoie les communes, départements et régions correspondantes', async () => {
      const httpClientService = aHttpClientService();
      const localisationService = new LocalisationService(httpClientService);

      jest.spyOn(httpClientService, 'get').mockResolvedValue(anAxiosResponse({
        communeList: [{
          codeInsee: '02377',
          libelle: 'Haution',
        }],
        départementList: [{
          codeInsee: '68',
          libelle: 'Haut-Rhin',
        }],
        régionList: [{
          codeInsee: '32',
          libelle: 'Haut-de-France',
        }],
      }));

      const result = await localisationService.rechercheLocalisation('Haut');

      expect(result).toEqual({
        communeList: [{
          codeInsee: '02377',
          libelle: 'Haution',
        }],
        départementList: [{
          codeInsee: '68',
          libelle: 'Haut-Rhin',
        }],
        régionList: [{
          codeInsee: '32',
          libelle: 'Haut-de-France',
        }],
      });
      expect(httpClientService.get).toHaveBeenCalledWith('localisations?recherche=Haut');
    });
  });

  describe('récupérerLocalisationAvecCodeInsee', () => {
    it('renvoie le département', async () => {
      const httpClientService = aHttpClientService();
      const localisationService = new LocalisationService(httpClientService);
      jest.spyOn(httpClientService, 'get').mockResolvedValue(anAxiosResponse(aDépartement()));

      const result = await localisationService.récupérerLocalisationAvecCodeInsee(TypeLocalisation.DEPARTEMENT,'78');

      expect(result).toEqual({
        code: '34',
        codeInsee: '34',
        libelle: 'Hérault',
      });
      expect(httpClientService.get).toHaveBeenCalledWith('localisation?typeLocalisation=DEPARTEMENT&codeInsee=78');
    });

    it('renvoie larégion', async () => {
      const httpClientService = aHttpClientService();
      const localisationService = new LocalisationService(httpClientService);
      jest.spyOn(httpClientService, 'get').mockResolvedValue(anAxiosResponse(aRégion()));

      const result = await localisationService.récupérerLocalisationAvecCodeInsee(TypeLocalisation.REGION,'76');

      expect(result).toEqual({
        code: '76',
        codeInsee: '76',
        libelle: 'Occitanie',
      });
      expect(httpClientService.get).toHaveBeenCalledWith('localisation?typeLocalisation=REGION&codeInsee=76');
    });

    it('renvoie la commune', async () => {
      const httpClientService = aHttpClientService();
      const localisationService = new LocalisationService(httpClientService);
      jest.spyOn(httpClientService, 'get').mockResolvedValue(anAxiosResponse(aCommune()));

      const result = await localisationService.récupérerLocalisationAvecCodeInsee(TypeLocalisation.COMMUNE,'36048');

      expect(result).toEqual({
        code: '34290',
        codeInsee: '34001',
        libelle: 'Abeilhan',
      });
      expect(httpClientService.get).toHaveBeenCalledWith('localisation?typeLocalisation=COMMUNE&codeInsee=36048');
    });
  });
});