import { type Post, type PostVisibility, type PostType } from "../types";
import { type GroupFeedPost } from "../types";

export function transformGroupPostToPost(groupPost: GroupFeedPost): Post {
  return {
    ...groupPost,
    author: {
      ...groupPost.author,
      // GroupFeedPost author image can be null, Post expects undefined
      image: groupPost.author.image || undefined,
    },
    authorType: "user", // Group posts are always by users
    hasLiked: groupPost.hasLiked,
    visibility: groupPost.visibility as PostVisibility,
    type: (groupPost.type as PostType) || "general",
    media: groupPost.media.map((m) => ({
      url: m.url,
      type: m.type,
      thumbnailUrl: m.thumbnailUrl,
      altText: m.altText,
    })),
    // Fields not present in GroupFeedPost but required by Post
    taggedCollege: undefined,
    taggedCollegeId: undefined,
    isFollowing: false,
    mentions: [], // Not yet supported in group posts
  };
}
