# PadPal
> PadPal is a web application designed to help individuals find like-minded roommates using a Tinder-styled interface. Users answer a handful of varying questions to understand who they are and what they're looking for in a roommate. Then, PadPal analyzes their results and pairs the user with the top candidates who match their criteria. 

___
## Table of Contents
1. [Introduction](https://github.com/HiyabW/padpal/tree/new?tab=readme-ov-file#introduction)
2. [Features](https://github.com/HiyabW/padpal/tree/new?tab=readme-ov-file#features)
3. [Technologies](https://github.com/HiyabW/padpal/tree/new?tab=readme-ov-file#technologies)
4. [Installation](https://github.com/HiyabW/padpal/tree/new?tab=readme-ov-file#installation)

___
## Introduction
PadPal was created to combat several critical issues that come with finding a roommate currently. Typically to find a roommate, individuals use Facebook and join a group related to finding a roommate in their city (for example, a popular one in Los Angeles is [Young Females: LA - Los Angeles Housing, Rentals, Rooms and Sublets](https://www.facebook.com/groups/375969193143590/)). However, Facebook group was not intended for this purpose, so it lacks important features like being able to sorting by budget, age, cleanliness preferences, etc. There is also no verification process for Facebook group, so there is no way of knowing if users are real and safe to interact with.
<br><br>
For the people that didn't have a Facebook account or preferred not to use it, there are only limited alternatives available in the app store. [Roomie](https://www.theroomieapp.com/) is one of the more popular options, though it is only available on Apple Devices. However, upon testing and research online, several people have reported that their visual interface is clunky and difficult to use. Furthermore, Roomie also fails to include the same filters as Facebook, so it is probable that users will spend quite a long time scrolling before finding a suitable candidate.
<br><br>
PadPal provides a unique and advanced solution to these shortcomings. PadPal queries users not only for for broader preferences like budget, age, and gender preferences, but even for more niche pieces of information like smoker preferences, cleanliness preferences, hobbies, and pets. Additionally, in order to create an account with PadPal, users must verify their identity by taking a live photo as well as providing a valid photo identification document, which PadPal validates using facial recognition AI. This way, users know that the people they find through PadPal are real. Finally, after several rounds of user testing, PadPal is confirmed to be visually easy to use because it leverages pre-existing user friendly cues like Tinder's swipe left / right layout, and can be used on any and all devices no matter the operating system.

___
## Features
* User authentication and authorization using JWT and bcrypt
* Face recognition and verification using FaceAPI.js, powered by Tensorflow
* Sorting algorithm that carefully analyzes user compatibility and provides the closest matches first
* Live chatrooms featuring a default chat robot powered by Google Gemini AI
* Responsive and dynamic design to accomodate all devices and promote accessibility
* A visually appealing and interactive interface that allows for both keyboard and touch input
  * Appealing and rewarding animations to keep users engaged
___
## Technologies
* Front-end
  * React.js
  * Tailwind CSS
  * MUI React Component Library
  * Lordicon animated icons
* Back-end:
  * Express.js
  * Google Gemini APIs
  * Tensorflow face recognition AI
  *JWT + bcrypt libraries for authentication and authorization

___
## Installation

This project has been created using **webpack-cli**. Although the application is already deployed using Render, If you wish to run the application locally, you can run

```
npm run build
```

or

```
yarn build
```

to bundle the application, and 

```
npm run serve
```

to run the application.
