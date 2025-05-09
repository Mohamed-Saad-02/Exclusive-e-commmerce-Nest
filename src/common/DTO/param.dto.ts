import { IsMongoId } from "class-validator";

export class IdParamDTO {
  @IsMongoId()
  id: string;
}
