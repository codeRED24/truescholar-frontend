// Mock Data for Social Feed
// Structure exactly matches backend FeedResponseDto

import type {
  Post,
  Comment,
  FeedResponse,
  CommentsResponse,
  Author,
} from "../types";

// ============================================================================
// Mock Authors
// ============================================================================

const mockAuthors: Record<string, Author> = {
  priya: {
    id: "user-001",
    name: "Priya Sharma",
    image: "https://i.pravatar.cc/150?u=priya",
    user_type: "student",
  },
  rahul: {
    id: "user-002",
    name: "Dr. Rahul Verma",
    image: "https://i.pravatar.cc/150?u=rahul",
    user_type: "faculty",
  },
  iitDelhi: {
    id: "college-001",
    name: "IIT Delhi",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg/200px-Indian_Institute_of_Technology_Delhi_Logo.svg.png",
    user_type: "college",
  },
  ananya: {
    id: "user-003",
    name: "Ananya Patel",
    image: "https://i.pravatar.cc/150?u=ananya",
    user_type: "alumni",
  },
  vikram: {
    id: "user-004",
    name: "Vikram Singh",
    image: "https://i.pravatar.cc/150?u=vikram",
    user_type: "student",
  },
  neha: {
    id: "user-005",
    name: "Neha Gupta",
    image: "https://i.pravatar.cc/150?u=neha",
    user_type: "student",
  },
  amit: {
    id: "user-006",
    name: "Amit Kumar",
    image: "https://i.pravatar.cc/150?u=amit",
    user_type: "faculty",
  },
  nitWarangal: {
    id: "college-002",
    name: "NIT Warangal",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/9/99/NIT_Warangal_logo.svg/200px-NIT_Warangal_logo.svg.png",
    user_type: "college",
  },
  sanjay: {
    id: "user-007",
    name: "Sanjay Reddy",
    image: "https://i.pravatar.cc/150?u=sanjay",
    user_type: "alumni",
  },
  meera: {
    id: "user-008",
    name: "Meera Krishnan",
    image: "https://i.pravatar.cc/150?u=meera",
    user_type: "student",
  },
  arjun: {
    id: "user-009",
    name: "Arjun Nair",
    image: "https://i.pravatar.cc/150?u=arjun",
    user_type: "student",
  },
  drSingh: {
    id: "user-010",
    name: "Dr. Kavita Singh",
    image: "https://i.pravatar.cc/150?u=drsingh",
    user_type: "faculty",
  },
  iimBangalore: {
    id: "college-003",
    name: "IIM Bangalore",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Indian_Institute_of_Management_Bangalore_Logo.svg/200px-Indian_Institute_of_Management_Bangalore_Logo.svg.png",
    user_type: "college",
  },
  rohan: {
    id: "user-011",
    name: "Rohan Mehta",
    image: "https://i.pravatar.cc/150?u=rohan",
    user_type: "student",
  },
  divya: {
    id: "user-012",
    name: "Divya Agarwal",
    image: "https://i.pravatar.cc/150?u=divya",
    user_type: "alumni",
  },
};

// ============================================================================
// Mock Posts
// ============================================================================

