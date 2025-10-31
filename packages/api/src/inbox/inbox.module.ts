import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxResolver } from './inbox.resolver';
import { InboxController } from './inbox.controller';

@Module({
  providers: [InboxService, InboxResolver],
  controllers: [InboxController],
  exports: [InboxService],
})
export class InboxModule {}
