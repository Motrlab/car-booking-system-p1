export default function sitemap() {
  const baseUrl = "https://motrlab.com";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/coming-soon`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/invoice`,
      lastModified: new Date(),
    },
  ];
}