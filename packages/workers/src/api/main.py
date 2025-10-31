"""
Virtual Closet Workers API
FastAPI 서버 - 이메일 파싱, OCR, 이미지 처리 워커
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Virtual Closet Workers API",
    description="이메일 파싱, OCR, 이미지 처리 워커 API",
    version="0.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 모델 정의
# ============================================

class EmailParseRequest(BaseModel):
    email_html: str
    provider: str  # GMAIL, NAVER

class EmailParseResponse(BaseModel):
    success: bool
    items: List[dict]
    raw_data: Optional[dict] = None

class URLMetadataRequest(BaseModel):
    url: HttpUrl

class URLMetadataResponse(BaseModel):
    success: bool
    title: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

class OCRRequest(BaseModel):
    image_url: HttpUrl

class OCRResponse(BaseModel):
    success: bool
    text: str
    confidence: float
    extracted_fields: Optional[dict] = None

# ============================================
# 헬스체크
# ============================================

@app.get("/")
async def root():
    return {
        "service": "Virtual Closet Workers",
        "version": "0.1.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ============================================
# 이메일 파싱
# ============================================

@app.post("/api/parse-email", response_model=EmailParseResponse)
async def parse_email(request: EmailParseRequest):
    """
    이메일 HTML을 파싱하여 구매 아이템 정보 추출
    - Gmail/네이버 쇼핑 영수증 지원
    """
    try:
        logger.info(f"Parsing email from provider: {request.provider}")
        
        # TODO: 실제 파싱 로직 구현
        # from src.email_parser import parse_shopping_email
        # result = parse_shopping_email(request.email_html, request.provider)
        
        # 임시 응답
        return EmailParseResponse(
            success=True,
            items=[
                {
                    "name": "Sample Item",
                    "brand": "Sample Brand",
                    "price": 50000,
                    "purchase_date": "2024-01-01",
                    "image_url": "https://example.com/image.jpg",
                    "product_url": "https://example.com/product"
                }
            ],
            raw_data={"provider": request.provider}
        )
    except Exception as e:
        logger.error(f"Email parsing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# URL 메타데이터 추출
# ============================================

@app.post("/api/extract-metadata", response_model=URLMetadataResponse)
async def extract_url_metadata(request: URLMetadataRequest):
    """
    공유된 상품 URL에서 메타데이터 추출
    - Open Graph, JSON-LD 파싱
    """
    try:
        logger.info(f"Extracting metadata from URL: {request.url}")
        
        # TODO: 실제 메타데이터 추출 로직
        # from src.metadata_extractor import extract_product_metadata
        # result = extract_product_metadata(str(request.url))
        
        # 임시 응답
        return URLMetadataResponse(
            success=True,
            title="Sample Product",
            brand="Sample Brand",
            price="50,000원",
            image_url="https://example.com/image.jpg",
            description="Sample product description"
        )
    except Exception as e:
        logger.error(f"Metadata extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# OCR (스크린샷 → 텍스트)
# ============================================

@app.post("/api/ocr", response_model=OCRResponse)
async def perform_ocr(request: OCRRequest):
    """
    이미지에서 텍스트 추출 (OCR)
    - Tesseract OCR 사용
    - 한글/영어 지원
    """
    try:
        logger.info(f"Performing OCR on image: {request.image_url}")
        
        # TODO: 실제 OCR 로직
        # from src.ocr import extract_text_from_image
        # result = extract_text_from_image(str(request.image_url))
        
        # 임시 응답
        return OCRResponse(
            success=True,
            text="Sample extracted text",
            confidence=0.95,
            extracted_fields={
                "brand": "Sample Brand",
                "price": "50000"
            }
        )
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# 이미지 처리
# ============================================

@app.post("/api/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    이미지 처리 (리사이징, 누끼, 썸네일 생성)
    """
    try:
        logger.info(f"Processing image: {file.filename}")
        
        # TODO: 실제 이미지 처리 로직
        # from src.image_processor import process_clothing_image
        # result = process_clothing_image(file)
        
        return {
            "success": True,
            "original_url": "https://example.com/original.jpg",
            "thumbnail_url": "https://example.com/thumb.jpg",
            "silhouette_url": "https://example.com/silhouette.png"
        }
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
