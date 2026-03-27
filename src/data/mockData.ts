export interface PainPoint {
  id: string;
  quote: string;
  source: string;
  author: string;
  avatar: string;
  upvotes: number;
  timestamp: string;
}

export interface ProductIdea {
  id: string;
  title: string;
  description: string;
  targetUser: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface InsightData {
  keyword: string;
  trendScore: number;
  trendLabel: "Rising" | "Stable" | "Declining";
  opportunityScore: number;
  demandScore: number;
  competitionScore: number;
  monetizationScore: number;
  painPoints: PainPoint[];
  summary: string[];
  productIdeas: ProductIdea[];
}

const mockDataMap: Record<string, InsightData> = {
  default: {
    keyword: "youtube automation",
    trendScore: 8,
    trendLabel: "Rising",
    opportunityScore: 8.5,
    demandScore: 9.0,
    competitionScore: 6.5,
    monetizationScore: 8.2,
    painPoints: [
      {
        id: "1",
        quote: "I spend 4 hours editing each video. If there was a tool that could auto-cut silences and add captions, I'd pay $50/month instantly.",
        source: "Reddit r/NewTubers",
        author: "creator_mike",
        avatar: "M",
        upvotes: 342,
        timestamp: "2d ago",
      },
      {
        id: "2",
        quote: "The hardest part isn't making videos — it's coming up with titles and thumbnails that actually get clicks. I need AI for that.",
        source: "Twitter/X",
        author: "sarahbuilds",
        avatar: "S",
        upvotes: 189,
        timestamp: "5h ago",
      },
      {
        id: "3",
        quote: "I have 200+ videos and zero idea which ones to repurpose into Shorts. Manual process is killing my growth.",
        source: "Reddit r/youtubers",
        author: "vid_hustler",
        avatar: "V",
        upvotes: 567,
        timestamp: "1d ago",
      },
      {
        id: "4",
        quote: "Scheduling, analytics, SEO optimization — I'm using 5 different tools. Why isn't there ONE dashboard for everything?",
        source: "IndieHackers",
        author: "alexstartup",
        avatar: "A",
        upvotes: 234,
        timestamp: "3d ago",
      },
      {
        id: "5",
        quote: "Auto-generating chapters and timestamps from my video transcript would save me 30 min per upload. Someone please build this.",
        source: "Reddit r/automation",
        author: "productivepete",
        avatar: "P",
        upvotes: 891,
        timestamp: "12h ago",
      },
    ],
    summary: [
      "Video editing automation is the #1 pain — creators want auto-cuts, captions, and silence removal",
      "Title/thumbnail generation with AI is highly requested but underserved",
      "Repurposing long-form to Shorts is a massive manual bottleneck",
      "Tool fragmentation — creators juggle 3-5 tools for a single workflow",
      "SEO and metadata optimization is tedious and poorly understood",
    ],
    productIdeas: [
      {
        id: "1",
        title: "ClipPilot",
        description: "AI-powered tool that auto-edits raw footage: removes silences, adds captions, suggests cuts, and exports ready-to-upload videos.",
        targetUser: "YouTube creators with 1K-100K subscribers",
        difficulty: "Hard",
      },
      {
        id: "2",
        title: "ThumbGenius",
        description: "Generate click-worthy thumbnails and titles using AI trained on top-performing videos in your niche.",
        targetUser: "Content creators struggling with CTR",
        difficulty: "Medium",
      },
      {
        id: "3",
        title: "ReelMaker",
        description: "Automatically identify the best moments in long videos and convert them into vertical Shorts/Reels with one click.",
        targetUser: "Creators wanting to grow on multiple platforms",
        difficulty: "Medium",
      },
      {
        id: "4",
        title: "TubeCommand",
        description: "All-in-one YouTube dashboard: scheduling, analytics, SEO scores, competitor tracking, and content calendar.",
        targetUser: "Professional YouTubers and agencies",
        difficulty: "Hard",
      },
      {
        id: "5",
        title: "ChapterBot",
        description: "Auto-generate video chapters, timestamps, and descriptions from transcripts. Boost SEO with zero effort.",
        targetUser: "Educational and tutorial creators",
        difficulty: "Easy",
      },
    ],
  },
};

export function getMockData(keyword: string): InsightData {
  const data = mockDataMap.default;
  return { ...data, keyword: keyword || data.keyword };
}
