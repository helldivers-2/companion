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
  const news = await API();
  const lastFourNews = news.newsFeed.slice(-6); // Extracting the last four news items

  return (
    <>
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
                  <Badge>{getDateStringForThisWeek(publishedDate)}</Badge>
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
    </>
  );
}
