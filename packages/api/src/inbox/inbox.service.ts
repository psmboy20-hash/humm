import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { 
  IngestShareInput, 
  ConfirmInboxInput, 
  IngestSourceType, 
  InboxStatus 
} from './dto/inbox.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class InboxService {
  constructor(private prisma: PrismaService) {}

  /**
   * 공유 URL 인입 처리
   * 1. URL 메타데이터 추출
   * 2. 인박스에 PARSED 상태로 저장
   * 3. 백그라운드에서 배경 제거 작업 큐잉
   */
  async ingestShare(userId: string, input: IngestShareInput) {
    try {
      // URL에서 메타데이터 추출
      const metadata = await this.extractUrlMetadata(input.url);

      // 임시 인박스 아이템 생성 (실제 Prisma 없이 메모리로)
      const inboxItem = {
        id: `inbox_${Date.now()}`,
        userId,
        sourceType: IngestSourceType.SHARE,
        status: InboxStatus.PARSED,
        productName: metadata.title,
        brand: metadata.brand,
        imageUrl: metadata.imageUrl,
        productUrl: input.url,
        price: metadata.price,
        category: this.guessCategory(metadata.title),
        rawData: metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TODO: 실제 DB 저장
      // await this.prisma.inboxItem.create({ data: inboxItem });

      // TODO: 배경 제거 작업 큐잉
      // await this.queueBackgroundRemoval(inboxItem.id, metadata.imageUrl);

      return {
        success: true,
        inboxItemId: inboxItem.id,
        message: '상품 정보를 가져왔습니다. 인박스에서 확인해주세요.',
      };
    } catch (error) {
      throw new HttpException(
        `URL 처리 실패: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * URL 메타데이터 추출 (Open Graph, JSON-LD)
   */
  private async extractUrlMetadata(url: string) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VirtualClosetBot/1.0)',
        },
        timeout: 10000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Open Graph 메타 태그
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const ogImage = $('meta[property="og:image"]').attr('content');
      const ogPrice = $('meta[property="product:price:amount"]').attr('content');

      // JSON-LD 스키마
      let jsonLd: any = {};
      $('script[type="application/ld+json"]').each((_, elem) => {
        try {
          const data = JSON.parse($(elem).html() || '{}');
          if (data['@type'] === 'Product') {
            jsonLd = data;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      // 브랜드 추출 시도
      let brand = jsonLd.brand?.name || $('meta[property="og:brand"]').attr('content');
      
      // URL에서 브랜드 추측 (예: zigzag.kr, musinsa.com)
      if (!brand) {
        const hostname = new URL(url).hostname;
        if (hostname.includes('zigzag')) brand = '지그재그';
        else if (hostname.includes('musinsa')) brand = '무신사';
        else if (hostname.includes('29cm')) brand = '29CM';
      }

      return {
        title: ogTitle || jsonLd.name || $('title').text(),
        brand,
        imageUrl: ogImage || jsonLd.image,
        price: parseFloat(ogPrice || jsonLd.offers?.price || '0'),
        description: $('meta[name="description"]').attr('content'),
        url,
      };
    } catch (error) {
      console.error('메타데이터 추출 실패:', error.message);
      return {
        title: '상품명 추출 실패',
        imageUrl: null,
        price: 0,
        url,
      };
    }
  }

  /**
   * 상품명으로 카테고리 자동 추측
   */
  private guessCategory(productName: string): string {
    const name = productName.toLowerCase();
    
    if (name.includes('셔츠') || name.includes('니트') || name.includes('티')) return 'TOP';
    if (name.includes('팬츠') || name.includes('진') || name.includes('슬랙스')) return 'BOTTOM';
    if (name.includes('자켓') || name.includes('코트') || name.includes('패딩')) return 'OUTER';
    if (name.includes('신발') || name.includes('스니커즈') || name.includes('구두')) return 'SHOES';
    if (name.includes('가방') || name.includes('백팩')) return 'BAG';
    
    return 'TOP'; // 기본값
  }

  /**
   * 인박스 목록 조회
   */
  async getInboxItems(userId: string, status?: InboxStatus) {
    // TODO: 실제 DB 조회
    // const items = await this.prisma.inboxItem.findMany({
    //   where: { userId, status },
    //   orderBy: { createdAt: 'desc' },
    // });

    // 임시 데이터
    return {
      items: [],
      total: 0,
    };
  }

  /**
   * 인박스 아이템 확인 → 옷장으로 이동
   */
  async confirmInboxItem(userId: string, input: ConfirmInboxInput) {
    // TODO: 실제 구현
    // 1. 인박스 아이템 조회
    // 2. 옷장 아이템 생성 (배경 제거된 이미지 사용)
    // 3. 인박스 아이템 상태 CONFIRMED로 변경

    return {
      success: true,
      itemId: 'item_' + Date.now(),
      message: '옷장에 추가되었습니다.',
    };
  }

  /**
   * 인박스 아이템 거부
   */
  async rejectInboxItem(userId: string, inboxItemId: string) {
    // TODO: 상태를 REJECTED로 변경
    return { success: true };
  }
}
