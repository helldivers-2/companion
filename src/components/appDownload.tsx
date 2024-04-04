"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { LuDownload } from "react-icons/lu";
import { setCookie, getCookie } from "cookies-next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type BrowserType =
  | "chrome"
  | "firefox"
  | "edge"
  | "safari"
  | "opera"
  | "samsung"
  | "other";

export default function AppDownload() {
  const [userBrowser, setUserBrowser] = useState<BrowserType>("other"); // Initialize to 'other'
  const [showDialog, setShowDialog] = useState(true);

  useEffect(() => {
    // Detect user's browser
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome")) {
      setUserBrowser("chrome");
    } else if (userAgent.includes("firefox")) {
      setUserBrowser("firefox");
    } else if (userAgent.includes("edge")) {
      setUserBrowser("edge");
    } else if (userAgent.includes("safari")) {
      setUserBrowser("safari");
    } else if (userAgent.includes("opera")) {
      setUserBrowser("opera");
    } else if (userAgent.includes("samsung")) {
      setUserBrowser("samsung");
    }
    // No need to handle 'other' here as it's already set as the default value
  }, []);

  const handleHide = () => {
    // Set a cookie to hide the component
    setCookie("hideWebAppDialog", "true", { maxAge: 3600 * 24 * 31 });
    setShowDialog(false); // Hide the dialog without reloading the page
  };

  // Check if the cookie to hide the dialog exists
  const shouldShowDialog = showDialog && !getCookie("hideWebAppDialog");

  // Render the dialog only if the cookie doesn't exist or is not set to 'true'
  return shouldShowDialog ? (
    <div className="website fixed bottom-4 left-4 z-[1500]">
      <Dialog>
        <DialogTrigger asChild className="flex items-center">
          <Button variant="outline">
            <>
              <LuDownload />
              <span className="ml-2 hidden md:block">get the Webapp</span>
            </>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[66vmax]">
          <DialogHeader>
            <DialogTitle>get the Webapp</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="mobile">
            <TabsList className="w-full">
              <TabsTrigger className="w-full" value="mobile">
                Mobile
              </TabsTrigger>
              <TabsTrigger className="w-full" value="desktop">
                Desktop
              </TabsTrigger>
            </TabsList>
            <ScrollArea className="size-full max-h-[50vmax]">
              <div className="prose">{getHow(userBrowser)}</div>
            </ScrollArea>
          </Tabs>
          <DialogFooter>
            <Button onClick={handleHide}>Don&apos;t ask again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ) : null;
}

