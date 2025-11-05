import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { jsPDF } from "https://cdn.skypack.dev/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📜 Starting certificate generation');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ User authentication failed:', userError?.message);
      throw new Error('Unauthorized');
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const body = await req.json();
    const { internId } = body;
    
    if (!internId) {
      throw new Error('Missing required parameter: internId');
    }
    
    console.log('🔍 Fetching intern profile:', internId);

    // Fetch intern profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', internId)
      .single();

    if (profileError || !profile) {
      throw new Error('Intern profile not found');
    }

    // Check if intern completed 6 months
    const startDate = new Date(profile.start_date);
    const endDate = profile.end_date ? new Date(profile.end_date) : new Date();
    const monthsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsDiff < 6) {
      return new Response(
        JSON.stringify({ 
          error: 'Intern has not completed 6 months yet',
          eligible: false,
          monthsCompleted: Math.floor(monthsDiff),
          monthsRemaining: Math.ceil(6 - monthsDiff)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch additional data
    const { data: tasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('assigned_to', internId)
      .eq('status', 'verified');

    const { data: timeLogs } = await supabaseClient
      .from('time_logs')
      .select('hours_logged')
      .eq('user_id', internId);

    const completedTasks = tasks?.length || 0;
    const totalHours = timeLogs?.reduce((sum, log) => sum + (log.hours_logged || 0), 0) || 0;

    // Generate certificate PDF (simplified version)
    const certificateData = {
      internName: profile.full_name,
      employeeId: profile.employee_id,
      department: profile.department,
      startDate: new Date(profile.start_date).toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      completedTasks,
      totalHours: Math.round(totalHours),
      totalCoins: profile.total_coins,
      issueDate: new Date().toLocaleDateString()
    };

    // Create PDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add content
    doc.setFontSize(28);
    doc.text('CERTIFICATE OF COMPLETION', 148, 40, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('This is to certify that', 148, 60, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(certificateData.internName, 148, 80, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`Employee ID: ${certificateData.employeeId}`, 148, 95, { align: 'center' });
    doc.text(`Department: ${certificateData.department}`, 148, 105, { align: 'center' });
    doc.text(`Duration: ${certificateData.startDate} to ${certificateData.endDate}`, 148, 115, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Completed Tasks: ${certificateData.completedTasks}`, 148, 130, { align: 'center' });
    doc.text(`Total Hours: ${certificateData.totalHours}`, 148, 138, { align: 'center' });
    doc.text(`Total Coins: ${certificateData.totalCoins}`, 148, 146, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Issue Date: ${certificateData.issueDate}`, 148, 170, { align: 'center' });

    // Get PDF as blob
    const pdfBlob = doc.output('blob');
    const fileName = `certificate-${profile.employee_id}-${Date.now()}.pdf`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('certificates')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload certificate');
    }

    // Get signed URL
    const { data: urlData } = await supabaseClient
      .storage
      .from('certificates')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    console.log('✅ Certificate generated successfully for:', profile.full_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: urlData?.signedUrl,
        fileName,
        certificateData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});