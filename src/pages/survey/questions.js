export const surveyQuestions = [
  {
    id: 6,
    "text": "Who would you like to be matched with?",
    subtext: "Select all that apply",
    label: "genderPreferences",
    type: "checkboxes",
    options: [
      {
        name: "Men"
      },
      {
        name: "Women"
      },
      {
        name: "Non binary"
      }
    ]
  },
  {
    id: 7,
    "text": "Which gender best describes you?",
    label: "gender",
    type: "buttons",
    options: [
      {
        name: "Man"
      },
      {
        name: "Woman"
      },
      {
        name: "Non binary"
      }
    ]
  },
  {
    id: 8,
    "text": "What age should your roommate be?",
    subtext: "Apply a range.",
    label: "agePreferences",
    type: "slider",
    min: 18,
    max: 60
  },
  {
    id: 9,
    "text": "How old are you?",
    subtext: "Padpal users must be 18 or older",
    label: "age",
    type: "datePicker"
  },
  {
    id: 10,
    "text": "What city are you looking to move to?",
    label: "city",
    type: "select"
  },
  {
    id: 11,
    "text": "What is your monthly budget?",
    subtext: "Apply a range.",
    label: "budget",
    type: "slider",
    min: 0,
    max: 4000
  },
  {
    id: 12,
    "text": "What type of lease do you prefer?",
    subtext: "Select all that apply.",
    label: "leaseType",
    type: "checkboxes",
    options: [
      {
        name: "Annual"
      },
      {
        name: "Monthly"
      },
      {
        name: "Sublease"
      }
    ]
  },
  {
    id: 19,
    "text": "When are you looking to move by?",
    label: "expectedMoveOut",
    type: "datePicker"
  },
  {
    id: 13,
    "text": "How important is cleanliness to you?",
    label: "cleanlinessPreferences",
    type: "buttons",
    options: [
      {
        name: "Very Important"
      },
      {
        name: "Somewhat Important"
      },
      {
        name: "Not Important"
      }
    ]
  },
  {
    id: 14,
    "text": "Do you have a pet, or would you like to live with pets?",
    label: "petPreferences",
    type: "buttons",
    options: [
      {
        name: "Yes"
      },
      {
        name: "No"
      },
      {
        name: "Don't care"
      }
    ]
  },
  {
    id: 15,
    "text": "Are you, or are you willing to live with a smoker?",
    label: "smokerPreferences",
    type: "buttons",
    options: [
      {
        name: "Yes"
      },
      {
        name: "No"
      },
      {
        name: "Don't care"
      }
    ]
  },
  {
    id: 16,
    "text": "How often do you have guests?",
    label: "guestPreferences",
    type: "buttons",
    options: [
      {
        name: "Very Often"
      },
      {
        name: "Sometimes"
      },
      {
        name: "Never"
      }
    ]
  },
  {
    id: 17,
    "text": "Tell us about you",
    subtext: "Provide a brief explanation about yourself",
    label: "bio",
    type: "text",
    placeholder: "Bio"
  },
  {
    id: 18,
    "text": "Build your feed with pictures.",
    label: "pictures",
    "subtext": "Add at least one photo.",
    type: "pictures"
  },
  {
    id: 19,
    "text": "Tell us what you're into.",
    label: "hobbies",
    type: "select"
  },
  {
    id: 19,
    "text": "One last thing!",
    "subtext": "For the safety of our users, facial identity verification is required in order to be registered for padpal. We ask that you upload a real time photo of yourself, as well as a valid identification photo document (for example, a drivers liscense or passport). However, because this is only a prototype, any picture of your face will suffice.",
    label: "hobbies",
    type: "facialVerification"
  }
]