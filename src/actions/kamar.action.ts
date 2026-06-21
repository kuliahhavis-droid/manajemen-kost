"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import { createRoom, deleteRoom, updateRoom } from "@/src/repositories/kamar.repo"
import { RoomStatus } from "@prisma/client"

export async function addRoom(formData: FormData) {
  const number = formData.get("number") as string
  const floor = parseInt(formData.get("floor") as string)
  const price = parseFloat(formData.get("price") as string)
  const size = formData.get("size") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as RoomStatus
  const photoFile = formData.get("photo") as File

  let photoUrl = ""

  // Logika Upload ke Supabase Storage
  if (photoFile && photoFile.size > 0) {
    const supabase = await createClient()
    const fileExt = photoFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const arrayBuffer = await photoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("rooms")
      .upload(fileName, buffer, {
        contentType: photoFile.type || "image/jpeg",
        duplex: 'half'
      })

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from("rooms")
        .getPublicUrl(uploadData.path)
      
      photoUrl = publicUrlData.publicUrl
    }
  }

  // Panggil Repository untuk simpan ke database
  await createRoom({
    number,
    floor,
    price,
    size,
    description,
    status,
    photos: photoUrl ? [photoUrl] : [],
  })

  revalidatePath("/dashboard/kamar")
  redirect("/dashboard/kamar")
}

export async function editRoom(id: string, formData: FormData) {
  const number = formData.get("number") as string
  const floor = parseInt(formData.get("floor") as string)
  const price = parseFloat(formData.get("price") as string)
  const size = formData.get("size") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as RoomStatus
  const photoFile = formData.get("photo") as File
  const existingPhoto = formData.get("existingPhoto") as string

  let photoUrl = existingPhoto

  // Logika Upload ke Supabase Storage
  if (photoFile && photoFile.size > 0) {
    const supabase = await createClient()
    const fileExt = photoFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const arrayBuffer = await photoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("rooms")
      .upload(fileName, buffer, {
        contentType: photoFile.type || "image/jpeg",
        duplex: 'half'
      })

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from("rooms")
        .getPublicUrl(uploadData.path)
      
      photoUrl = publicUrlData.publicUrl
    }
  }

  // Panggil Repository untuk update di database
  await updateRoom(id, {
    number,
    floor,
    price,
    size,
    description,
    status,
    photos: photoUrl ? [photoUrl] : [],
  })

  revalidatePath("/dashboard/kamar")
  redirect("/dashboard/kamar")
}

export async function removeRoom(id: string) {
  await deleteRoom(id)
  revalidatePath("/dashboard/kamar")
}
