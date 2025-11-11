
import AddDeliveryNoteClientPage from "./client-page";

export default function AddDeliveryNoteWrapper() {
  const posting_date = new Date().toISOString().split("T")[0];
  const posting_time = new Date().toTimeString().slice(0, 5);

  return <AddDeliveryNoteClientPage postingDate={posting_date} postingTime={posting_time} />;
}
