import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`
    const filePath = `images/${fileName}`

    const { error } = await supabase.storage
      .from('restaurent-image')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error('Upload error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage
      .from('restaurent-image')
      .getPublicUrl(filePath)

    return Response.json({ url: data.publicUrl })
  } catch (error) {
    console.error('Server error:', error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}