import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CourseTimeDto {
  @ApiProperty({ example: 'run1' })
  @IsString()
  segment: string;

  @ApiProperty({ example: 240 })
  @IsInt()
  @Min(0)
  timeSeconds: number;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Hyrox Paris 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  city: string;

  @ApiProperty({ example: '2024-03-15T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Men' })
  @IsString()
  category: string;

  @ApiProperty({ example: 5400 })
  @IsInt()
  @Min(0)
  totalTime: number;

  @ApiProperty({ example: 'Great performance!', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CourseTimeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseTimeDto)
  times: CourseTimeDto[];
}
