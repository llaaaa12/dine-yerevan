---
name: defense-drill
description: "Quiz the user for the Dine Yerevan final project defense, one question at a time: availability, double-booking prevention, login and roles, database relationships, testing and architecture. Grade each answer and give the model answer. Use when the user says 'quiz me', 'practice the defense' or 'test my understanding'."
argument-hint: "[topic, optional: availability | double-booking | auth | database | testing | architecture | all]"
---

# Defense drill

Topic: $ARGUMENTS. The default is all topics, starting with availability and double booking, which the graders focus on most.

1. **Build the question pool** from:
   - `docs/roadmap.md`: section 6, especially 6.5 "Likely questions";
   - the code that exists now. Read it, and don't ask about features that aren't built yet.
2. **Ask one question at a time**, then wait for the user's answer.
3. **Grade each answer:** ✅ right, 🟡 partly right or ❌ missing.
   - Say what was good and what was missing.
   - Give a short model answer in plain English (2–5 sentences).
   - Point to the real file or test that proves it.
4. **Mix question types:**
   - **"why":** why a constraint instead of a check?
   - **"what if":** two customers book the same table at the same moment.
   - **"show me":** which test proves it, and how to run it (`cd backend && npm test`).
   - **"explain the diagram"**.
5. **After 5 questions**, or when the user stops, give a summary:
   - strong topics;
   - topics to review;
   - files to re-read.
6. **Never change code** during the drill.
