import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { OutfitsModule } from './outfits/outfits.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // GraphQL 설정
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => {
        return {
          message: error.message,
          code: error.extensions?.code,
          locations: error.locations,
          path: error.path,
        };
      },
    }),

    // Feature Modules
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    OutfitsModule,
    RecommendationsModule,
  ],
})
export class AppModule {}
