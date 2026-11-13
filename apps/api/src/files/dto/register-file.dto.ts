import { IsString, MaxLength, MinLength } from 'class-validator'

// POST /v1/files is multipart/form-data: the text fields arrive as strings
// and the file itself is read by the controller from multer (request.file),
// never through the DTO.
export class RegisterFileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  familyCode!: string
}
