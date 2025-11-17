import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { userId },
      include: { times: true },
      orderBy: { date: 'desc' },
    });

    const trainings = await this.prisma.training.findMany({
      where: { userId },
    });

    // Calculate statistics
    const bestTime = courses.length > 0 ? Math.min(...courses.map((c) => c.totalTime)) : null;
    const latestTime = courses.length > 0 ? courses[0].totalTime : null;
    const averageTime =
      courses.length > 0
        ? Math.round(courses.reduce((acc, c) => acc + c.totalTime, 0) / courses.length)
        : null;

    // Next Hyrox (upcoming courses)
    const upcomingCourses = await this.prisma.course.findMany({
      where: {
        userId,
        date: {
          gte: new Date(),
        },
      },
      orderBy: { date: 'asc' },
      take: 1,
    });

    return {
      success: true,
      data: {
        totalCourses: courses.length,
        totalTrainings: trainings.length,
        bestTime,
        latestTime,
        averageTime,
        nextHyrox: upcomingCourses[0] || null,
        improvement:
          bestTime && latestTime ? ((latestTime - bestTime) / bestTime) * 100 : null,
      },
    };
  }

  async getProgression(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        name: true,
        date: true,
        totalTime: true,
        category: true,
      },
    });

    return {
      success: true,
      data: courses,
    };
  }

  async getStationStats(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { userId },
      include: {
        times: true,
      },
    });

    // Group times by segment
    const stationStats: Record<string, { best: number; average: number; latest: number }> = {};

    courses.forEach((course) => {
      course.times.forEach((time) => {
        if (!stationStats[time.segment]) {
          stationStats[time.segment] = {
            best: time.timeSeconds,
            average: time.timeSeconds,
            latest: time.timeSeconds,
          };
        } else {
          stationStats[time.segment].best = Math.min(
            stationStats[time.segment].best,
            time.timeSeconds,
          );
        }
      });
    });

    // Calculate averages
    Object.keys(stationStats).forEach((segment) => {
      const times = courses.flatMap((course) =>
        course.times.filter((t) => t.segment === segment).map((t) => t.timeSeconds),
      );

      stationStats[segment].average =
        times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

      // Latest time
      const latestCourse = courses[courses.length - 1];
      const latestTime = latestCourse?.times.find((t) => t.segment === segment);
      stationStats[segment].latest = latestTime?.timeSeconds || 0;
    });

    return {
      success: true,
      data: stationStats,
    };
  }
}


