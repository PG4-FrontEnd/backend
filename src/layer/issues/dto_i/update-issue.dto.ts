import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsNotEmpty, 
  IsArray, 
  ValidateNested,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

// 순서 업데이트를 위한 DTO
export class UpdateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  issueId!: number;

  @IsNumber()
  @IsNotEmpty()
  tagId!: number;

  @IsNumber()
  @IsNotEmpty()
  order!: number;
}

// 배치 업데이트를 위한 DTO
export class BatchUpdateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDto)
  @IsNotEmpty()
  updates!: UpdateOrderDto[];
}

// 기존 이슈 업데이트 DTO
export class UpdateIssueDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  manager?: string;

  @IsString()
  @IsOptional()
  contents?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsNumber()
  @IsOptional()
  tagId?: number;

  @IsNumber()
  @IsOptional()
  order?: number;
}