import { listBookings, listBookingResources } from "@/features/booking/server";
import { PublicBookingView } from "./public-booking-view";

export const revalidate = 30;

export default async function BookingPublicPage() {
  const [bookings, resources] = await Promise.all([
    listBookings(undefined, { status: "APPROVED" }),
    listBookingResources(undefined, undefined, true),
  ]);

  return <PublicBookingView initialBookings={bookings} resources={resources} />;
}
