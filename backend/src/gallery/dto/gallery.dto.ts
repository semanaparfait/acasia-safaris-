import { IsIn, IsOptional, IsString } from 'class-validator';

export const GALLERY_CATEGORIES = [
  'Wildlife',
  'Landscapes',
  'Culture',
  'People',
];

export class GalleryItemDto {
  @IsString()
  title: string;

  @IsIn(GALLERY_CATEGORIES)
  category: string;

  @IsOptional()
  @IsString()
  location?: string;

  // URL returned by POST /api/uploads/gallery
  @IsString()
  image: string;
}
