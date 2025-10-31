import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemInput, UpdateItemInput, ItemFilters } from './dto/items.dto';

/**
 * REST API Controller (내부용 또는 레거시 지원)
 * 주로 GraphQL을 사용하지만, 일부 케이스에서 REST 필요
 */
@ApiTags('items')
@Controller('api/items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: '옷장 아이템 생성' })
  @ApiResponse({ status: 201, description: '아이템 생성 성공' })
  async create(@Body() input: CreateItemInput) {
    const userId = 'temp-user-id'; // TODO: 인증된 사용자
    return this.itemsService.createItem(userId, input);
  }

  @Get()
  @ApiOperation({ summary: '옷장 아이템 목록 조회' })
  async getAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('category') category?: string,
  ) {
    const userId = 'temp-user-id';
    const filters: ItemFilters = category ? { category: category as any } : {};
    return this.itemsService.getItems(userId, filters, undefined, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: '옷장 아이템 조회' })
  async getOne(@Param('id') id: string) {
    const userId = 'temp-user-id';
    return this.itemsService.getItem(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: '옷장 아이템 수정' })
  async update(@Param('id') id: string, @Body() input: UpdateItemInput) {
    const userId = 'temp-user-id';
    return this.itemsService.updateItem(id, userId, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: '옷장 아이템 삭제' })
  async delete(@Param('id') id: string) {
    const userId = 'temp-user-id';
    await this.itemsService.deleteItem(id, userId);
    return { success: true };
  }

  @Get('stats/category')
  @ApiOperation({ summary: '카테고리별 통계' })
  async getCategoryStats() {
    const userId = 'temp-user-id';
    return this.itemsService.getCategoryStats(userId);
  }
}
