import prayerEvent from "@/assets/events/prayer-event.jpg";
import worshipEvent from "@/assets/events/worship-event.jpg";
import fellowshipEvent from "@/assets/events/fellowship-event.jpg";
import missionEvent from "@/assets/events/mission-event.jpg";
import conferenceEvent from "@/assets/events/conference-event.jpg";
import socialEvent from "@/assets/events/social-event.jpg";
import serviceEvent from "@/assets/events/service-event.jpg";
import studyEvent from "@/assets/events/study-event.jpg";

const categoryImageMap: Record<string, string> = {
  prayer: prayerEvent,
  worship: worshipEvent,
  fellowship: fellowshipEvent,
  mission: missionEvent,
  conference: conferenceEvent,
  social: socialEvent,
  service: serviceEvent,
  study: studyEvent,
  retreat: prayerEvent,
  orientation: conferenceEvent,
  sacrament: serviceEvent,
  training: studyEvent,
  creative: worshipEvent,
  general: fellowshipEvent,
};

export function getEventImage(category: string | null, imageUrl: string | null): string {
  if (imageUrl) return imageUrl;
  const key = (category || "general").toLowerCase();
  return categoryImageMap[key] || fellowshipEvent;
}
