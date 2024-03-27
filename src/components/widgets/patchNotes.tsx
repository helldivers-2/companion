import { steamNewsAPI } from "@/lib/fetchPlanetsData";
import { NewsDialog } from "@/components/newsDialog";

interface Item {
  date: number;
  title: string;
  contents: string;
  feedname: string;
}

interface TextParserProps {
  text: string;
}

const TextParser: React.FC<TextParserProps> = ({ text }) => {
  const parsedText = parseTextToHtml(text);

  return <div dangerouslySetInnerHTML={{ __html: parsedText }} />;
};

const parseTextToHtml = (text: string): string => {
  // Implement parsing logic to handle any combination of text formatting
  // For example, you can replace [img] with <img>, [list] with <ul>, etc.
  // Here's a simple example for demonstration purposes:

  return text
    .replace(/\[img\](.*?)\[\/img\]/g, "")
    .replace(/\[previewyoutube=(.*?);full\]\[\/previewyoutube\]/g, "")
    .replace(
      /\[h2\](.*?)\[\/h2\]/g,
      "<br/><br/><h2><u><strong>$1</strong></u></h2><br/>",
    )
    .replace(/\[b\](.*?)\[\/b\]/g, "<br/><br/><strong>$1</strong><br/>")
    .replace(/\[list\]/g, "")
    .replace(/\[\/list\]/g, "")
    .replace(/\[\*\]/g, "<li>")
    .replace(/\[i\](.*?)\[\/i\]/g, "<i>$1</i>");
};

export default async function PatchNotes() {
  const posts = await steamNewsAPI();

  // Filter out items with feedname equal to "steam_community_announcements"
  const communityAnnouncements = posts.appnews.newsitems.filter(
    (item: Item) => item.feedname === "steam_community_announcements",
  );

  // Slice the array to only include the first four announcements
  const firstFourAnnouncements = communityAnnouncements.slice(0, 4);

  return (
    <main className="flex-1">
      <div className="space-y-2">
        {firstFourAnnouncements.map((item: Item, index: number) => {
          // Move the date formatting inside the map function
          const formattedDate = new Date(item.date * 1000).toLocaleDateString();

          return (
            <div
              key={index}
              className="flex h-[4.125rem] items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center space-x-4">
                <h3 className="font-medium">{item.title}</h3>
              </div>
              <div className="flex items-center space-x-4">
                <time
                  className="hidden text-muted-foreground md:flex"
                  dateTime={item.date.toString()}
                >
                  {formattedDate}
                </time>
                <NewsDialog title="Read More">
                  <TextParser text={item.contents} />
                </NewsDialog>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
