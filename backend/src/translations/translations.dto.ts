import { IsObject } from 'class-validator';

// { values: { "title": "Trek des gorilles", "perks|Free airport pickup": "Accueil gratuit à l'aéroport" } }
export class SaveTranslationsDto {
  @IsObject()
  values: Record<string, string>;
}
