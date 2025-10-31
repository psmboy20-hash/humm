import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InboxService } from './inbox.service';
import { IngestShareInput, ConfirmInboxInput } from './dto/inbox.dto';

@ApiTags('inbox')
@Controller('api/inbox')
export class InboxController {
  constructor(private inboxService: InboxService) {}

  /**
   * POST /api/inbox/share
   * 공유하기 URL 인입
   */
  @Post('share')
  @ApiOperation({ summary: '공유 URL 인입' })
  async ingestShare(@Body() input: IngestShareInput) {
    const userId = 'temp-user-id';
    return this.inboxService.ingestShare(userId, input);
  }

  /**
   * GET /api/inbox
   * 인박스 목록 조회
   */
  @Get()
  @ApiOperation({ summary: '인박스 목록' })
  async getInbox(@Query('status') status?: string) {
    const userId = 'temp-user-id';
    return this.inboxService.getInboxItems(userId, status as any);
  }

  /**
   * POST /api/inbox/:id/confirm
   * 인박스 아이템 확인 (옷장으로 이동)
   */
  @Post(':id/confirm')
  @ApiOperation({ summary: '인박스 아이템 확인' })
  async confirm(@Param('id') id: string, @Body() input: Partial<ConfirmInboxInput>) {
    const userId = 'temp-user-id';
    return this.inboxService.confirmInboxItem(userId, {
      inboxItemId: id,
      ...input,
    });
  }

  /**
   * POST /api/inbox/:id/reject
   * 인박스 아이템 거부
   */
  @Post(':id/reject')
  @ApiOperation({ summary: '인박스 아이템 거부' })
  async reject(@Param('id') id: string) {
    const userId = 'temp-user-id';
    return this.inboxService.rejectInboxItem(userId, id);
  }
}
