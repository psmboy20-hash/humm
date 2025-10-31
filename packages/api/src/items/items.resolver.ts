import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { 
  CreateItemInput, 
  UpdateItemInput, 
  ItemFilters, 
  ItemType, 
  ItemsResponse 
} from './dto/items.dto';
// import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => ItemType)
// @UseGuards(GqlAuthGuard) // 인증 가드 (나중에 활성화)
export class ItemsResolver {
  constructor(private itemsService: ItemsService) {}

  /**
   * 옷장 아이템 생성
   */
  @Mutation(() => ItemType)
  async createItem(
    @Args('input') input: CreateItemInput,
    // @CurrentUser() user: any,
  ): Promise<ItemType> {
    // 임시로 하드코딩된 userId 사용 (실제로는 인증된 사용자)
    const userId = 'temp-user-id';
    return this.itemsService.createItem(userId, input);
  }

  /**
   * 옷장 아이템 조회 (단일)
   */
  @Query(() => ItemType)
  async item(
    @Args('id') id: string,
    // @CurrentUser() user: any,
  ): Promise<ItemType> {
    const userId = 'temp-user-id';
    return this.itemsService.getItem(id, userId);
  }

  /**
   * 옷장 아이템 목록 조회
   */
  @Query(() => ItemsResponse)
  async items(
    @Args('filters', { nullable: true }) filters?: ItemFilters,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip?: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take?: number,
    // @CurrentUser() user: any,
  ): Promise<ItemsResponse> {
    const userId = 'temp-user-id';
    return this.itemsService.getItems(userId, filters, undefined, skip, take);
  }

  /**
   * 옷장 아이템 수정
   */
  @Mutation(() => ItemType)
  async updateItem(
    @Args('id') id: string,
    @Args('input') input: UpdateItemInput,
    // @CurrentUser() user: any,
  ): Promise<ItemType> {
    const userId = 'temp-user-id';
    return this.itemsService.updateItem(id, userId, input);
  }

  /**
   * 옷장 아이템 아카이브
   */
  @Mutation(() => ItemType)
  async archiveItem(
    @Args('id') id: string,
    // @CurrentUser() user: any,
  ): Promise<ItemType> {
    const userId = 'temp-user-id';
    return this.itemsService.archiveItem(id, userId);
  }

  /**
   * 옷장 아이템 삭제
   */
  @Mutation(() => Boolean)
  async deleteItem(
    @Args('id') id: string,
    // @CurrentUser() user: any,
  ): Promise<boolean> {
    const userId = 'temp-user-id';
    await this.itemsService.deleteItem(id, userId);
    return true;
  }

  /**
   * 착용 횟수 증가
   */
  @Mutation(() => ItemType)
  async incrementWearCount(
    @Args('id') id: string,
    // @CurrentUser() user: any,
  ): Promise<ItemType> {
    const userId = 'temp-user-id';
    return this.itemsService.incrementWearCount(id, userId);
  }
}
