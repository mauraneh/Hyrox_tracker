import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      this.logger.log('🔄 Attempting to connect to database...');
      
      // Ajouter un timeout pour éviter que la connexion bloque indéfiniment
      const connectPromise = this.$connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout after 5 seconds')), 5000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      this.logger.log('✅ Successfully connected to database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      this.logger.warn('⚠️  Continuing without initial database connection - Prisma will retry on first query');
      // Ne pas throw l'erreur pour permettre à l'application de démarrer
      // Prisma se reconnectera automatiquement lors de la première requête
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
