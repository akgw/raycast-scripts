import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { getFavicon, useCachedState } from "@raycast/utils";
import { useMemo, useEffect } from "react";

import useChromeBookmarks from "./hooks/useChromeBookmarks";

type Bookmark = {
  id: string;
  browser: string;
  title: string;
  url: string;
  folder: string;
};

type Folder = {
  id: string;
  icon: string;
  browser: string;
  title: string;
};

export default function Command() {
  const chrome = useChromeBookmarks(true);
  const [currentFolder, setCurrentFolder] = useCachedState<Folder>("folder", chrome.folders[0]);
  const [bookmarks, setBookmarks] = useCachedState<Bookmark[]>("bookmarks", []);
  const [folders, setFolders] = useCachedState<Folder[]>("folders", []);

  // 全bookmarks
  useEffect(() => {
    setBookmarks(chrome.bookmarks);
  }, [chrome.bookmarks, setBookmarks]);

  // 全フォルダ
  useEffect(() => {
    setFolders(chrome.folders);
  }, [chrome.folders, setFolders]);

  // 同じ階層のブックマークのみ表示
  const sameLayerBookmarks = useMemo(() => {
    if (!currentFolder) {
      return bookmarks;
    }

    return bookmarks.filter((bookmark) => {
      return bookmark.browser === currentFolder.browser && bookmark.folder === currentFolder.title;
    });
  }, [bookmarks, currentFolder]);

  // 同じ階層のフォルダのみ表示
  const sameLayerFolders = useMemo(() => {
    if (!currentFolder) {
      return folders;
    }

    return folders.filter((folder) => {
      if (folder.title.indexOf(currentFolder.title) !== 0) {
        return false;
      }

      return folder.title.replace(`${currentFolder.title}/`, "").split("/").length < 2;
    });
  }, [folders, currentFolder]);

  // refresh
  function mutateBookmarks() {
    chrome.mutate();
  }

  return (
    <List isLoading={chrome.isLoading}>
      <List.Section title="folders">
        {/* 前の階層 */}
        {currentFolder && currentFolder.title !== folders[0].title && (
          <List.Item
            key="hoge"
            icon={Icon.Folder}
            title="../"
            actions={
              <ActionPanel>
                <Action
                  icon={Icon.Pencil}
                  title="Select Folder"
                  onAction={() => {
                    const folder = folders.find(
                      (folder) => folder.title === currentFolder.title.split("/").slice(0, -1).join("/")
                    );
                    if (folder) {
                      setCurrentFolder(folder);
                    }
                  }}
                />
              </ActionPanel>
            }
          />
        )}

        {sameLayerFolders.map((folder) => {
          if (folder.title === folders[0].title) {
            return;
          }

          return (
            <List.Item
              key={folder.title}
              icon={Icon.Folder}
              title={folder.title.replace(`${currentFolder.title}/`, "")}
              accessories={[
                {
                  tag: folder?.title === currentFolder?.title ? "Current" : "",
                },
              ]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action
                      icon={Icon.Pencil}
                      title="Select Folder"
                      onAction={() => {
                        setCurrentFolder(folder);
                      }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      <List.Section title="bookmarks">
        {sameLayerBookmarks.map((item) => {
          return (
            <List.Item
              key={item.id}
              icon={getFavicon(item.url)}
              title={item.title}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={item.url} />
                  <Action.CopyToClipboard title="Copy Link" content={item.url} />

                  <ActionPanel.Section>
                    <Action
                      title="Refresh"
                      icon={Icon.ArrowClockwise}
                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                      onAction={mutateBookmarks}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      <List.EmptyView
        title="You don't have any bookmarks"
        description="Press ⏎ to select the browsers you want to import bookmarks from."
      />
    </List>
  );
}
