import type { DemandReport } from "../types/demand-report";

export const mockDemandReport: DemandReport = {
  keyword: "youtube automation",
  trendScore: 8,
  trendLabel: "Rising",
  quotes: [
    {
      source: "Reddit",
      author: "u/example1",
      text: "Most tools are too generic and don't help me validate demand fast enough.",
    },
    {
      source: "X",
      author: "@creatordev",
      text: "I need a way to turn scattered complaints into product ideas.",
    },
  ],
  painPoints: [
    "很难快速验证一个方向是否真有需求",
    "跨平台信息分散，整理成本高",
    "用户抱怨很多，但很难转化成可执行产品方案",
  ],
  productIdeas: [
    {
      title: "Pain Point Radar",
      description: "自动聚合用户抱怨并生成产品机会清单。",
      targetUser: "独立开发者",
    },
    {
      title: "Trend-to-Product Mapper",
      description: "把趋势词自动映射成可落地的 SaaS / 插件 / App 点子。",
      targetUser: "创业者与产品经理",
    },
  ],
  opportunityScore: 8.5,
  metrics: {
    demand: 9,
    competition: 6,
    monetization: 8,
  },
};
