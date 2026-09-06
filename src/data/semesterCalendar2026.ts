import { COMMUNITY_LINK } from "@/lib/communityLink";
import type { StaticEvent } from "@/data/staticSiteContent";

// Official MKU Christian Union 2026/2027 Regime — Semester One calendar.
// Source: FINAL CALENDAR SEMESTER ONE (Sept–Dec 2026).
// Times not stated in the calendar are intentionally shown as "As announced".
// TBD venues remain TBD. The 6 Sept service uses the newer official poster details.
const event = (id:string,title:string,date:string,location:string,category:string,description:string): StaticEvent => ({
  id:`calendar-2026-${id}`, title, event_date:date, start_time:"As announced", end_time:null,
  location:location || "Venue to be announced", category, description, image_url:"",
  registration_link:COMMUNITY_LINK, is_featured:false,
});

export const semesterCalendar2026: StaticEvent[] = [
  event("first-years","Receiving First Years","2026-08-24","Campus","Community","Receiving first-year students, 24–28 August."),
  event("aug30-service","Sunday Service","2026-08-30","Auditorium","Sunday Service","Semester Sunday Service."),
  event("prayer-retreat","Prayer & Fasting Retreat","2026-08-31","Kimbimbi Prayer Centre","Prayer","Week 1 Prayer & Fasting Retreat, 31 August–4 September."),
  event("intercessory-kesha","Intercessory Kesha","2026-09-04","CC Hall","Prayer","Week 1 overnight intercessory gathering."),
  { ...event("sep6-service","Sunday Service","2026-09-06","CC Hall","Sunday Service","Manifestation of the Glory of God — Isaiah 60:1. Ministering: Pastor Muange Kiseku. Prayer for Kenya."), start_time:"7:00 AM", end_time:"12:45 PM", is_featured:true },
  event("mission-week-1","Mission Week","2026-09-07","Hostels","Missions","Week 2 Mission Week, 7–11 September."),
  event("street-worship","Street Worship","2026-09-12","C.T Grounds","Worship","Street Worship gathering."),
  event("sep13-service","Sunday Service","2026-09-13","Auditorium","Sunday Service","Sunday worship service."),
  event("home-fellowship-week","Home Fellowship Week","2026-09-14","Home Fellowships","Fellowship","Week 3 Home Fellowship Week, 14–18 September."),
  event("joint-home","Joint Home Fellowship","2026-09-17","CC Hall","Fellowship","Joint home fellowship gathering."),
  event("sep20-service","Sunday Service","2026-09-20","Auditorium","Sunday Service","Sunday worship service."),
  event("sep20-leaders","Leaders' Meeting","2026-09-20","CT 3.4A","Leadership","Leaders' meeting."),
  event("bible-study-week","Bible Study Week","2026-09-21","Venue to be announced","Bible Study","Week 4 Bible Study Week, 21–25 September."),
  event("bible-kesha","Bible Study Kesha","2026-09-25","CC Hall","Bible Study","Bible Study Kesha."),
  event("sep27-service","Sunday Service","2026-09-27","Auditorium","Sunday Service","Sunday worship service."),
  event("ushering-week","Ushering/IGM Week","2026-09-28","Venue to be announced","Ministry Week","Week 5 Ushering/IGM Week, 28 September–2 October."),
  event("oct4-service","Sunday Service","2026-10-04","Auditorium","Sunday Service","Sunday worship service."),
  event("creative-week","Creative Week","2026-10-05","Venue to be announced","Creative","Week 6 Creative Week, 5–9 October."),
  event("creative-kesha","Creative Kesha","2026-10-09","CC Hall","Creative","Creative ministry Kesha."),
  event("oct11-service","Sunday Service","2026-10-11","Auditorium","Sunday Service","Sunday worship service."),
  event("mission-week-2","Mission Week","2026-10-12","Venue to be announced","Missions","Week 7 Mission Week, 12–16 October."),
  event("submission","Submission","2026-10-16","TBD","Community","Submission, 16–18 October."),
  event("oct18-service","Sunday Service","2026-10-18","Auditorium","Sunday Service","Sunday worship service."),
  event("ladies-gents-week","Ladies and Gents Week","2026-10-19","Venue to be announced","Fellowship","Week 8 Ladies and Gents Week, 19–23 October."),
  event("ladies-forum","Ladies Forum","2026-10-24","TBD","Fellowship","Ladies Forum."),
  event("staff-sunday","Staff Sunday","2026-10-25","Auditorium","Sunday Service","Staff Sunday."),
  event("care-week","Care Week","2026-10-26","Venue to be announced","Care","Week 9 Care Week, 26–30 October."),
  event("love-sunday","Love Sunday","2026-11-01","Auditorium","Sunday Service","Love Sunday."),
  event("praise-sound-week","Praise & Worship and Sound Week","2026-11-02","Venue to be announced","Worship","Week 10 Praise & Worship and Sound Week, 2–6 November."),
  event("joint-fellowship","Joint Fellowship","2026-11-05","CC Hall","Fellowship","Joint fellowship gathering."),
  event("worship-night","Worship Night","2026-11-06","CC Hall","Worship","Worship Night."),
  event("nov8-service","Sunday Service","2026-11-08","Auditorium","Sunday Service","Sunday worship service."),
  event("nov8-leaders","Leaders' Meeting","2026-11-08","CT 3.4","Leadership","Leaders' meeting."),
  event("choir-multimedia-week","Choir and Multimedia Week","2026-11-09","Venue to be announced","Ministry Week","Week 11 Choir and Multimedia Week, 9–13 November."),
  event("old-school-sunday","Old School Sunday","2026-11-15","Auditorium","Sunday Service","Old School Sunday."),
  event("mission-intercessory-week","Mission/Intercessory Week","2026-11-16","Venue to be announced","Missions","Week 12 Mission/Intercessory Week, 16–20 November."),
  event("prayer-walk","Prayer Walk","2026-11-21","Venue to be announced","Prayer","Prayer Walk."),
  event("nov22-service","Sunday Service","2026-11-22","Auditorium","Sunday Service","Sunday worship service."),
  event("war-room","War Room","2026-11-22","CC Hall","Prayer","War Room prayer gathering."),
  event("mission-week-3","Mission Week","2026-11-23","Venue to be announced","Missions","Week 13 Mission Week, 23–27 November."),
  event("mission-training","Mission Training","2026-11-28","CT 8.3","Missions","Mission Training."),
  event("nov29-service","Sunday Service","2026-11-29","Auditorium","Sunday Service","Sunday worship service."),
  event("main-mission","Main Mission","2026-11-29","TBD","Missions","Week 14 Main Mission, 29 November–6 December."),
  event("dec6-service","Sunday Service","2026-12-06","Auditorium","Sunday Service","Sunday worship service."),
  event("semester-finale","Semester Finale","2026-12-13","Venue to be announced","Semester Finale","Week 15 Semester Finale."),
];
