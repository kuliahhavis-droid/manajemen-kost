import Link from "next/link"
import { addPayment } from "@/src/actions/pembayaran.action"
import { getActiveTenants } from "@/src/repositories/pembayaran.repo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export default async function TambahPembayaranPage() {
  const tenants = await getActiveTenants()
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pembayaran">
          <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Catat Pembayaran Baru</h1>
      </div>

      <form action={addPayment} className="space-y-6 bg-card p-6 border rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="tenantId">Pilih Penghuni</Label>
          <Select name="tenantId" required>
            <SelectTrigger><SelectValue placeholder="Pilih Penghuni..." /></SelectTrigger>
            <SelectContent>
              {tenants.map((tenant: any) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name} - Kamar {tenant.room.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month">Untuk Bulan</Label>
            <Select name="month" defaultValue={currentMonth.toString()}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i+1} value={(i+1).toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Tahun</Label>
            <Input id="year" name="year" type="number" defaultValue={currentYear} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Nominal (Rp)</Label>
            <Input id="amount" name="amount" type="number" placeholder="Misal: 1500000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status Pembayaran</Label>
            <Select name="status" defaultValue="LUNAS">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LUNAS">Lunas</SelectItem>
                <SelectItem value="BELUM_BAYAR">Belum Bayar</SelectItem>
                <SelectItem value="TERLAMBAT">Terlambat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Tanggal Bayar (Opsional)</Label>
            <Input id="paymentDate" name="paymentDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">Metode Pembayaran</Label>
            <Select name="method" defaultValue="Transfer Bank">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                <SelectItem value="Cash">Tunai (Cash)</SelectItem>
                <SelectItem value="E-Wallet">E-Wallet (Dana/Ovo/dll)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proofUrl">Upload Bukti Transfer (Opsional)</Label>
          <Input id="proofUrl" name="proofUrl" type="file" accept="image/*" />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/dashboard/pembayaran" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full">Batal</Button>
          </Link>
          <Button type="submit" className="w-full sm:w-auto">Simpan Pembayaran</Button>
        </div>
      </form>
    </div>
  )
}
