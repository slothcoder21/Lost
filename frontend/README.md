# Lost & Found - Reconnect with your belongings

## Inspiration
We've all been there - that sinking feeling when you realize your water bottle, backpack, or student ID is missing. At UC Davis and campuses everywhere, lost items pile up in offices and lost & found centers, often never reunited with their owners. Our team experienced this frustration firsthand, which inspired us to create a solution that bridges the gap between lost items and their rightful owners.

## What it does
**Lost & Found** is a mobile application that streamlines the process of reporting and finding lost items. Users can:

- **Report lost items** with detailed descriptions and images
- **Register found items** with photos and where they were discovered
- **Browse** through a feed of lost and found items with powerful filtering options
- **Connect directly** with finders through an in-app chat system
- **Claim lost items** through a verification process
- **Get notified** when possible matches to their lost items appear

## How we built it
Our application is built using:
- **React Native** with **Expo** for cross-platform mobile development
- **Firebase** for authentication, real-time database, and storage

We implemented a security-focused approach with intentionally disabled auth persistence to protect user data and item claim processes.

## Challenges we ran into
- Balancing user privacy with the need for direct communication between finders and owners
- Implementing an effective item matching algorithm that connects similar descriptions
- Optimizing image storage and retrieval to make the app responsive
- Ensuring the verification process is secure yet user-friendly

## Accomplishments that I'm proud of
- Creating an intuitive, beautiful UI that simplifies the lost and found process
- Implementing a real-time chat system that connects users without exposing personal information
- Building a functional filtering system that helps users quickly find their items
- Developing a verification flow that reduces the potential for fraudulent claims

## What I learned
- The complexities of building a secure user-to-user communication system
- Advanced Firebase integration for real-time applications
- Techniques for optimizing image handling and storage on mobile devices
- User experience design principles for simplifying complex processes

## What's next for Lost & Found
- **AI-powered image recognition** to automatically suggest item categories and match similar items
- **Campus-specific implementations** with integration to university ID systems
- **Community rewards system** to incentivize returning found items


