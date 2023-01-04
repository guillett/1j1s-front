import { SecteurDActivité, TailleDEntreprise } from '~/server/entreprises/domain/Entreprise';
import {
	ContactÉtablissementAccompagnement,
} from '~/server/établissement-accompagnement/domain/ÉtablissementAccompagnement';

export type DemandeDeContactType = 'CEJ' | 'LesEntreprisesSEngagent';

export interface DemandeDeContact {
  prénom: string
  nom: string
  email: string
  téléphone: string
}

export interface DemandeDeContactEntreprise extends DemandeDeContact {
  sujet: string
  message: string
}

export interface DemandeDeContactCEJ extends DemandeDeContact {
  ville: string
  codePostal: string
  age: Age
}

export interface DemandeDeContactAccompagnement extends DemandeDeContact {
  nomCommune: string
  codeCommune: string
  age: Age
  commentaire: string
  établissement: ContactÉtablissementAccompagnement
}

export interface DemandeDeContactPOE extends DemandeDeContact {
  nomSociété: string
  siret: string
  taille: keyof typeof TailleDEntreprise
  secteur: keyof typeof SecteurDActivité
  codePostal: string
  ville: string
  nombreARecruter: string
  travail: string
  commentaire: string
}

export type Age = 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;

export function parseAge(age: number): Age {
	if (age >= 16 && age <= 30 && Math.floor(age) === age) {
		return age as Age;
	}
	throw Error(`${age} n‘est pas un âge valide`);
}