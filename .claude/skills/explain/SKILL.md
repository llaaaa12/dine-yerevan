---
name: explain
description: "Explain Dine Yerevan code, a concept or the latest change in plain English for a beginner: what it does, how data flows through the layers, why it is built that way, with a small diagram and three check questions. Use when the user asks to explain something, how it works, what was just done, or wants to understand a part for the defense."
argument-hint: "[file, topic, or 'last change']"
---

# Explain in plain English

Topic: $ARGUMENTS. If empty, explain the latest change in this conversation, or the uncommitted work (`git diff`).

1. Read the code involved first. Don't explain from memory.
2. Explain in this order, in short sentences. Every technical word gets a one-line definition.
   1. **What it does:** one or two sentences a non-programmer would understand.
   2. **How it flows:** the path through the app, naming the real files, e.g. browser → `/api/...` → route → controller → service → repository → database, and back.
   3. **Why it's built this way:** the decision, and the alternative we didn't take. Link `docs/roadmap.md` when the decision is written there.
   4. **Where it can go wrong:** and what protects against it (validation, constraint, test).
3. Draw one small diagram (ASCII or Mermaid) when there is a flow or a race.
4. End with **3 check questions** the graders could ask. Put short model answers under an "Answers" heading.
5. Don't change code while explaining.
