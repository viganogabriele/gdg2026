## Intro
An app to assist the student in the planning phase of the study process, consenting in rearranging it and to stick to it to reach the goal. 

## Steps
1. Student provides the sources (PDF, notes or website links) 
2. Student provides a deadline and an optional available time (hours)
3. System assesses the student's knowledge of the subject
4. System ranks the student's knowledge using a source-centric approach
5. System generates a study roadmap tailored on the student's knowledge (more info on the roadmap needed)
6. The student can review the roadmap and provide feedback
7. The app need to be gamified
8. It is not chatbot, or an AI tutor. It is an app that need to make the student feel "in control", it just tell what to study and when to study.
9. The app is not for primary school or middle school, but for high school and university students.
10. To make gamified and engaging we can introduce concepts like "streaks", "points", "badges", "levels"
11. The student need to be tested on his knowledge of a subject to generate the roadmap and to understand his level of knowledge of the subject.
12. the level of knowledge need to be updated while the student is studying. To understand if he can go to next step or not. In case the level is too low, the app should suggest to study the current topic more and to reschedule the study plan.
13. Based on the topic it should create levels and showing how to upgrade the level (more study session, better quality of study session, etc). The user can also study more than planned to upgrade the level, and the app should adjust the study plan accordingly. The level should be topic based.
14. Space repetition: the app will ask really short challenge questions at the start of the session regarding previous topics.

## Features
- Source-centric knowledge ranking system
- Notification are sent to remind the user of the study plan.
- iOS, Android, Web builds
- "leaderboards", etc.
- multiple subjects

## Input flow
Starts as a conversation, with a modal form flow:
- "What are you studying?" (input field for arguments, sort of title)
- "What are your sources?" (input field for files, links, etc.)
- "When is your deadline?" (input field for date)
- Process the information and generate a study roadmap
- "Here is your study roadmap!" (end button)

## Screens
1. Home screen: shows the objectives of the day, the current "level"
  - Should look game-y
  - **Objectives for the day have references to the source materials**
  - A button allows to test the challenge to go to the next level before the deadline
  - The challenge is prompted automatically to the user at the end of the deadline for the level
2. Study roadmap screen: shows the study roadmap, the levels, the progress, etc. 
each level has its own deadline, and the user can see how much time he has left to complete it.
You can check for each topic the specific arguments with references to the source materials, 
and the completion date for previous topics, with graphs.
3. When you rotate the phone it goes in a "focus mode" where you can only see 
the current topic, with the reference materials, and a timer for the study session.
4. settings, profile, standard stuff