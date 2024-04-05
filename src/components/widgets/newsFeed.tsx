import { API } from "@/components/widgets/util/getApiData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";

interface News {
  id: number;
  published: number;
  message: string;
}

function getDateStringForThisWeek(date: any) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = daysOfWeek[date.getDay()];

  return `${dayOfWeek}`;
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
    !news.newsFeed ||
    !Array.isArray(news.newsFeed) ||
    news.newsFeed.length === 0
  ) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Oops! There seems to be a temporary issue with this feed.</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  const lastFourNews = news.newsFeed.slice(-3);

  if (lastFourNews.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Oops! There seems to be a temporary issue with this feed.</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[150px] rounded-xl bg-background p-4">
      {lastFourNews.map((newses: News, index: number) => {
        const publishedDate = new Date(newses.published * 1000);
        const regex = /<i=3>(.*?)<\/i>/;
        const match = newses.message.match(regex);
        const triggerText = match ? `${match[1]}` : "NEW DISPATCH";
        const markdown = newses.message
          .replace(regex, "")
          .replace(/<i=3>(.*?)<\/i>/g, "$1");

        return (
          <Accordion key={index} type="single" collapsible>
            <AccordionItem value={`item-${newses.id}`}>
              <AccordionTrigger>
                <div className="flex">
                  <Badge variant="outline">
                    {getDateStringForThisWeek(publishedDate)}
                  </Badge>
                  <div className="px-4">{triggerText}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}
