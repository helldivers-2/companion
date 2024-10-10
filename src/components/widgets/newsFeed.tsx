import { API } from "@/components/widgets/util/getApiData";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface News {
  id: number;
  published: number;
  message: string;
}

export default async function newsFeeds() {
  let news;

  try {
    news = await API();
  } catch (error) {
    console.error("Error fetching news:", error);
    return (
      <div className="text-center text-muted-foreground">
        <p>Oops! There seems to be a temporary issue with this feed.</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (
    !news ||
    !news.news_feed ||
    !Array.isArray(news.news_feed) ||
    news.news_feed.length === 0
  ) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Oops! There seems to be a temporary issue with this feed.</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  const lastFourNews = news.news_feed.slice(-3);

  if (lastFourNews.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Oops! There seems to be a temporary issue with this feed.</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {lastFourNews.map((newses: News, index: number) => {
        const regex = /<i=3>(.*?)<\/i>/;
        const match = newses.message.match(regex);
        const triggerText = match ? `${match[1]}` : "NEW DISPATCH";
        const markdown = newses.message
          .replace(regex, "")
          .replace(/<i=1>(.*?)<\/i>/g, "$1");

        return (
          <div key={index}>
            <Card key={newses.id}>
              <CardHeader className="pb-0 md:pb-0">
                <CardTitle className="leading-none">{triggerText}</CardTitle>
              </CardHeader>
              <CardContent>
                <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
