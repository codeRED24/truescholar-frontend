import { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ts-25-truescholar.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/private/",
      },
    ],
    sitemap: [
      `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap-static.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap-colleges.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap-exams.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap-articles.xml`,
    ],
  };
}
// import { MetadataRoute } from "next";
// export default function robots(): MetadataRoute.Robots {
//   const baseUrl = "http://localhost:3000/";
//   if (process.env.NEXT_PUBLIC_UI_URL !== "https://www.truescholar.in") {
//     return {
//       rules: [
//         {
//           userAgent: "*",
//           disallow: "/",
//         },
//       ],
//     };
//   }
//   return {
//     rules: [
//       {
//         userAgent: "*",
//         allow: "/",
//         disallow: "/private/",
//       },
//     ],
//     sitemap: [
//       `${baseUrl}/sitemap.xml`,
//       // `${baseUrl}/index-updates.xml`,
//       // `${baseUrl}/news.xml`,
//       // `${baseUrl}/latest-updates.xml`,
//     ],
//   };
// }
