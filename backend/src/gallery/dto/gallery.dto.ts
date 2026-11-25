import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// An album of the gallery page
export class GalleryAlbumDto {
  @IsString()
  @IsNotEmpty({ message: 'Give the album a name' })
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // One of the album's photos, shown on its card. Leave it out = its newest photo.
  @IsOptional()
  @IsUUID()
  coverId?: string;
}

// A photo, in an album
export class GalleryItemDto {
  @IsString()
  title: string;

  @IsUUID()
  albumId: string;

  @IsOptional()
  @IsString()
  location?: string;

  // URL returned by POST /api/uploads/gallery
  @IsString()
  image: string;
}
