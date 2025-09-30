import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Max(100)
  limit: number = 24;

  @IsOptional()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  query?: string;

  @IsOptional()
  accountingGroupId?: string;
}

export type PaginationInfo = {
  results: number;
};

export type PaginatedResultsI<T> = PaginationInfo & {
  items: T[];
};
