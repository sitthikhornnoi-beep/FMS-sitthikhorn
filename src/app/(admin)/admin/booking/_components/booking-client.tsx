"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Building,
  Car,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  User,
  MapPin,
  AlertCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { BookingDto, BookingResourceDto } from "@/features/booking";
import {
  cancelBookingAction,
  deleteBookingResourceAction,
} from "@/features/booking/actions";
import { CalendarView } from "./calendar-view";
import { BookingFormDialog } from "./booking-form-dialog";
import { ResourceFormDialog } from "./resource-form-dialog";
import { ApprovalDialog } from "./approval-dialog";

interface Props {
  initialBookings: BookingDto[];
  initialResources: BookingResourceDto[];
  canApprove: boolean;
  canManage: boolean;
  canCreate: boolean;
}

export function BookingClient({
  initialBookings,
  initialResources,
  canApprove,
  canManage,
  canCreate,
}: Props) {
  const t = useT();
  const locale = useLocale();

  const [bookings, setBookings] = useState<BookingDto[]>(initialBookings);
  const [resources, setResources] = useState<BookingResourceDto[]>(initialResources);
  const [isPending, startTransition] = useTransition();

  // Tab State
  const [activeTab, setActiveTab] = useState<"CALENDAR" | "REQUESTS" | "ROOMS" | "VEHICLES">("CALENDAR");

  // Filter State
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  // Dialog States
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<BookingResourceDto | null>(null);
  const [resourceDefaultType, setResourceDefaultType] = useState<"ROOM" | "VEHICLE">("ROOM");

  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState<BookingDto | null>(null);
  const [approvalMode, setApprovalMode] = useState<"APPROVE" | "REJECT" | "DRIVER">("APPROVE");

  const [deleteResourceConfirm, setDeleteResourceConfirm] = useState<BookingResourceDto | null>(null);
  const [cancelBookingConfirm, setCancelBookingConfirm] = useState<BookingDto | null>(null);

  // Statistics
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const roomsCount = resources.filter((r) => r.type === "ROOM").length;
  const vehiclesCount = resources.filter((r) => r.type === "VEHICLE").length;

  // Filtered Bookings for Table
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterType && b.resource?.type !== filterType) return false;
      if (filterStatus && b.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchUser = (b.userName && b.userName.toLowerCase().includes(q)) || (b.userEmail && b.userEmail.toLowerCase().includes(q));
        const matchDest = b.destination && b.destination.toLowerCase().includes(q);
        const matchResource = b.resource?.nameTh.toLowerCase().includes(q);
        if (!matchTitle && !matchUser && !matchDest && !matchResource) return false;
      }
      return true;
    });
  }, [bookings, filterType, filterStatus, search]);

  const handleBookingSaved = (saved: BookingDto) => {
    setBookings((prev) => [saved, ...prev]);
  };

  const handleBookingUpdated = (updated: BookingDto) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleResourceSaved = (saved: BookingResourceDto) => {
    setResources((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteResource = (resource: BookingResourceDto) => {
    startTransition(async () => {
      const res = await deleteBookingResourceAction(resource.id);
      if (res.ok) {
        toast.success(t("booking.resourceDeleteSuccess"));
        setResources((prev) => prev.filter((r) => r.id !== resource.id));
        setDeleteResourceConfirm(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleCancelBooking = (booking: BookingDto) => {
    startTransition(async () => {
      const res = await cancelBookingAction(booking.id);
      if (res.ok) {
        toast.success(t("booking.cancelSuccess"));
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: "CANCELLED" } : b))
        );
        setCancelBookingConfirm(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const columns: DataTableColumn<BookingDto>[] = [
    {
      key: "resource",
      header: "ทรัพยากร",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-8 rounded-full shrink-0"
            style={{ backgroundColor: row.resource?.color || "#3b82f6" }}
          />
          <div>
            <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              {row.resource?.type === "ROOM" ? (
                <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              ) : (
                <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span>{row.resource?.nameTh || "-"}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {row.resource?.location || row.resource?.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: "วาระ / ภารกิจ",
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-foreground line-clamp-1">{row.title}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {row.attendeeCount} คน
            </span>
            {row.destination && (
              <span className="flex items-center gap-1 text-primary">
                <MapPin className="w-3 h-3" />
                {row.destination}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "time",
      header: "วันและเวลา",
      render: (row) => {
        const s = new Date(row.startTime);
        const e = new Date(row.endTime);
        const startH = s.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" });
        const endH = e.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" });
        return (
          <div className="text-xs">
            <div className="font-medium text-foreground">{formatDate(s, locale)}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-primary" />
              <span>{startH} - {endH} น.</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "user",
      header: "ผู้ขอจอง / คนขับ",
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-foreground flex items-center gap-1">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">{row.userName || row.userEmail}</span>
          </div>
          {row.driverName && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Car className="w-3 h-3 text-amber-500" />
              <span>คนขับ: {row.driverName} {row.driverPhone && `(${row.driverPhone})`}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      render: (row) => {
        const tone =
          row.status === "APPROVED"
            ? "ok"
            : row.status === "PENDING"
            ? "warn"
            : row.status === "REJECTED"
            ? "bad"
            : "off";
        const label =
          row.status === "APPROVED"
            ? t("booking.status.APPROVED")
            : row.status === "PENDING"
            ? t("booking.status.PENDING")
            : row.status === "REJECTED"
            ? t("booking.status.REJECTED")
            : t("booking.status.CANCELLED");
        return <StatusPill tone={tone}>{label}</StatusPill>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("booking.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("booking.desc")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingResource(null);
                  setResourceDefaultType("ROOM");
                  setResourceFormOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Building className="w-4 h-4 text-blue-500" />
                <span>+ ห้องประชุม</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setEditingResource(null);
                  setResourceDefaultType("VEHICLE");
                  setResourceFormOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Car className="w-4 h-4 text-amber-500" />
                <span>+ ยานพาหนะ</span>
              </Button>
            </>
          )}

          {canCreate && (
            <Button
              onClick={() => setBookingFormOpen(true)}
              className="flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t("booking.create")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="w-4 h-4 text-amber-500" />
            รออนุมัติ
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            อนุมัติแล้ว
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Building className="w-4 h-4 text-blue-500" />
            ห้องประชุมทั้งหมด
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{roomsCount}</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Car className="w-4 h-4 text-purple-500" />
            ยานพาหนะส่วนกลาง
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{vehiclesCount}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("CALENDAR")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "CALENDAR"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {t("booking.tab.calendar")}
        </button>

        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "REQUESTS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {t("booking.tab.requests")}
          {pendingCount > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ROOMS")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "ROOMS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          {t("booking.tab.rooms")} ({roomsCount})
        </button>

        <button
          onClick={() => setActiveTab("VEHICLES")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "VEHICLES"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          {t("booking.tab.vehicles")} ({vehiclesCount})
        </button>
      </div>

      {/* TAB 1: CALENDAR VIEW */}
      {activeTab === "CALENDAR" && (
        <CalendarView
          bookings={bookings}
          resources={resources}
          onSelectBooking={(b) => {
            if (canApprove && b.status === "PENDING") {
              setSelectedBookingForApproval(b);
              setApprovalMode("APPROVE");
              setApprovalDialogOpen(true);
            }
          }}
        />
      )}

      {/* TAB 2: REQUESTS TABLE */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-4">
          {/* Table Toolbar */}
          <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="ค้นหาวาระ, ผู้ขอจอง, ปลายทาง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <LiyonSelect
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs"
              >
                <option value="">ทุกประเภททรัพยากร</option>
                <option value="ROOM">ห้องประชุม</option>
                <option value="VEHICLE">ยานพาหนะ</option>
              </LiyonSelect>

              <LiyonSelect
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs"
              >
                <option value="">ทุกสถานะ</option>
                <option value="PENDING">{t("booking.status.PENDING")}</option>
                <option value="APPROVED">{t("booking.status.APPROVED")}</option>
                <option value="REJECTED">{t("booking.status.REJECTED")}</option>
                <option value="CANCELLED">{t("booking.status.CANCELLED")}</option>
              </LiyonSelect>
            </div>
          </div>

          <DataTable
            state="data"
            headHeading="ตารางรายการคำขอจอง"
            headMeta={`(${filteredBookings.length} รายการ)`}
            rows={filteredBookings}
            columns={columns}
            getRowId={(r) => r.id}
            empty={{
              icon: <Calendar className="w-8 h-8 opacity-40" />,
              title: t("booking.noBookings"),
            }}
            error={{
              icon: <AlertCircle className="w-8 h-8 opacity-40" />,
              title: "เกิดข้อผิดพลาดในการโหลดรายการจอง",
            }}
            renderRowMenu={
              canApprove
                ? (row: BookingDto) => (
                    <>
                      {row.status === "PENDING" && (
                        <RowMenuItem
                          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          onSelect={() => {
                            setSelectedBookingForApproval(row);
                            setApprovalMode("APPROVE");
                            setApprovalDialogOpen(true);
                          }}
                        >
                          อนุมัติคำขอ
                        </RowMenuItem>
                      )}

                      {row.status === "PENDING" && (
                        <RowMenuItem
                          danger
                          icon={<XCircle className="w-3.5 h-3.5 text-destructive" />}
                          onSelect={() => {
                            setSelectedBookingForApproval(row);
                            setApprovalMode("REJECT");
                            setApprovalDialogOpen(true);
                          }}
                        >
                          ปฏิเสธคำขอ
                        </RowMenuItem>
                      )}

                      {row.resource?.type === "VEHICLE" && row.status === "APPROVED" && (
                        <RowMenuItem
                          icon={<Car className="w-3.5 h-3.5 text-primary" />}
                          onSelect={() => {
                            setSelectedBookingForApproval(row);
                            setApprovalMode("DRIVER");
                            setApprovalDialogOpen(true);
                          }}
                        >
                          มอบหมายคนขับรถ
                        </RowMenuItem>
                      )}

                      {row.status !== "CANCELLED" && (
                        <RowMenuItem
                          danger
                          icon={<Trash2 className="w-3.5 h-3.5 text-destructive" />}
                          onSelect={() => setCancelBookingConfirm(row)}
                        >
                          ยกเลิกการจอง
                        </RowMenuItem>
                      )}
                    </>
                  )
                : undefined
            }
          />
        </div>
      )}

      {/* TAB 3: MEETING ROOMS CARDS */}
      {activeTab === "ROOMS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources
            .filter((r) => r.type === "ROOM")
            .map((room) => (
              <div
                key={room.id}
                className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md"
              >
                <div className="h-44 relative bg-muted flex items-center justify-center">
                  {room.imageUrl ? (
                    <Image
                      src={room.imageUrl}
                      alt={room.nameTh}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Building className="w-12 h-12 text-muted-foreground/40" />
                  )}
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-bold shadow-sm"
                    style={{ backgroundColor: room.color }}
                  >
                    ความจุ {room.capacity} ที่นั่ง
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{room.nameTh}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{room.location}</p>

                    {room.facilities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {room.facilities.map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {canManage && (
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingResource(room);
                          setResourceDefaultType("ROOM");
                          setResourceFormOpen(true);
                        }}
                        className="text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        แก้ไข
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteResourceConfirm(room)}
                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* TAB 4: VEHICLES CARDS */}
      {activeTab === "VEHICLES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources
            .filter((r) => r.type === "VEHICLE")
            .map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md"
              >
                <div className="h-44 relative bg-muted flex items-center justify-center">
                  {vehicle.imageUrl ? (
                    <Image
                      src={vehicle.imageUrl}
                      alt={vehicle.nameTh}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Car className="w-12 h-12 text-muted-foreground/40" />
                  )}
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-bold shadow-sm"
                    style={{ backgroundColor: vehicle.color }}
                  >
                    ความจุ {vehicle.capacity} ผู้โดยสาร
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{vehicle.nameTh}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{vehicle.location}</p>

                    {vehicle.facilities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {vehicle.facilities.map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {canManage && (
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingResource(vehicle);
                          setResourceDefaultType("VEHICLE");
                          setResourceFormOpen(true);
                        }}
                        className="text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        แก้ไข
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteResourceConfirm(vehicle)}
                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Dialog: Create Booking */}
      <BookingFormDialog
        open={bookingFormOpen}
        onOpenChange={setBookingFormOpen}
        resources={resources}
        onSaved={handleBookingSaved}
      />

      {/* Dialog: Create/Edit Resource */}
      <ResourceFormDialog
        open={resourceFormOpen}
        onOpenChange={setResourceFormOpen}
        resource={editingResource}
        defaultType={resourceDefaultType}
        onSaved={handleResourceSaved}
      />

      {/* Dialog: Approval / Reject / Driver */}
      <ApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        booking={selectedBookingForApproval}
        mode={approvalMode}
        onUpdated={handleBookingUpdated}
      />

      {/* Dialog: Delete Resource Confirmation */}
      {deleteResourceConfirm && (
        <LiyonDialog
          open={!!deleteResourceConfirm}
          onOpenChange={(open) => !open && setDeleteResourceConfirm(null)}
          danger
        >
          <LiyonDialogHeader
            title={t("booking.resource.delete")}
            description={t("booking.resource.deleteConfirm")}
          />
          <LiyonDialogBody>
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                กำลังลบ: <strong>{deleteResourceConfirm.nameTh}</strong> ({deleteResourceConfirm.code})
              </span>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteResourceConfirm(null)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteResource(deleteResourceConfirm)}
              disabled={isPending}
            >
              {isPending ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </LiyonDialogFooter>
        </LiyonDialog>
      )}

      {/* Dialog: Cancel Booking Confirmation */}
      {cancelBookingConfirm && (
        <LiyonDialog
          open={!!cancelBookingConfirm}
          onOpenChange={(open) => !open && setCancelBookingConfirm(null)}
          danger
        >
          <LiyonDialogHeader
            title={t("booking.cancel")}
            description={t("booking.cancelConfirm")}
          />
          <LiyonDialogBody>
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                ยกเลิกการจอง: <strong>{cancelBookingConfirm.title}</strong>
              </span>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelBookingConfirm(null)}
              disabled={isPending}
            >
              ปิด
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancelBooking(cancelBookingConfirm)}
              disabled={isPending}
            >
              {isPending ? "กำลังยกเลิก..." : "ยืนยันการยกเลิก"}
            </Button>
          </LiyonDialogFooter>
        </LiyonDialog>
      )}
    </div>
  );
}
