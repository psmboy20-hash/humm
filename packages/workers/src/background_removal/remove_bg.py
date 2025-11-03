"""
배경 제거 모듈
rembg를 사용한 자동 배경 제거
"""
import io
from PIL import Image
from rembg import remove
import httpx
from typing import Optional


async def download_image(url: str) -> Optional[Image.Image]:
    """URL에서 이미지 다운로드"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()
            
            # 이미지로 변환
            image_data = response.content
            image = Image.open(io.BytesIO(image_data))
            return image
    except Exception as e:
        print(f"이미지 다운로드 실패: {e}")
        return None


def remove_background(input_image: Image.Image) -> Image.Image:
    """배경 제거 - PNG with alpha channel"""
    try:
        # rembg로 배경 제거 (u2netp: 경량 모델 사용)
        # u2netp는 u2net보다 4배 작고 빠르지만 정확도는 약간 낮음
        from rembg import new_session
        session = new_session("u2netp")
        output = remove(input_image, session=session)
        
        # PNG로 변환 (RGBA)
        if output.mode != 'RGBA':
            output = output.convert('RGBA')
        
        return output
    except Exception as e:
        print(f"배경 제거 실패: {e}")
        raise


def create_thumbnail(image: Image.Image, size: tuple = (512, 512)) -> Image.Image:
    """썸네일 생성 (aspect ratio 유지)"""
    image.thumbnail(size, Image.Resampling.LANCZOS)
    return image


async def process_clothing_image(image_url: str) -> dict:
    """
    옷 이미지 처리 전체 파이프라인
    1. 다운로드
    2. 배경 제거
    3. 썸네일 생성
    4. PNG 저장
    """
    # 1. 다운로드
    original_image = await download_image(image_url)
    if not original_image:
        return {
            "success": False,
            "error": "이미지 다운로드 실패"
        }
    
    # 2. 배경 제거
    try:
        silhouette = remove_background(original_image)
    except Exception as e:
        return {
            "success": False,
            "error": f"배경 제거 실패: {str(e)}"
        }
    
    # 3. 썸네일 생성
    thumbnail = create_thumbnail(silhouette.copy(), size=(512, 512))
    
    # 4. 바이트로 변환 (실제로는 S3에 업로드)
    silhouette_bytes = io.BytesIO()
    silhouette.save(silhouette_bytes, format='PNG')
    silhouette_bytes.seek(0)
    
    thumbnail_bytes = io.BytesIO()
    thumbnail.save(thumbnail_bytes, format='PNG')
    thumbnail_bytes.seek(0)
    
    return {
        "success": True,
        "silhouette": silhouette_bytes,
        "thumbnail": thumbnail_bytes,
        "format": "PNG",
        "size": silhouette.size
    }
