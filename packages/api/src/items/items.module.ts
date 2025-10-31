import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsResolver } from './items.resolver';
import { ItemsController } from './items.controller';

@Module({
  providers: [ItemsService, ItemsResolver],
  controllers: [ItemsController],
  exports: [ItemsService],
})
export class ItemsModule {}
