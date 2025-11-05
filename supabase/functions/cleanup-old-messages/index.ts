import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗑️ Starting cleanup of old messages and attachments...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date 60 days ago
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const cutoffDate = sixtyDaysAgo.toISOString();

    console.log(`📅 Cutoff date: ${cutoffDate}`);

    // Step 1: Get old file attachments before deleting
    const { data: oldAttachments, error: attachmentFetchError } = await supabase
      .from('file_attachments')
      .select('id, storage_path')
      .lt('created_at', cutoffDate);

    if (attachmentFetchError) {
      console.error('❌ Error fetching old attachments:', attachmentFetchError);
      throw attachmentFetchError;
    }

    console.log(`📎 Found ${oldAttachments?.length || 0} old attachments to delete`);

    // Step 2: Delete files from storage
    if (oldAttachments && oldAttachments.length > 0) {
      const filePaths = oldAttachments.map(att => att.storage_path);
      
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('attachments')
        .remove(filePaths);

      if (storageError) {
        console.error('⚠️ Error deleting files from storage:', storageError);
      } else {
        console.log(`✅ Deleted ${filePaths.length} files from storage`);
      }
    }

    // Step 3: Delete file_attachments records
    const { error: attachmentDeleteError } = await supabase
      .from('file_attachments')
      .delete()
      .lt('created_at', cutoffDate);

    if (attachmentDeleteError) {
      console.error('❌ Error deleting file_attachments:', attachmentDeleteError);
      throw attachmentDeleteError;
    }

    // Step 4: Delete old message_attachments
    const { error: msgAttachmentError } = await supabase
      .from('message_attachments')
      .delete()
      .lt('created_at', cutoffDate);

    if (msgAttachmentError) {
      console.error('❌ Error deleting message_attachments:', msgAttachmentError);
    }

    // Step 5: Delete old messages
    const { data: deletedMessages, error: messageDeleteError } = await supabase
      .from('messages')
      .delete()
      .lt('created_at', cutoffDate)
      .select('id');

    if (messageDeleteError) {
      console.error('❌ Error deleting messages:', messageDeleteError);
      throw messageDeleteError;
    }

    const stats = {
      messages_deleted: deletedMessages?.length || 0,
      attachments_deleted: oldAttachments?.length || 0,
      cutoff_date: cutoffDate,
      cleanup_timestamp: new Date().toISOString()
    };

    console.log('✅ Cleanup completed successfully:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        stats
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
