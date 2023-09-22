import { Icon, MenuBarExtra, open } from "@raycast/api";
import {parse} from "node-html-parser"
import { useCallback, useEffect, useState } from "react";
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
  const fetchData = useCallback(async() => {    
    const response = await parser.parseURL("https://b.hatena.ne.jp/hotentry/it.rss")
    const parsed = response.items.map((item) => {
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

    setFeedList(parsed)
  }, [])

  useEffect(() => {
    void fetchData();
  }, [fetchData])

  const stringSlice = (str: string) => {
    return str.slice(0, 100) + (str.length > 100 ? "..." : "")
  }

  return (
    <MenuBarExtra title="はてブ" icon="https://b.hatena.ne.jp/favicon.ico">
      <MenuBarExtra.Section title="テクノロジー" />
      {feedList.map(feed => {
        return (
          <MenuBarExtra.Item
            key={feed.link}
            icon={feed.imageUrl} 
            title={stringSlice(feed.title)} 
            subtitle={stringSlice(feed.description)}
            onAction={() => open(feed.link)}
          />
        )
      })}
    </MenuBarExtra>
  );
}
