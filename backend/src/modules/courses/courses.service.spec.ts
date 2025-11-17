import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

describe('CoursesService', () => {
  let service: CoursesService;

  const mockPrismaService = {
    course: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const userId = 'user-id';
      const createCourseDto: CreateCourseDto = {
        name: 'Hyrox Paris',
        city: 'Paris',
        date: '2024-03-15',
        category: 'Men',
        totalTime: 5400,
        times: [{ segment: 'run1', timeSeconds: 240 }],
      };

      const mockCourse = {
        id: 'course-id',
        userId,
        ...createCourseDto,
        times: createCourseDto.times.map((t) => ({ id: 'time-id', courseId: 'course-id', ...t })),
      };

      mockPrismaService.course.create.mockResolvedValue(mockCourse);

      const result = await service.create(userId, createCourseDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
      expect(mockPrismaService.course.create).toHaveBeenCalledWith({
        data: {
          name: createCourseDto.name,
          city: createCourseDto.city,
          date: createCourseDto.date,
          category: createCourseDto.category,
          totalTime: createCourseDto.totalTime,
          userId,
          times: {
            create: createCourseDto.times,
          },
        },
        include: { times: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      const courseId = 'course-id';
      const userId = 'user-id';
      const mockCourse = {
        id: courseId,
        userId,
        name: 'Hyrox Paris',
        times: [],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.findOne(courseId, userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockCourse = {
        id: 'course-id',
        userId: 'other-user-id',
        name: 'Hyrox Paris',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.findOne('course-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a course', async () => {
      const courseId = 'course-id';
      const userId = 'user-id';
      const mockCourse = {
        id: courseId,
        userId,
        name: 'Hyrox Paris',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.course.delete.mockResolvedValue(mockCourse);

      const result = await service.remove(courseId, userId);

      expect(result.success).toBe(true);
      expect(mockPrismaService.course.delete).toHaveBeenCalledWith({ where: { id: courseId } });
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id', 'user-id')).rejects.toThrow(NotFoundException);
    });
  });
});
