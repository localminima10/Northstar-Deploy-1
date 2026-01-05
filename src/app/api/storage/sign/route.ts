import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { filename, contentType } = body;
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }
    
    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Allowed: jpeg, png, gif, webp' },
        { status: 400 }
      );
    }
    
    // Generate unique path scoped to user
    const ext = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
    const path = `${user.id}/${uniqueFilename}`;
    
    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from('vision-tiles')
      .createSignedUploadUrl(path);
    
    if (error) {
      console.error('Storage error:', error);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      signedUrl: data.signedUrl,
      path,
      token: data.token,
    });
  } catch (error) {
    console.error('Sign URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get signed download URL
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        { error: 'Missing path parameter' },
        { status: 400 }
      );
    }
    
    // Verify user owns the file (path starts with their user_id)
    if (!path.startsWith(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized access to file' },
        { status: 403 }
      );
    }
    
    const { data, error } = await supabase.storage
      .from('vision-tiles')
      .createSignedUrl(path, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Storage error:', error);
      return NextResponse.json(
        { error: 'Failed to create download URL' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Get signed URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

