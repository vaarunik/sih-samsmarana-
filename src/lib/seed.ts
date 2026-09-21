// SAMSMARANA — seed warm demo content for a new profile.
// Creates a few family messages and gentle default reminders so the
// Family Engagement and Reminders areas feel alive immediately.

import { db } from "@/lib/db";

export async function seedFamilyForProfile(
  profileId: string,
  elderName: string,
  caregiverName: string
) {
  const family = [
    {
      fromName: caregiverName,
      type: "text",
      content: `Good morning ${elderName}! Hope you have a calm and happy day. I'm thinking of you.`,
      caption: "Message from family",
    },
    {
      fromName: "Meera",
      type: "voice",
      content: "A short voice message: “Amma, we made your favourite sweets. Come home soon.”",
      caption: "Voice message · 0:18",
    },
    {
      fromName: "Family",
      type: "photo",
      content: "A photo from last weekend's garden lunch together.",
      caption: "Garden lunch · Last Sunday",
    },
    {
      fromName: "Arjun",
      type: "occasion",
      content: "Happy birthday, ${elderName}! Wishing you health and many more memories.",
      caption: "Birthday wish",
    },
    {
      fromName: "Family",
      type: "note",
      content: "We're so proud of you for keeping up with your daily activities.",
      caption: "Family note",
    },
  ];

  for (const f of family) {
    await db.familyMessage.create({
      data: {
        profileId,
        fromName: f.fromName,
        type: f.type,
        content: f.content.replace("${elderName}", elderName),
        caption: f.caption,
      },
    });
  }

  const reminders = [
    { type: "medication", title: "Morning medication", time: "08:30", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    { type: "hydration", title: "Drink a glass of water", time: "11:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    { type: "meal", title: "Lunch", time: "12:30", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    { type: "activity", title: "Cognitive activity", time: "16:00", days: ["Mon","Wed","Fri"] },
    { type: "appointment", title: "Walk in the garden", time: "17:30", days: ["Tue","Thu","Sat"] },
  ];

  for (const r of reminders) {
    await db.reminder.create({
      data: {
        profileId,
        type: r.type,
        title: r.title,
        time: r.time,
        days: JSON.stringify(r.days),
        enabled: true,
      },
    });
  }
}
