import { Action, ActionPanel, Grid, Icon } from "@raycast/api";
import { parse } from "node-html-parser";
import { useMemo, useState } from "react";
import RssParser from "rss-parser";

const parser = new RssParser();

type Feed = {
  date: string;
  title: string;
  link: string;
  description: string;
  imageUrl: string;
};

export default function Command() {
  const [feedList, setFeedList] = useState<Feed[]>([]);

  useMemo(async () => {
    const response = await parser.parseURL("https://b.hatena.ne.jp/hotentry/it.rss");
    setFeedList(
      response.items.map((item) => {
        return {
          date: item.date,
          title: item.title || "",
          link: item.link || "",
          description: item.content || "",
          imageUrl:
            parse(item["content:encoded"] || "")
              .querySelector("img.entry-image")
              ?.getAttribute("src")
              ?.toString() || Icon.Checkmark,
        };
      })
    );
  }, []);

  return (
    <Grid columns={5} inset={Grid.Inset.Small} filtering={false}>
      {feedList.map((feed) => (
        <Grid.Item
          key={feed.link}
          title={feed.title}
          subtitle={feed.description}
          content={feed.imageUrl}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={feed.link} />
            </ActionPanel>
          }
        />
      ))}
    </Grid>
  );
}
