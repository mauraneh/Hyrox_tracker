import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createCourseDto: CreateCourseDto) {
    const { times, ...courseData } = createCourseDto;

    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        userId,
        times: {
          create: times.map((time) => ({
            segment: time.segment,
            timeSeconds: time.timeSeconds,
          })),
        },
      },
      include: {
        times: true,
      },
    });

    return {
      success: true,
      data: course,
      message: 'Course created successfully',
    };
  }

  async findAll(
    userId: string,
    filters: {
      category?: string;
      sortBy?: 'date' | 'totalTime';
      order?: 'asc' | 'desc';
    },
  ) {
    const courses = await this.prisma.course.findMany({
      where: {
        userId,
        ...(filters.category && { category: filters.category }),
      },
      include: {
        times: true,
      },
      orderBy: {
        [filters.sortBy || 'date']: filters.order || 'desc',
      },
    });

    return {
      success: true,
      data: courses,
    };
  }

  async findOne(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        times: {
          orderBy: {
            segment: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      success: true,
      data: course,
    };
  }

  async update(id: string, userId: string, updateCourseDto: UpdateCourseDto) {
    // Check ownership
    const existingCourse = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    if (existingCourse.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const { times, ...courseData } = updateCourseDto;

    // Update course and times
    const course = await this.prisma.course.update({
      where: { id },
      data: {
        ...courseData,
        ...(times && {
          times: {
            deleteMany: {},
            create: times.map((time) => ({
              segment: time.segment,
              timeSeconds: time.timeSeconds,
            })),
          },
        }),
      },
      include: {
        times: true,
      },
    });

    return {
      success: true,
      data: course,
      message: 'Course updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    // Check ownership
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }
}
