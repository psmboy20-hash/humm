import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InboxService } from './inbox.service';
import { 
  InboxItemType, 
  IngestShareInput, 
  IngestResponse, 
  ConfirmInboxInput,
  InboxStatus 
} from './dto/inbox.dto';

@Resolver(() => InboxItemType)
export class InboxResolver {
  constructor(private inboxService: InboxService) {}

  /**
   * 공유 URL 인입
   */
  @Mutation(() => IngestResponse)
  async ingestShare(
    @Args('input') input: IngestShareInput,
  ): Promise<IngestResponse> {
    const userId = 'temp-user-id'; // TODO: 인증
    return this.inboxService.ingestShare(userId, input);
  }

  /**
   * 인박스 목록 조회
   */
  @Query(() => [InboxItemType])
  async inboxItems(
    @Args('status', { nullable: true }) status?: InboxStatus,
  ): Promise<InboxItemType[]> {
    const userId = 'temp-user-id';
    const result = await this.inboxService.getInboxItems(userId, status);
    return result.items;
  }

  /**
   * 인박스 아이템 확인 (옷장으로 이동)
   */
  @Mutation(() => IngestResponse)
  async confirmInboxItem(
    @Args('input') input: ConfirmInboxInput,
  ): Promise<any> {
    const userId = 'temp-user-id';
    return this.inboxService.confirmInboxItem(userId, input);
  }

  /**
   * 인박스 아이템 거부
   */
  @Mutation(() => IngestResponse)
  async rejectInboxItem(
    @Args('inboxItemId') inboxItemId: string,
  ): Promise<any> {
    const userId = 'temp-user-id';
    return this.inboxService.rejectInboxItem(userId, inboxItemId);
  }
}
