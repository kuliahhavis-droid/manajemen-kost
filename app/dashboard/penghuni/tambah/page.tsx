import Link from "next/link"
import { addTenant } from "@/src/actions/penghuni.action"
import { getAvailableRooms } from "@/src/repositories/penghuni.repo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"

export default async function TambahPenghuniPage() {
  const availableRooms = await getAvailableRooms()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/penghuni">
          <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Pendaftaran Penghuni Baru</h1>
      </div>

      <form action={addTenant} className="space-y-6 bg-card p-6 border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nik">NIK (Nomor KTP)</Label>
            <Input id="nik" name="nik" type="number" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">No. HP / WhatsApp</Label>
            <Input id="phone" name="phone" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (Opsional)</Label>
            <Input id="email" name="email" type="email" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <Select name="gender" defaultValue="Pria">
              <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pria">Pria</SelectItem>
                <SelectItem value="Wanita">Wanita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomId">Pilih Kamar (Yang Kosong)</Label>
            <Select name="roomId" required>
              <SelectTrigger><SelectValue placeholder="Pilih Kamar" /></SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <SelectItem value="none" disabled>Tidak ada kamar kosong</SelectItem>
                ) : (
                  availableRooms.map((room: any) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.number} - {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(room.price)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="joinDate">Tanggal Masuk</Label>
            <Input id="joinDate" name="joinDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ktpPhoto">Upload KTP (Opsional)</Label>
            <Input id="ktpPhoto" name="ktpPhoto" type="file" accept="image/*" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat Asal</Label>
          <Textarea id="address" name="address" required />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/dashboard/penghuni" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full">Batal</Button>
          </Link>
          <Button type="submit" className="w-full sm:w-auto">Daftarkan Penghuni</Button>
        </div>
      </form>
    </div>
  )
}
