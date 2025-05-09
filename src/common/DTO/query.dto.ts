import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { SortOrder } from "mongoose";

export class QueryOptionsDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsString()
  @IsOptional()
  sort: { [key: string]: SortOrder };
}
