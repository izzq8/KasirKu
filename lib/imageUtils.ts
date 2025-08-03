import { supabase } from './supabase'

/* -------------------------------------------------------------------------- */
/*                              Image Upload Utils                           */
/* -------------------------------------------------------------------------- */

// Supported image formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

/**
 * Validates image file before upload
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `Ukuran file terlalu besar. Maksimal 2MB (file Anda: ${(file.size / 1024 / 1024).toFixed(1)}MB)` 
    }
  }

  // Check file type
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP' 
    }
  }

  return { isValid: true }
}

/**
 * Upload image to Supabase Storage
 */
export const uploadProductImage = async (file: File, productId: string): Promise<{
  url?: string
  error?: string
}> => {
  try {
    // Validate file first
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      return { error: validation.error }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `product_${productId}_${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { error: `Gagal upload gambar: ${error.message}` }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Upload error:', error)
    return { error: 'Terjadi kesalahan saat upload gambar' }
  }
}

/**
 * Delete image from Supabase Storage
 */
export const deleteProductImage = async (imageUrl: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!imageUrl) return { success: true }

    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathSegments = url.pathname.split('/')
    const fileName = pathSegments[pathSegments.length - 1]
    const filePath = `products/${fileName}`

    const { error } = await supabase.storage
      .from('products')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: `Gagal hapus gambar: ${error.message}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Delete error:', error)
    return { success: false, error: 'Terjadi kesalahan saat hapus gambar' }
  }
}

/**
 * Update product image in database
 */
export const updateProductImageUrl = async (
  productId: string, 
  imageUrl: string | null,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ 
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('user_id', userId) // Ensure user can only update their own products

    if (error) {
      console.error('Database update error:', error)
      return { success: false, error: `Gagal update database: ${error.message}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Database update error:', error)
    return { success: false, error: 'Terjadi kesalahan saat update database' }
  }
}

/**
 * Complete image upload process (upload + update database)
 */
export const handleProductImageUpload = async (
  file: File,
  productId: string,
  userId: string,
  oldImageUrl?: string
): Promise<{ imageUrl?: string; error?: string }> => {
  try {
    // Delete old image if exists
    if (oldImageUrl) {
      await deleteProductImage(oldImageUrl)
    }

    // Upload new image
    const uploadResult = await uploadProductImage(file, productId)
    if (uploadResult.error) {
      return { error: uploadResult.error }
    }

    // Update database
    const updateResult = await updateProductImageUrl(productId, uploadResult.url!, userId)
    if (!updateResult.success) {
      // Cleanup uploaded file if database update fails
      if (uploadResult.url) {
        await deleteProductImage(uploadResult.url)
      }
      return { error: updateResult.error }
    }

    return { imageUrl: uploadResult.url }
  } catch (error: any) {
    console.error('Complete upload error:', error)
    return { error: 'Terjadi kesalahan saat proses upload gambar' }
  }
}

/**
 * Remove product image (delete file + update database)
 */
export const removeProductImage = async (
  productId: string,
  userId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete from storage
    const deleteResult = await deleteProductImage(imageUrl)
    if (!deleteResult.success) {
      return { success: false, error: deleteResult.error }
    }

    // Update database to remove URL
    const updateResult = await updateProductImageUrl(productId, null, userId)
    if (!updateResult.success) {
      return { success: false, error: updateResult.error }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Remove image error:', error)
    return { success: false, error: 'Terjadi kesalahan saat hapus gambar' }
  }
}
