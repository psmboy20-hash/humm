/**
 * 29cm 크롤러
 * 상품 페이지에서 디테일컷 추출
 */
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Product29cm {
  url: string;
  name: string;
  brand: string;
  price: number;
  thumbnailUrl: string;        // 작은 썸네일
  originalImageUrl: string;    // 배경 제거용 고화질 이미지
  detailImages: string[];      // 모든 상세 이미지
}

/**
 * 29cm 상품 페이지 크롤링
 */
export async function crawl29cmProduct(url: string): Promise<Product29cm> {
  try {
    // User-Agent 설정 (봇 차단 우회)
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 1. 기본 정보 추출
    const productName = extractProductName($);
    const brand = extractBrand($);
    const price = extractPrice($);
    const thumbnailUrl = extractThumbnail($);
    
    // 2. 상세 이미지들 추출 (핵심!)
    const detailImages = extractDetailImages($);
    
    // 3. 배경 제거용 최적 이미지 선택
    const originalImageUrl = selectBestImageForBackgroundRemoval(detailImages, thumbnailUrl);

    return {
      url,
      name: productName,
      brand,
      price,
      thumbnailUrl,
      originalImageUrl,
      detailImages,
    };
  } catch (error) {
    console.error('29cm crawling error:', error);
    
    // 크롤링 실패 시 기본값 반환
    return {
      url,
      name: `29cm 상품 - ${url.split('/').pop()}`,
      brand: '29CM',
      price: 0,
      thumbnailUrl: 'https://img.29cm.co.kr/mall/og_image.png',
      originalImageUrl: 'https://img.29cm.co.kr/mall/og_image.png',
      detailImages: [],
    };
  }
}

/**
 * 상품명 추출
 */
function extractProductName($: cheerio.CheerioAPI): string {
  // Next.js 앱이라 JSON-LD에서 추출
  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript);
      if (jsonLd.name) return jsonLd.name;
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }

  // meta 태그에서 추출
  const ogTitle = $('meta[property="og:title"]').attr('content');
  if (ogTitle) return ogTitle.replace(' - 29CM', '').trim();

  // title 태그에서 추출
  const title = $('title').text();
  return title.replace(' - 29CM', '').trim();
}

/**
 * 브랜드명 추출
 */
function extractBrand($: cheerio.CheerioAPI): string {
  // JSON-LD에서 브랜드 추출
  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript);
      if (jsonLd.brand?.name) return jsonLd.brand.name;
    } catch (e) {}
  }

  // meta 태그에서 추출
  const brandMeta = $('meta[property="product:brand"]').attr('content');
  if (brandMeta) return brandMeta;

  return '29CM';
}

/**
 * 가격 추출
 */
function extractPrice($: cheerio.CheerioAPI): number {
  // JSON-LD에서 가격 추출
  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript);
      if (jsonLd.offers?.price) {
        return parseFloat(jsonLd.offers.price);
      }
    } catch (e) {}
  }

  // meta 태그에서 추출
  const priceMeta = $('meta[property="product:price:amount"]').attr('content');
  if (priceMeta) {
    return parseFloat(priceMeta);
  }

  return 0;
}

/**
 * 썸네일 URL 추출
 */
function extractThumbnail($: cheerio.CheerioAPI): string {
  // og:image (작은 썸네일)
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) return ogImage;

  // JSON-LD image
  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript);
      if (jsonLd.image) {
        return Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
      }
    } catch (e) {}
  }

  return 'https://img.29cm.co.kr/mall/og_image.png';
}

/**
 * 상세 이미지들 추출 (핵심!)
 * 29cm는 img 태그들이 많이 있음
 */
function extractDetailImages($: cheerio.CheerioAPI): string[] {
  const images: string[] = [];

  // JSON-LD에서 이미지 배열 추출
  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript);
      if (jsonLd.image && Array.isArray(jsonLd.image)) {
        images.push(...jsonLd.image);
      }
    } catch (e) {}
  }

  // img 태그에서 추출
  $('img').each((_, elem) => {
    const src = $(elem).attr('src') || $(elem).attr('data-src');
    if (src && isValidProductImage(src)) {
      // 고화질 URL로 변환
      const highResUrl = convertToHighResolution(src);
      if (!images.includes(highResUrl)) {
        images.push(highResUrl);
      }
    }
  });

  return images.filter(url => url.length > 0);
}

/**
 * 유효한 상품 이미지인지 확인
 */
function isValidProductImage(url: string): boolean {
  if (!url) return false;
  
  // 29cm CDN 이미지만 허용
  if (!url.includes('29cm.co.kr') && !url.includes('img.29cm')) {
    return false;
  }

  // 제외할 이미지들
  const excludePatterns = [
    'logo',
    'icon',
    'banner',
    'event',
    'favicon',
    'og_image',
    'thumbnail', // 작은 썸네일 제외
  ];

  return !excludePatterns.some(pattern => url.toLowerCase().includes(pattern));
}

/**
 * 고화질 URL로 변환
 * 29cm은 URL에 리사이즈 파라미터가 있음
 */
function convertToHighResolution(url: string): string {
  // 이미 https인 경우
  if (url.startsWith('https://')) {
    // 리사이즈 파라미터 제거하여 원본 크기로
    return url
      .replace(/\/resize\/\d+_\d+/, '')
      .replace(/\?.*$/, ''); // 쿼리 파라미터 제거
  }

  // 상대 경로인 경우
  if (url.startsWith('/')) {
    return `https://img.29cm.co.kr${url}`;
  }

  return url;
}

/**
 * 배경 제거용 최적 이미지 선택
 * 우선순위:
 * 1. 'detail', 'product' 포함
 * 2. 두 번째 이미지 (보통 단품컷)
 * 3. 첫 번째 이미지
 * 4. 썸네일
 */
function selectBestImageForBackgroundRemoval(
  images: string[],
  fallbackThumbnail: string
): string {
  if (images.length === 0) {
    return fallbackThumbnail;
  }

  // 1순위: detail, product 키워드 포함
  const detailImage = images.find(url =>
    url.includes('detail') || 
    url.includes('product') ||
    url.includes('main')
  );
  if (detailImage) return detailImage;

  // 2순위: 두 번째 이미지 (첫번째는 보통 착용컷)
  if (images.length >= 2) {
    return images[1];
  }

  // 3순위: 첫 번째 이미지
  return images[0];
}

/**
 * 여러 상품 크롤링
 */
export async function crawlMultiple29cmProducts(urls: string[]): Promise<Product29cm[]> {
  const results = await Promise.allSettled(
    urls.map(url => crawl29cmProduct(url))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<Product29cm> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
}