export const mockPosts: Post[] = [
  {
    id: "post-001",
    content: `Just completed my summer internship at Google! 🎉

The experience was incredible - worked on real production systems, learned so much about distributed systems, and met amazing people.

Key takeaways:
• Code reviews are invaluable for learning
• Don't be afraid to ask questions
• Documentation is just as important as code

Grateful for this opportunity! #TechInternship #Google #SoftwareEngineering`,
    author: mockAuthors.priya,
    authorType: "user",
    type: "general",
    media: [
      {
        url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 234,
    commentCount: 45,
    hasLiked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-002",
    content: `📢 Admissions Open for B.Tech 2026!

IIT Delhi invites applications for the upcoming academic year. We're looking for bright minds who want to shape the future of technology.

🗓️ Last date: March 31, 2026
📝 Apply through JEE Advanced

Visit our website for more details.`,
    author: mockAuthors.iitDelhi,
    authorType: "college",
    type: "announcement",
    taggedCollegeId: 1,
    media: [],
    visibility: "public",
    likeCount: 1520,
    commentCount: 89,
    hasLiked: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-003",
    content: `Published my research paper on "Machine Learning Applications in Climate Modeling" in Nature Climate Change! 📄

After 2 years of work, countless experiments, and many late nights, it's finally out. The paper explores how we can use AI to better predict extreme weather events.

Link in comments. Would love to hear your thoughts!`,
    author: mockAuthors.rahul,
    authorType: "user",
    type: "article",
    media: [
      {
        url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 892,
    commentCount: 156,
    hasLiked: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-004",
    content: `Tips for cracking GATE 2026 🎯

After scoring AIR 47 last year, here's what worked for me:

1. Start with standard textbooks, not shortcuts
2. Previous year questions are gold - solve last 20 years
3. Mock tests every weekend starting 3 months before
4. Focus on your weak areas, not just favorites
5. Take care of your health - it's a marathon

Feel free to ask any questions! Happy to help 🙌`,
    author: mockAuthors.ananya,
    authorType: "user",
    type: "general",
    media: [],
    visibility: "public",
    likeCount: 2341,
    commentCount: 312,
    hasLiked: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-005",
    content: `First day at NIT Trichy! 🏫

Can't believe I'm finally here. The campus is beautiful and everyone has been so welcoming. Already made some friends during orientation.

Any seniors with tips for freshers? What clubs should I join?`,
    author: mockAuthors.vikram,
    authorType: "user",
    type: "general",
    media: [
      {
        url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 156,
    commentCount: 43,
    hasLiked: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-006",
    content: `Just got placed at Microsoft! 💼🎉

After months of preparation, countless DSA problems, and several rounds of interviews, I finally made it. Starting as SDE-1 in Bangalore.

Special thanks to my seniors who guided me and my batchmates who kept me motivated. Dream come true! 🙏`,
    author: mockAuthors.neha,
    authorType: "user",
    type: "general",
    media: [
      {
        url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 543,
    commentCount: 78,
    hasLiked: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-007",
    content: `Excited to announce our new course on "Quantum Computing Fundamentals" starting next semester! 🔬

This will be the first undergraduate course on quantum computing at our university. We'll cover:
- Quantum bits and superposition
- Quantum gates and circuits
- Basic quantum algorithms
- Hands-on with IBM Qiskit

Limited seats available. Register early!`,
    author: mockAuthors.amit,
    authorType: "user",
    type: "announcement",
    media: [],
    visibility: "public",
    likeCount: 324,
    commentCount: 56,
    hasLiked: true,
    createdAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-008",
    content: `🏆 NIT Warangal wins Smart India Hackathon 2025!

Our students developed an AI-powered solution for crop disease detection that won the grand prize at SIH 2025.

Congratulations to Team InnovatorsX! You've made us proud. 🇮🇳`,
    author: mockAuthors.nitWarangal,
    authorType: "college",
    type: "announcement",
    taggedCollegeId: 2,
    media: [
      {
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 2100,
    commentCount: 145,
    hasLiked: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-009",
    content: `5 years at Amazon - a thread 🧵

When I joined as an SDE-1 fresh out of college, I had no idea what to expect. Here's what I learned:

Year 1: Imposter syndrome is real. Kept my head down and learned.
Year 2: Started owning small features. Made lots of mistakes.
Year 3: Promoted to SDE-2. Finally felt like I belonged.
Year 4: Led my first major project. Mentored 2 interns.
Year 5: Senior SDE now. Still learning every day.

The journey continues! What's your career story?`,
    author: mockAuthors.sanjay,
    authorType: "user",
    type: "general",
    media: [],
    visibility: "public",
    likeCount: 1879,
    commentCount: 234,
    hasLiked: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-010",
    content: `Looking for study partners for CAT 2026! 📚

Planning to start preparation from February. Targeting IIM ABC. 

Anyone interested in forming a study group? We can do weekly mock tests together and discuss strategies.

DM me if interested! Let's crack this together 💪`,
    author: mockAuthors.meera,
    authorType: "user",
    type: "general",
    media: [],
    visibility: "public",
    likeCount: 89,
    commentCount: 34,
    hasLiked: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-011",
    content: `Finally submitted my PhD thesis! 🎓📜

4 years of research on "Deep Learning for Medical Image Analysis" comes to an end. 

There were times I wanted to give up, but my guide Prof. Sharma and my lab mates kept me going. 

Defense scheduled for next month. Fingers crossed! 🤞`,
    author: mockAuthors.arjun,
    authorType: "user",
    type: "general",
    media: [
      {
        url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 456,
    commentCount: 67,
    hasLiked: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-012",
    content: `Launching free mentorship program for first-generation college students! 🌟

I was the first in my family to go to college. Now as a professor, I want to give back.

This program offers:
• One-on-one academic guidance
• Career counseling
• Scholarship application help
• Emotional support

Applications open until Jan 31. Share widely! 🙏`,
    author: mockAuthors.drSingh,
    authorType: "user",
    type: "announcement",
    media: [],
    visibility: "public",
    likeCount: 3245,
    commentCount: 289,
    hasLiked: true,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-013",
    content: `📢 IIM Bangalore announces new 1-year MBA program for working professionals!

Designed for executives with 5+ years of experience. Weekend classes, no career break needed.

Highlights:
• Hybrid delivery model
• International immersion module
• Industry mentorship
• ₹18L fee with scholarship options

Applications now open for 2026-27 batch.`,
    author: mockAuthors.iimBangalore,
    authorType: "college",
    type: "announcement",
    taggedCollegeId: 3,
    media: [
      {
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 1890,
    commentCount: 156,
    hasLiked: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-014",
    content: `Hot take: Your college brand matters less than you think 🔥

Went from a tier-3 college to working at FAANG. Here's the reality:

1. After 2-3 years, nobody cares where you studied
2. Skills > Degree in tech
3. Network matters more than college name
4. Side projects outweigh CGPA

Focus on building, not worrying about placements.

Agree or disagree?`,
    author: mockAuthors.rohan,
    authorType: "user",
    type: "general",
    media: [],
    visibility: "public",
    likeCount: 4521,
    commentCount: 567,
    hasLiked: false,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-015",
    content: `Reflecting on my journey from BITS Pilani to BCG Partner 💼

15 years ago, I was a confused engineering student who accidentally walked into a consulting info session. Today, I lead BCG's tech practice in India.

Key lessons:
• Consulting teaches you to think structured
• Always be curious about new industries
• Your network is your net worth
• Mentors can change your trajectory

Happy to answer questions from aspiring consultants!`,
    author: mockAuthors.divya,
    authorType: "user",
    type: "general",
    media: [
      {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 2876,
    commentCount: 198,
    hasLiked: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-016",
    content: `Anyone else struggling with the semester project deadline? 😩

Have 3 submissions next week:
- DBMS project
- OS assignment
- ML model training

Living on coffee and instant noodles. Send help! 😂

#EngineeringLife #StudentStruggles`,
    author: mockAuthors.vikram,
    authorType: "user",
    type: "general",
    media: [],
    visibility: "public",
    likeCount: 234,
    commentCount: 89,
    hasLiked: false,
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-017",
    content: `Free resources for JEE Mains 2026 preparation 📚

Compiled a list of everything that helped me score 99.8 percentile:

📹 YouTube: Physics Wallah, Mohit Tyagi, Unacademy
📖 Books: HC Verma, Cengage, RD Sharma
🧪 Practice: NTA Abhyas App, Allen Test Series
📱 Apps: Doubtnut for doubts

Remember: Consistency > Intensity

Save this post and share with someone who needs it!`,
    author: mockAuthors.priya,
    authorType: "user",
    type: "general",
    media: [],
    visibility: "public",
    likeCount: 5678,
    commentCount: 432,
    hasLiked: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-018",
    content: `Our research lab is hiring! 🔬

Looking for motivated MTech/PhD students interested in:
• Natural Language Processing
• Computer Vision
• Reinforcement Learning

Full funding available + conference travel support.

Ideal candidate: Strong programming skills, research curiosity, and willingness to work hard.

Send your CV to kavita.singh@iitd.ac.in`,
    author: mockAuthors.drSingh,
    authorType: "user",
    type: "announcement",
    media: [],
    visibility: "public",
    likeCount: 456,
    commentCount: 67,
    hasLiked: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-019",
    content: `The coding bootcamp bubble is real 🫧

Seeing so many friends pay ₹3-5L for bootcamps promising ₹15L packages.

Reality check:
• Most bootcamps have <30% placement rate
• Self-learning resources are mostly free
• Experience > certificates
• Companies care about GitHub, not bootcamp names

Invest time in open source instead. Your future self will thank you.`,
    author: mockAuthors.sanjay,
    authorType: "user",
    type: "general",
    media: [],
    visibility: "public",
    likeCount: 3456,
    commentCount: 287,
    hasLiked: false,
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-020",
    content: `Attended my first tech conference - GDG DevFest Bangalore! 🎉

Highlights:
• Met so many passionate developers
• Learned about new frameworks I'd never heard of
• Got inspired by keynote speakers
• Free swag! 😄

If you're a student, definitely attend these events. The learning and networking is invaluable.

Next stop: ReactConf India 2026!`,
    author: mockAuthors.meera,
    authorType: "user",
    type: "general",
    media: [
      {
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        type: "image",
      },
    ],
    visibility: "public",
    likeCount: 234,
    commentCount: 45,
    hasLiked: true,
    createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// Mock Comments
// ============================================================================

export const mockComments: Record<string, Comment[]> = {
  "post-001": [
    {
      id: "comment-001",
      postId: "post-001",
      content:
        "Congratulations Priya! 🎉 This is amazing. What team did you work with?",
      author: mockAuthors.ananya,
      parentId: null,
      likeCount: 12,
      hasLiked: false,
      replyCount: 2,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "comment-002",
      postId: "post-001",
      content:
        "So inspiring! I'm applying for internships this year. Any tips for the interview process?",
      author: mockAuthors.vikram,
      parentId: null,
      likeCount: 8,
      hasLiked: true,
      replyCount: 1,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: "comment-003",
      postId: "post-001",
      content:
        "The point about documentation is so true! Often overlooked but crucial.",
      author: mockAuthors.rahul,
      parentId: null,
      likeCount: 15,
      hasLiked: false,
      replyCount: 0,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
  "post-004": [
    {
      id: "comment-004",
      postId: "post-004",
      content:
        "Thanks for sharing! Which books did you use for Data Structures?",
      author: mockAuthors.priya,
      parentId: null,
      likeCount: 23,
      hasLiked: false,
      replyCount: 1,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "post-014": [
    {
      id: "comment-005",
      postId: "post-014",
      content:
        "Completely agree! Skills matter more than the college name in the long run.",
      author: mockAuthors.sanjay,
      parentId: null,
      likeCount: 45,
      hasLiked: true,
      replyCount: 3,
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "comment-006",
      postId: "post-014",
      content:
        "Disagree partially. College network does help for first job placement.",
      author: mockAuthors.divya,
      parentId: null,
      likeCount: 32,
      hasLiked: false,
      replyCount: 5,
      createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// ============================================================================
// Mock API Functions
// ============================================================================

export function getMockFeed(cursor?: string, limit = 20): FeedResponse {
  const startIndex = cursor
    ? mockPosts.findIndex((p) => p.id === cursor) + 1
    : 0;
  const posts = mockPosts.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < mockPosts.length;

  return {
    posts,
    nextCursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
  };
}

export function getMockComments(
  postId: string,
  cursor?: string,
  limit = 20
): CommentsResponse {
  const allComments = mockComments[postId] ?? [];
  const startIndex = cursor
    ? allComments.findIndex((c) => c.id === cursor) + 1
    : 0;
  const comments = allComments.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < allComments.length;

  return {
    comments,
    nextCursor: hasMore ? comments[comments.length - 1]?.id ?? null : null,
  };
}
