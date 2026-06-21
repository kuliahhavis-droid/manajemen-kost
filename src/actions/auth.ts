'use server'

import { createClient } from '../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // Ambil detail user dari database menggunakan prisma
    let dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    // Jika user belum terdaftar di database lokal, buat recordnya otomatis
    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.name || user.email!.split('@')[0],
                role: 'ADMIN' // Default role admin
            }
        })
    }

    return dbUser
}

export async function updateUserProfile(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Sesi login tidak ditemukan. Harap masuk kembali.' }
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name }
        })

        // Opsional: perbarui juga metadata nama di Supabase Auth
        await supabase.auth.updateUser({
            data: { name }
        })

        revalidatePath('/dashboard/pengaturan')
        return { success: true, user: updatedUser }
    } catch (err: any) {
        console.error('Error updating user profile:', err)
        return { error: err.message || 'Gagal menyimpan perubahan profil.' }
    }
}