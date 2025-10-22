"""
Cloudinary configuration and upload utilities
"""
import cloudinary
import cloudinary.uploader
import os
from config import Config

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', ''),
    api_key=os.getenv('CLOUDINARY_API_KEY', ''),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', ''),
    secure=True
)

def upload_image_to_cloudinary(file, folder="voting-system/profiles"):
    """
    Upload an image to Cloudinary
    
    Args:
        file: File object to upload
        folder: Cloudinary folder path (default: voting-system/profiles)
    
    Returns:
        dict: Upload result containing 'url' and 'public_id'
        None: If upload fails
    """
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="image",
            transformation=[
                {'width': 500, 'height': 500, 'crop': 'limit'},  # Max dimensions
                {'quality': 'auto'},  # Auto quality
                {'fetch_format': 'auto'}  # Auto format (WebP if supported)
            ]
        )
        
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id')
        }
    except Exception as e:
        print(f"❌ Cloudinary upload error: {e}")
        return None

def delete_image_from_cloudinary(public_id):
    """
    Delete an image from Cloudinary
    
    Args:
        public_id: Cloudinary public ID of the image
    
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"❌ Cloudinary delete error: {e}")
        return False
