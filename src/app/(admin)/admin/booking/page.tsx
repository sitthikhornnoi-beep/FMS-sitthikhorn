import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  BOOKING_P,
  listBookings,
  listBookingResources,
} from "@/features/booking/server";
import { BookingClient } from "./_components/booking-client";

export default async function AdminBookingPage() {
  const ctx = await requirePermission(BOOKING_P.bookingRead);
  const [bookings, resources] = await Promise.all([
    listBookings(ctx.tenantId),
    listBookingResources(ctx.tenantId),
  ]);

  return (
    <BookingClient
      initialBookings={bookings}
      initialResources={resources}
      canApprove={hasPermission(ctx, BOOKING_P.bookingApprove)}
      canManage={hasPermission(ctx, BOOKING_P.bookingManage)}
      canCreate={hasPermission(ctx, BOOKING_P.bookingCreate)}
    />
  );
}
