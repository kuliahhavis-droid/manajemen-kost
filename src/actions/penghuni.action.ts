"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import prisma from "@/lib/prisma"

// Fungsi helper kecil untuk upload agar kode tidak berulang
async function uploadFile(file: File, bucket: string) {
  if (!file || file.size === 0) return null
  const supabase = await createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      duplex: 'half'
    })
  if (error || !data) return null
  
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicData.publicUrl
}

export async function addTenant(formData: FormData) {
  const name = formData.get("name") as string
  const nik = formData.get("nik") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const gender = formData.get("gender") as string
  const address = formData.get("address") as string
  const roomId = formData.get("roomId") as string
  const joinDateStr = formData.get("joinDate") as string
  
  const ktpFile = formData.get("ktpPhoto") as File
  const photoFile = formData.get("photo") as File

  const ktpUrl = await uploadFile(ktpFile, "tenants")
  const photoUrl = await uploadFile(photoFile, "tenants")

  // Menggunakan Transaction: Buat Penghuni + Update Status Kamar
  await prisma.$transaction([
    prisma.tenant.create({
      data: {
        name, nik, phone, email, gender, address, roomId,
        joinDate: new Date(joinDateStr),
        ktpPhoto: ktpUrl,
        photo: photoUrl,
      }
    }),
    prisma.room.update({
      where: { id: roomId },
      data: { status: "TERISI" }
    })
  ])

  // Revalidate kedua halaman karena datanya saling terkait
  revalidatePath("/dashboard/penghuni")
  revalidatePath("/dashboard/kamar") 
  redirect("/dashboard/penghuni")
}

export async function removeTenant(formData: FormData) {
  const id = formData.get("id") as string
  const roomId = formData.get("roomId") as string

  // Hapus Penghuni + Kembalikan Status Kamar jadi KOSONG
  await prisma.$transaction([
    prisma.tenant.delete({ where: { id } }),
    prisma.room.update({ where: { id: roomId }, data: { status: "KOSONG" } })
  ])
  
  revalidatePath("/dashboard/penghuni")
  revalidatePath("/dashboard/kamar")
}

export async function checkoutTenant(formData: FormData) {
  const id = formData.get("id") as string
  const roomId = formData.get("roomId") as string
  const leaveDateStr = formData.get("leaveDate") as string
  
  const leaveDate = leaveDateStr ? new Date(leaveDateStr) : new Date()

  // Ubah status Penghuni jadi TIDAK_AKTIF dan kosongkan Kamar
  await prisma.$transaction([
    prisma.tenant.update({
      where: { id },
      data: {
        status: "TIDAK_AKTIF",
        leaveDate: leaveDate
      }
    }),
    prisma.room.update({ 
      where: { id: roomId }, 
      data: { status: "KOSONG" } 
    })
  ])

  revalidatePath("/dashboard/penghuni")
  revalidatePath("/dashboard/kamar")
}
