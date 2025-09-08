import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getUserProfile,
  mapBackendToFrontend,
} from "../api/users/getUserProfile";
import { updateUserProfile } from "../api/users/updateUserProfile";

export interface BasicDetails {
  name: string;
  date: string;
  country: string;
  birthday: string;
  email: string;
  phone: string;
  college?: string;
}

interface ProfileState {
  basicDetails: BasicDetails;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  userId: number | null;
  profilePicture: File | null;
  setBasicDetails: (details: Partial<BasicDetails>) => void;
  setIsEditing: (editing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUserId: (id: number) => void;
  setProfilePicture: (file: File | null) => void;
  reset: () => void;
  loadProfile: (userId: number) => Promise<void>;
  saveProfile: () => Promise<void>;
}

const defaultBasicDetails: BasicDetails = {
  name: "",
  date: "",
  country: "",
  birthday: "",
  email: "",
  phone: "",
  college: "",
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      basicDetails: defaultBasicDetails,
      isEditing: false,
      isLoading: false,
      error: null,
      userId: null,
      profilePicture: null,

      setBasicDetails: (details) =>
        set((state) => ({
          basicDetails: { ...state.basicDetails, ...details },
        })),

      setIsEditing: (editing) => set({ isEditing: editing }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setUserId: (id) => set({ userId: id }),

      setProfilePicture: (file) => set({ profilePicture: file }),

      reset: () =>
        set({
          basicDetails: defaultBasicDetails,
          isEditing: false,
          isLoading: false,
          error: null,
          userId: null,
          profilePicture: null,
        }),

      loadProfile: async (userId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getUserProfile(userId);
          const frontendData = mapBackendToFrontend(response.data);
          set({
            basicDetails: frontendData,
            userId,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load profile",
            isLoading: false,
          });
        }
      },

      saveProfile: async () => {
        const { userId, basicDetails, profilePicture } = get();
        if (!userId) {
          set({ error: "User ID not found." });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const response = await updateUserProfile(
            userId,
            basicDetails,
            profilePicture || undefined
          );
          const frontendData = mapBackendToFrontend(response.data);
          set({
            basicDetails: frontendData,
            isEditing: false,
            isLoading: false,
            profilePicture: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to save profile",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "profile-storage",
      partialize: (state) => ({
        basicDetails: state.basicDetails,
        userId: state.userId,
      }),
    }
  )
);

// Education Store (Updated for Multiple Entries)
// export interface EducationDetails {
//   id: string;
//   institution: string;
//   degree: string;
//   fieldOfStudy: string;
//   graduationYear: string;
//   grade?: string;
//   activities?: string;
// }

// interface EducationState {
//   educationDetails: EducationDetails[];
//   isEditing: boolean;
//   isLoading: boolean;
//   error: string | null;
//   setEducationDetails: (details: EducationDetails[]) => void;
//   addEducationDetail: (detail: EducationDetails) => void;
//   updateEducationDetail: (
//     id: string,
//     detail: Partial<EducationDetails>
//   ) => void;
//   removeEducationDetail: (id: string) => void;
//   setIsEditing: (editing: boolean) => void;
//   setIsLoading: (loading: boolean) => void;
//   setError: (error: string | null) => void;
//   reset: () => void;
//   saveEducation: (
//     onSave?: (data: EducationDetails[]) => Promise<void>
//   ) => Promise<void>;
// }

// const defaultEducationDetails: EducationDetails[] = [
//   {
//     id: "default-edu-" + Date.now(),
//     institution: "Harvard University",
//     degree: "Bachelor of Science",
//     fieldOfStudy: "Computer Science",
//     graduationYear: "2024",
//     grade: "3.8 GPA",
//     activities: "Computer Science Club, Math Club, Basketball Team",
//   },
// ];

// export const useEducationStore = create<EducationState>()(
//   persist(
//     (set, get) => ({
//       educationDetails: defaultEducationDetails,
//       isEditing: false,
//       isLoading: false,
//       error: null,

//       setEducationDetails: (details) => set({ educationDetails: details }),

//       addEducationDetail: (detail) =>
//         set((state) => ({
//           educationDetails: [...state.educationDetails, detail],
//         })),

//       updateEducationDetail: (id, detail) =>
//         set((state) => ({
//           educationDetails: state.educationDetails.map((edu) =>
//             edu.id === id ? { ...edu, ...detail } : edu
//           ),
//         })),

//       removeEducationDetail: (id) =>
//         set((state) => ({
//           educationDetails: state.educationDetails.filter(
//             (edu) => edu.id !== id
//           ),
//         })),

//       setIsEditing: (editing) => set({ isEditing: editing }),

//       setIsLoading: (loading) => set({ isLoading: loading }),

//       setError: (error) => set({ error }),

//       reset: () =>
//         set({
//           educationDetails: defaultEducationDetails,
//           isEditing: false,
//           isLoading: false,
//           error: null,
//         }),

//       saveEducation: async (onSave) => {
//         const state = get();
//         set({ isLoading: true, error: null });

//         try {
//           if (onSave) {
//             await onSave(state.educationDetails);
//           } else {
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//           }

//           set({ isEditing: false, isLoading: false });
//         } catch (error) {
//           set({
//             error:
//               error instanceof Error
//                 ? error.message
//                 : "Failed to save education details",
//             isLoading: false,
//           });
//         }
//       },
//     }),
//     {
//       name: "education-storage",
//       partialize: (state) => ({
//         educationDetails: state.educationDetails,
//       }),
//     }
//   )
// );

// Work Experience Store (Updated for Multiple Entries)
export interface WorkExperienceDetails {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
}

interface WorkExperienceState {
  workExperience: WorkExperienceDetails[];
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  setWorkExperience: (details: WorkExperienceDetails[]) => void;
  addWorkExperience: (experience: WorkExperienceDetails) => void;
  updateWorkExperience: (
    id: string,
    experience: Partial<WorkExperienceDetails>
  ) => void;
  removeWorkExperience: (id: string) => void;
  setIsEditing: (editing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  saveWorkExperience: (
    onSave?: (data: WorkExperienceDetails[]) => Promise<void>
  ) => Promise<void>;
}

const defaultWorkExperience: WorkExperienceDetails[] = [
  {
    id: "default-work-" + Date.now(),
    company: "Tech Solutions Inc.",
    position: "Software Developer",
    startDate: "01.2022",
    endDate: "Present",
    description: "Developing web applications using React and Node.js",
    location: "New York, USA",
  },
];

export const useWorkExperienceStore = create<WorkExperienceState>()(
  persist(
    (set, get) => ({
      workExperience: defaultWorkExperience,
      isEditing: false,
      isLoading: false,
      error: null,

      setWorkExperience: (details) => set({ workExperience: details }),

      addWorkExperience: (experience) =>
        set((state) => ({
          workExperience: [...state.workExperience, experience],
        })),

      updateWorkExperience: (id, experience) =>
        set((state) => ({
          workExperience: state.workExperience.map((work) =>
            work.id === id ? { ...work, ...experience } : work
          ),
        })),

      removeWorkExperience: (id) =>
        set((state) => ({
          workExperience: state.workExperience.filter((work) => work.id !== id),
        })),

      setIsEditing: (editing) => set({ isEditing: editing }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () =>
        set({
          workExperience: defaultWorkExperience,
          isEditing: false,
          isLoading: false,
          error: null,
        }),

      saveWorkExperience: async (onSave) => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
          if (onSave) {
            await onSave(state.workExperience);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          set({ isEditing: false, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to save work experience",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "work-experience-storage",
      partialize: (state) => ({
        workExperience: state.workExperience,
      }),
    }
  )
);

// Engagement Activity Store
export interface EngagementActivityDetails {
  activityType: "review" | "question" | "answer" | "comment";
  title: string;
  description: string;
  date: string; // Using string for date, but can be Date object
  status: "active" | "completed" | "pending";
}

interface EngagementActivityState {
  engagementActivities: EngagementActivityDetails[];
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  setEngagementActivities: (activities: EngagementActivityDetails[]) => void;
  addEngagementActivity: (activity: EngagementActivityDetails) => void;
  setIsEditing: (editing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  saveEngagementActivities: (
    onSave?: (data: EngagementActivityDetails[]) => Promise<void>
  ) => Promise<void>;
}

const defaultEngagementActivities: EngagementActivityDetails[] = [
  {
    activityType: "review",
    title: "Great learning experience at XYZ College",
    description:
      "The college provided excellent infrastructure and faculty support",
    date: "2025-08-15",
    status: "active",
  },
  {
    activityType: "question",
    title: "Question about admissions",
    description: "What is the deadline for early applications?",
    date: "2025-08-14",
    status: "active",
  },
  {
    activityType: "answer",
    title: "Answer to 'What are the dorms like?'",
    description: "The dorms are newly renovated and quite comfortable.",
    date: "2025-08-13",
    status: "completed",
  },
  {
    activityType: "comment",
    title: "Comment on an article",
    description: "This was a very insightful article, thank you for sharing.",
    date: "2025-08-11",
    status: "active",
  },
  {
    activityType: "review",
    title: "Review of ABC University",
    description: "The campus is beautiful and the professors are top-notch.",
    date: "2025-07-20",
    status: "active",
  },
];

export const useEngagementActivityStore = create<EngagementActivityState>()(
  persist(
    (set, get) => ({
      engagementActivities: defaultEngagementActivities,
      isEditing: false,
      isLoading: false,
      error: null,

      setEngagementActivities: (activities) =>
        set({ engagementActivities: activities }),

      addEngagementActivity: (activity) =>
        set((state) => ({
          engagementActivities: [...state.engagementActivities, activity],
        })),

      setIsEditing: (editing) => set({ isEditing: editing }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () =>
        set({
          engagementActivities: defaultEngagementActivities,
          isEditing: false,
          isLoading: false,
          error: null,
        }),

      saveEngagementActivities: async (onSave) => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
          if (onSave) {
            await onSave(state.engagementActivities);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          set({ isEditing: false, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to save engagement activity",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "engagement-activity-storage",
      partialize: (state) => ({
        engagementActivities: state.engagementActivities,
      }),
    }
  )
);
