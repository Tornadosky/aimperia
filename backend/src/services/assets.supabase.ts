import { supabase } from '../db/supabase.js';

/**
 * Store an asset to Supabase Storage using service role key
 * @param id - Unique identifier for the asset
 * @param data - The file data as a Buffer
 * @returns Promise<void> - Resolves when upload is complete
 */
export async function storeAsset(id: string, data: Buffer): Promise<void> {
  try {
    console.log(`📤 Uploading asset to Supabase Storage: ${id}`);

    // Upload the file to the lesson-assets bucket
    const { error: uploadError } = await supabase.storage
      .from('lesson-assets')
      .upload(id, data, {
        contentType: 'application/octet-stream', // Generic binary type
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error('❌ Supabase Storage upload error:', uploadError);
      throw new Error(`Failed to upload asset: ${uploadError.message}`);
    }

    console.log(`✅ Asset uploaded successfully: ${id}`);
  } catch (error) {
    console.error('❌ Asset storage error:', error);
    throw error;
  }
}

/**
 * Get a public signed URL for an existing asset
 * @param id - Unique identifier for the asset
 * @param expiresIn - TTL in seconds (default: 1 hour)
 * @returns Promise<string> - Public URL of the asset
 */
export async function getPublicAssetUrl(id: string, expiresIn: number = 3600): Promise<string> {
  try {
    console.log(`🔗 Generating public URL for asset: ${id} (expires in ${expiresIn}s)`);

    // Generate a signed URL with specified TTL
    const { data: signedUrlData, error } = await supabase.storage
      .from('lesson-assets')
      .createSignedUrl(id, expiresIn);

    if (error) {
      console.error('❌ Failed to generate signed URL:', error);
      throw new Error(`Failed to generate asset URL: ${error.message}`);
    }

    if (!signedUrlData?.signedUrl) {
      throw new Error('No signed URL returned from Supabase');
    }

    console.log(`✅ Generated public URL for asset: ${id}`);
    return signedUrlData.signedUrl;
  } catch (error) {
    console.error('❌ Get asset URL error:', error);
    throw error;
  }
}