import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { 
  CreateItemInput, 
  UpdateItemInput, 
  ItemFilters, 
  ItemSortOptions 
} from './dto/items.dto';
import { ItemCategory, ItemSeason, SourceType } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 옷장 아이템 생성
   */
  async createItem(userId: string, input: CreateItemInput) {
    const { sourceType, sourceRawData, ...itemData } = input;

    return this.prisma.clothingItem.create({
      data: {
        ...itemData,
        userId,
        tags: input.tags || [],
        source: sourceType
          ? {
              create: {
                sourceType,
                rawData: sourceRawData,
              },
            }
          : undefined,
      },
      include: {
        source: true,
      },
    });
  }

  /**
   * 옷장 아이템 조회 (단일)
   */
  async getItem(itemId: string, userId: string) {
    const item = await this.prisma.clothingItem.findFirst({
      where: { id: itemId, userId },
      include: {
        source: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    return item;
  }

  /**
   * 옷장 아이템 목록 조회 (필터링, 정렬, 페이지네이션)
   */
  async getItems(
    userId: string,
    filters?: ItemFilters,
    sort?: ItemSortOptions,
    skip = 0,
    take = 20,
  ) {
    const where: any = {
      userId,
      isArchived: filters?.isArchived ?? false,
    };

    // 필터 적용
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.season) {
      where.season = filters.season;
    }
    if (filters?.brand) {
      where.brand = { contains: filters.brand, mode: 'insensitive' };
    }
    if (filters?.color) {
      where.color = { contains: filters.color, mode: 'insensitive' };
    }
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // 정렬
    const orderBy: any = {};
    if (sort) {
      orderBy[sort.field] = sort.order;
    } else {
      orderBy.createdAt = 'desc'; // 기본: 최신순
    }

    const [items, total] = await Promise.all([
      this.prisma.clothingItem.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          source: true,
        },
      }),
      this.prisma.clothingItem.count({ where }),
    ]);

    return {
      items,
      total,
      hasMore: skip + take < total,
    };
  }

  /**
   * 옷장 아이템 수정
   */
  async updateItem(itemId: string, userId: string, input: UpdateItemInput) {
    // 권한 확인
    await this.getItem(itemId, userId);

    return this.prisma.clothingItem.update({
      where: { id: itemId },
      data: input,
      include: {
        source: true,
      },
    });
  }

  /**
   * 옷장 아이템 삭제 (소프트 삭제 - 아카이브)
   */
  async archiveItem(itemId: string, userId: string) {
    await this.getItem(itemId, userId);

    return this.prisma.clothingItem.update({
      where: { id: itemId },
      data: { isArchived: true },
    });
  }

  /**
   * 옷장 아이템 영구 삭제
   */
  async deleteItem(itemId: string, userId: string) {
    await this.getItem(itemId, userId);

    return this.prisma.clothingItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * 착용 횟수 증가
   */
  async incrementWearCount(itemId: string, userId: string) {
    await this.getItem(itemId, userId);

    return this.prisma.clothingItem.update({
      where: { id: itemId },
      data: {
        wearCount: { increment: 1 },
        lastWornAt: new Date(),
      },
    });
  }

  /**
   * 카테고리별 통계
   */
  async getCategoryStats(userId: string) {
    const items = await this.prisma.clothingItem.findMany({
      where: { userId, isArchived: false },
      select: { category: true },
    });

    const stats: Record<ItemCategory, number> = {} as any;
    
    items.forEach((item) => {
      stats[item.category] = (stats[item.category] || 0) + 1;
    });

    return stats;
  }
}
