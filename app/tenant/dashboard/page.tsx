import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { verifyTenantSession } from "@/src/lib/tenant-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export default async function TenantDashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("tenant_session")
  
  if (!sessionCookie) redirect("/tenant/login")
  
  const tenantId = verifyTenantSession(sessionCookie.value)
  if (!tenantId) redirect("/tenant/login")

  // Ambil data penghuni, kamar, dan 5 pembayaran terakhir
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      room: true,
      payments: {
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 6,
        include: {
          installments: true
        }
      }
    }
  })

  if (!tenant) redirect("/tenant/login")

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Cari tagihan bulan ini
  const currentBill = tenant.payments.find(p => p.month === currentMonth && p.year === currentYear)
  
  // Format mata uang
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
  }

  // Hitung sisa masa sewa jika ada leaveDate, atau sekedar infokan join date
  const joinDateStr = format(new Date(tenant.joinDate), "dd MMMM yyyy", { locale: id })
  const leaveDateStr = tenant.leaveDate ? format(new Date(tenant.leaveDate), "dd MMMM yyyy", { locale: id }) : "Belum ditentukan"

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Halo, {tenant.name.split(" ")[0]}! 👋</h1>
        <p className="text-muted-foreground">Selamat datang di portal informasi sewa kost Anda.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Info Kamar */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Informasi Sewa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kamar Saat Ini</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">Kamar {tenant.room.number}</span>
                <Badge variant={tenant.status === "AKTIF" ? "default" : "secondary"}>
                  {tenant.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Masuk</p>
                <p className="text-sm font-medium">{joinDateStr}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rencana Keluar</p>
                <p className="text-sm font-medium">{leaveDateStr}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tagihan Bulan Ini */}
        <Card className={`border-2 shadow-sm ${currentBill && currentBill.status !== "LUNAS" ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" : "border-primary/10"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tagihan Bulan Ini</CardTitle>
            <CardDescription>{MONTHS[currentMonth - 1]} {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {!currentBill ? (
              <div className="flex flex-col items-center justify-center h-24 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                <p className="text-sm text-muted-foreground">Belum ada tagihan yang diterbitkan untuk bulan ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Tagihan</p>
                    <p className="text-3xl font-bold">{formatRupiah(currentBill.amount)}</p>
                  </div>
                  <Badge 
                    variant={currentBill.status === "LUNAS" ? "default" : currentBill.status === "SEBAGIAN" ? "outline" : "destructive"}
                    className="mb-1 text-sm py-1 px-3"
                  >
                    {currentBill.status.replace("_", " ")}
                  </Badge>
                </div>
                
                {currentBill.paidAmount > 0 && currentBill.status !== "LUNAS" && (
                  <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2 text-orange-600 font-medium">
                    <span>Telah Dibayar (Cicil):</span>
                    <span>{formatRupiah(currentBill.paidAmount)}</span>
                  </div>
                )}
                
                {currentBill.status === "LUNAS" ? (
                  <div className="bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-3 rounded-md text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>Terima kasih! Pembayaran bulan ini telah lunas.</p>
                  </div>
                ) : (
                  <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-3 rounded-md text-sm flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Segera Lakukan Pembayaran</p>
                      <p className="text-xs mt-1">Silakan transfer sisa tagihan ke rekening Admin dan kirimkan bukti transfer via WhatsApp.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Pembayaran */}
      <Card className="border-primary/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Riwayat Pembayaran Terakhir
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-border/50">
          {tenant.payments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Belum ada riwayat pembayaran yang tercatat.
            </div>
          ) : (
            tenant.payments.map((payment: any) => (
              <div key={payment.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Periode: {MONTHS[payment.month - 1]} {payment.year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(payment.amount)} • {payment.method || "Transfer"}
                  </p>
                  {payment.paymentDate && (
                    <p className="text-xs text-muted-foreground">
                      Tgl Bayar: {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:items-end gap-2">
                  <Badge variant={payment.status === "LUNAS" ? "default" : payment.status === "SEBAGIAN" ? "outline" : payment.status === "BELUM_BAYAR" ? "secondary" : "destructive"} className="w-fit">
                    {payment.status.replace("_", " ")}
                  </Badge>
                  
                  <div className="flex flex-col sm:items-end gap-1 mt-1">
                    {payment.proofUrl && (
                      <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-green-600 dark:text-green-500 hover:underline flex items-center gap-1 text-xs">
                        Kuitansi Lunas <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {payment.installments && payment.installments.map((inst: any, idx: number) => inst.receiptUrl && (
                      <a key={inst.id} href={inst.receiptUrl} target="_blank" rel="noreferrer" className="text-orange-600 dark:text-orange-500 hover:underline flex items-center gap-1 text-xs">
                        Kuitansi Cicilan {idx+1} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                    {!payment.proofUrl && (!payment.installments || payment.installments.length === 0) && (
                      <span className="text-xs text-muted-foreground/60">Tidak ada kuitansi</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  )
}
