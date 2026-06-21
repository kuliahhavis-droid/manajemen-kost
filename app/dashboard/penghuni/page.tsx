import Link from "next/link"
import { getAllTenants } from "@/src/repositories/penghuni.repo"
import { removeTenant, checkoutTenant } from "@/src/actions/penghuni.action"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, LogOut } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"

export default async function PenghuniPage(props: any) {
  const searchParams = await props.searchParams
  const tab = searchParams?.status === "TIDAK_AKTIF" ? "TIDAK_AKTIF" : "AKTIF"
  
  const tenants = await getAllTenants(tab)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Penghuni</h1>
          <p className="text-muted-foreground">Kelola data penghuni kost yang sedang aktif dan riwayat mantan penghuni.</p>
        </div>
        <Link href="/dashboard/penghuni/tambah" className="w-full sm:w-auto">
          <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Tambah Penghuni</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        <Link href="/dashboard/penghuni">
          <Button variant={tab === "AKTIF" ? "default" : "ghost"} size="sm" className="rounded-full">
            Penghuni Aktif
          </Button>
        </Link>
        <Link href="/dashboard/penghuni?status=TIDAK_AKTIF">
          <Button variant={tab === "TIDAK_AKTIF" ? "default" : "ghost"} size="sm" className="rounded-full">
            Mantan Penghuni
          </Button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kamar</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Tgl Masuk</TableHead>
              {tab === "TIDAK_AKTIF" && <TableHead>Tgl Keluar</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tab === "TIDAK_AKTIF" ? 7 : 6} className="text-center h-24 text-muted-foreground">
                  Belum ada data penghuni.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tenant.room.number}</Badge>
                  </TableCell>
                  <TableCell>{tenant.phone}</TableCell>
                  <TableCell>{tenant.joinDate && !isNaN(new Date(tenant.joinDate).getTime()) ? format(new Date(tenant.joinDate), "dd MMM yyyy") : "-"}</TableCell>
                  {tab === "TIDAK_AKTIF" && (
                    <TableCell>{tenant.leaveDate ? format(new Date(tenant.leaveDate), "dd MMM yyyy") : "-"}</TableCell>
                  )}
                  <TableCell>
                    <Badge variant={tenant.status === "AKTIF" ? "default" : "secondary"}>
                      {tenant.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {tenant.status === "AKTIF" && (
                        <form action={checkoutTenant}>
                          <input type="hidden" name="id" value={tenant.id} />
                          <input type="hidden" name="roomId" value={tenant.roomId} />
                          <Button variant="outline" size="sm" className="h-8 gap-1 border-amber-200 text-amber-700 hover:bg-amber-50" type="submit">
                            <LogOut className="h-3.5 w-3.5" /> <span className="hidden lg:inline">Checkout</span>
                          </Button>
                        </form>
                      )}
                      <form action={removeTenant}>
                        <input type="hidden" name="id" value={tenant.id} />
                        <input type="hidden" name="roomId" value={tenant.roomId} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" type="submit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {tenants.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Belum ada data penghuni.
          </Card>
        ) : (
          tenants.map((tenant) => (
            <Card key={tenant.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{tenant.name}</span>
                <Badge variant={tenant.status === "AKTIF" ? "default" : "secondary"}>
                  {tenant.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Kamar:</span>
                  <span className="font-semibold text-foreground">{tenant.room.number}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. HP:</span>
                  <span className="text-foreground">{tenant.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Masuk:</span>
                  <span className="text-foreground">{tenant.joinDate && !isNaN(new Date(tenant.joinDate).getTime()) ? format(new Date(tenant.joinDate), "dd MMM yyyy") : "-"}</span>
                </div>
                {tenant.status === "TIDAK_AKTIF" && (
                  <div className="flex justify-between border-t border-border/50 pt-1.5 mt-1.5">
                    <span>Tanggal Keluar:</span>
                    <span className="text-foreground">{tenant.leaveDate ? format(new Date(tenant.leaveDate), "dd MMM yyyy") : "-"}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-border/50 pt-2">
                {tenant.status === "AKTIF" && (
                  <form action={checkoutTenant}>
                    <input type="hidden" name="id" value={tenant.id} />
                    <input type="hidden" name="roomId" value={tenant.roomId} />
                    <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50 gap-1.5 h-8" type="submit">
                      <LogOut className="h-4 w-4" /> Checkout
                    </Button>
                  </form>
                )}
                <form action={removeTenant}>
                  <input type="hidden" name="id" value={tenant.id} />
                  <input type="hidden" name="roomId" value={tenant.roomId} />
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8" type="submit">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
