import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Hanya lindungi rute /tenant/dashboard dan sub-rutenya
  if (request.nextUrl.pathname.startsWith('/tenant/dashboard')) {
    const sessionCookie = request.cookies.get('tenant_session')
    
    // Jika tidak ada cookie sesi penghuni, lempar kembali ke halaman login
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/tenant/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verifikasi HMAC dilakukan di level aplikasi (Server Components) 
    // karena middleware Edge runtime tidak mendukung crypto Node secara native,
    // tapi keberadaan cookie saja sudah cukup untuk filter awal.
  }

  // Khusus admin (Dashboard utama) bisa ditambahkan proteksi Supabase Auth di sini jika diperlukan,
  // tapi biasanya Supabase Auth dihandle di root layout atau spesifik page.

  return NextResponse.next()
}

// Konfigurasi path mana saja yang akan dicegat middleware ini
export const config = {
  matcher: ['/tenant/dashboard/:path*'],
}
