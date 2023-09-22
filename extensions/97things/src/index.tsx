import { MenuBarExtra, open } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import chunk from 'chunk-text';
import dayjs from "dayjs";
import fetch from "node-fetch";
import { parse } from "node-html-parser";
import { useMemo } from "react";

export default function Command() {
  const [body, setBody] = useCachedState<string[]>("body", []);
  const [url, setUrl] = useCachedState<string>("url", "https://xn--97-273ae6a4irb6e2hsoiozc2g4b8082p.com");
  const [menuTitle, setMenuTitle] = useCachedState<string>("menutitle", "プログラマが知るべき97のこと");
  const notificationNum = dayjs().diff(dayjs().format("YYYY-01-01"), "day") % 107 // TODO 動的に総件数取得

  useMemo(async () => {
    const response = await fetch("https://xn--97-273ae6a4irb6e2hsoiozc2g4b8082p.com/")
    const body = await response.text();
    
    const links: string[] = []
    parse(body).querySelectorAll("ol > li > a").forEach(node => {
      const link = node.getAttribute("href")
      if (!link) {
        return;
      }
      
      links.push(link)
    })
    
    setUrl(`https://xn--97-273ae6a4irb6e2hsoiozc2g4b8082p.com${links[notificationNum - 1]}`)
  }, [notificationNum, setUrl]);


  useMemo(async () => {
    const response = await fetch(url)
    const body = await response.text();
    
    setMenuTitle(parse(body).querySelector("h1.post-title")?.text.toString() || "")

    let parsed: string[] = []
    parse(body).querySelectorAll("article > p,div.highlighter-rouge").forEach(node => {
      const text = node.querySelector(":not(script)")?.text.toString()
      if (!text) {
        return;
      }

      parsed = parsed.concat(chunk(text.replace("。", "。\n\n"), 120))
    })
    
    setBody(parsed)
  }, [url]);

  return (
    <MenuBarExtra title="プログラマが知るべき97のこと" icon="https://xn--97-273ae6a4irb6e2hsoiozc2g4b8082p.com/assets/favicon.ico">
      <MenuBarExtra.Item title={menuTitle} />
      <MenuBarExtra.Item
        title={body.join("\n")}
        onAction={() => open(url)}
      />
    </MenuBarExtra>
  );
}