const getHow = (browser: BrowserType) => {
  switch (browser) {
    case "chrome":
      return (
        <>
          <h2 className="pt-4 font-medium">
            How to Install the Companion on Chrome:
          </h2>
          <TabsContent value="desktop">
            <ol className="list-outside list-decimal">
              <li>Open Chrome and go to the website.</li>
              <li>
                Click on the menu button (three dots) in the top-right corner.
              </li>
              <li>
                Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
                from the dropdown menu.
              </li>
              <li>Follow the prompts to install the app.</li>
              <li>
                Alternatively, you may see an &quot;Install&quot; button in the
                address bar, which you can click to install the app.
              </li>
            </ol>
          </TabsContent>
          <TabsContent value="mobile">
            <ol className="list-outside list-decimal">
              <li>Open Chrome on your mobile device and go to the website.</li>
              <li>Tap the menu button (three dots) in the top-right corner.</li>
              <li>
                Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
                from the menu.
              </li>
              <li>Follow the prompts to install the app.</li>
            </ol>
          </TabsContent>
        </>
      );
    case "firefox":
      return (
        <>
          <h2 className="pt-4 font-medium">
            How to Install the Companion on Firefox:
          </h2>
          <TabsContent value="desktop">
            <ol className="list-outside list-decimal">
              <li>Open Firefox and go to the website.</li>
              <li>
                Click on the menu button (three horizontal lines) in the
                top-right corner.
              </li>
              <li>
                Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
                from the dropdown menu (if available).
              </li>
              <li>
                If the &quot;Install&quot; option is not available, the website
                may not meet Firefox&apos;s requirements for Progressive Web App
                installation.
              </li>
            </ol>
          </TabsContent>
          <TabsContent value="mobile">
            <ol className="list-outside list-decimal">
              <li>Open Firefox on your mobile device and go to the website.</li>
              <li>
                Tap the menu button (three horizontal lines) in the top-right
                corner.
              </li>
              <li>
                Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
                from the menu (if available).
              </li>
              <li>
                If the &quot;Install&quot; option is not available, the website
                may not meet Firefox&apos;s requirements for Progressive Web App
                installation.
              </li>
            </ol>
          </TabsContent>
        </>
      );
    case "edge":
      return (
        <>
          <h2 className="pt-4 font-medium">
            How to Install the Companion on Edge:
          </h2>
          <TabsContent value="desktop">
            <ol className="list-outside list-decimal">
              <li>Open Edge and go to the website.</li>
              <li>
                Click on the menu button (three horizontal dots) in the
                top-right corner.
              </li>
              <li>
                Select <strong>&quot;Apps&quot;</strong> and then{" "}
                <strong>&quot;Install this site as an app&quot;</strong>.
              </li>
              <li>Follow the prompts to install the app.</li>
              <li>
                Alternatively, you may see an &quot;Install&quot; button in the
                address bar, which you can click to install the app.
              </li>
            </ol>
          </TabsContent>
          <TabsContent value="mobile">
            <ol className="list-outside list-decimal">
              <li>Open Edge on your mobile device and go to the website.</li>
              <li>Tap the menu button (three dots) in the bottom-center.</li>
              <li>
                Select <strong>&quot;Apps&quot;</strong> and then{" "}
                <strong>&quot;Install this site as an app&quot;</strong>.
              </li>
              <li>Follow the prompts to install the app.</li>
            </ol>
          </TabsContent>
        </>
      );
    case "safari":
      return (
        <>
          <h2 className="pt-4 font-medium">
            How to Add the Companion to the Home Screen on Safari:
          </h2>
          <TabsContent value="desktop">
            <ol className="list-outside list-decimal">
              <li>Open Safari and go to the website.</li>
              <li>
                Click on <strong>&quot;File&quot;</strong> in the menu bar and
                select <strong>&quot;Add to Home Screen&quot;</strong>.
              </li>
              <li>
                Enter the name for the app and click{" "}
                <strong>&quot;Add&quot;</strong>.
              </li>
              <li>The website will now be added to your home screen.</li>
              <li>
                Note: Safari does not have full support for Progressive Web App
                installation.
              </li>
            </ol>
          </TabsContent>
          <TabsContent value="mobile">
            <ol className="list-outside list-decimal">
              <li>Open Safari on your mobile device and go to the website.</li>
              <li>
                Tap the Share icon (square with an upward arrow) at the bottom
                of the screen.
              </li>
              <li>
                Scroll down and tap{" "}
                <strong>&quot;Add to Home Screen&quot;</strong>.
              </li>
              <li>
                Enter the name for the app and tap{" "}
                <strong>&quot;Add&quot;</strong>.
              </li>
              <li>The website will now be added to your home screen.</li>
              <li>
                Note: Safari does not have full support for Progressive Web App
                installation on iOS.
              </li>
            </ol>
          </TabsContent>
        </>
      );
    case "opera":
      return (
        <>
          <h2 className="pt-4 font-medium">
            How to Install the Companion on Opera:
          </h2>
          <TabsContent value="desktop">
            <ol className="list-outside list-decimal">
              <li>Open Opera and go to the website.</li>
              <li>
                Click on the menu button (three horizontal lines) in the
                top-left corner.
              </li>
              <li>
                Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
                from the dropdown menu.
              </li>
              <li>Follow the prompts to install the app.</li>
            </ol>
          </TabsContent>
          <TabsContent value="mobile">
            <ol className="list-outside list-decimal">
              <li>Open Opera on your mobile device and go to the website.</li>
              <li>
                Tap the menu button (three horizontal lines) in the bottom-right
                corner.
              </li>
              <li>
                Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
                from the menu.
              </li>
              <li>Follow the prompts to install the app.</li>
            </ol>
          </TabsContent>
        </>
      );
    case "samsung":
      return (
        <>
          <h2 className="pt-4 font-medium">
            How to Add the Companion to the Home Screen on Samsung Internet:
          </h2>
          <TabsContent value="desktop">
            <ol className="list-outside list-decimal">
              <li>Open Samsung Internet and go to the website.</li>
              <li>
                Tap on the menu button (three vertical dots) in the bottom-right
                corner.
              </li>
              <li>
                Select <strong>&quot;Add to Home screen&quot;</strong> from the
                menu.
              </li>
              <li>
                Follow the prompts to add the website to your home screen.
              </li>
              <li>
                Note: This does not install a Progressive Web App, but provides
                a similar experience.
              </li>
            </ol>
          </TabsContent>
          <TabsContent value="mobile">
            <ol className="list-outside list-decimal">
              <li>
                Open Samsung Internet on your mobile device and go to the
                website.
              </li>
              <li>
                Tap on the menu button (three vertical dots) in the bottom-right
                corner.
              </li>
              <li>
                Select <strong>&quot;Add to Home screen&quot;</strong> from the
                menu.
              </li>
              <li>
                Follow the prompts to add the website to your home screen.
              </li>
              <li>
                Note: This does not install a Progressive Web App, but provides
                a similar experience.
              </li>
            </ol>
          </TabsContent>
        </>
      );
    default:
      return (
        <p>
          Instructions for installing the Companion on your browser are not
          available.
        </p>
      );
  }
};
