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
        <DialogTrigger>
          <Button className=" flex md:hidden" variant="outline" size="icon">
            <LuDownload />
          </Button>
          <Button className="hidden md:flex" variant="outline">
            <LuDownload className="mr-2" /> get the Webapp
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>get the Webapp</DialogTitle>
          </DialogHeader>
          <div className="prose">{getHow(userBrowser)}</div>
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
          <h2>How to Install the Companion on Chrome:</h2>
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
          </ol>
        </>
      );
    case "firefox":
      return (
        <>
          <h2>How to Install the Companion on Firefox:</h2>
          <ol>
            <li>Open Firefox and go to the website.</li>
            <li>
              Click on the menu button (three horizontal lines) in the top-right
              corner.
            </li>
            <li>
              Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
              from the dropdown menu.
            </li>
            <li>Follow the prompts to install the app.</li>
          </ol>
        </>
      );
    case "edge":
      return (
        <>
          <h2>How to Install the Companion on Edge:</h2>
          <ol>
            <li>Open Edge and go to the website.</li>
            <li>
              Click on the menu button (three horizontal dots) in the top-right
              corner.
            </li>
            <li>
              Select <strong>&quot;Apps&quot;</strong> and then{" "}
              <strong>&quot;Install this site as an app&quot;</strong>.
            </li>
            <li>Follow the prompts to install the app.</li>
          </ol>
        </>
      );
    case "safari":
      return (
        <>
          <h2>How to Install the Companion on Safari:</h2>
          <ol>
            <li>Open Safari and go to the website.</li>
            <li>
              Click on <strong>&quot;File&quot;</strong> in the menu bar and
              select <strong>&quot;Add to Home Screen&quot;</strong>.
            </li>
            <li>
              Enter the name for the app and click{" "}
              <strong>&quot;Add&quot;</strong>.
            </li>
            <li>The app will now be added to your home screen.</li>
          </ol>
        </>
      );
    case "opera":
      return (
        <>
          <h2>How to Install the Companion on Opera:</h2>
          <ol>
            <li>Open Opera and go to the website.</li>
            <li>
              Click on the menu button (three horizontal lines) in the top-left
              corner.
            </li>
            <li>
              Select <strong>&quot;Install Helldivers Companion&quot;</strong>{" "}
              from the dropdown menu.
            </li>
            <li>Follow the prompts to install the app.</li>
          </ol>
        </>
      );
    case "samsung":
      return (
        <>
          <h2>How to Install the Companion on Samsung Internet:</h2>
          <ol>
            <li>Open Samsung Internet and go to the website.</li>
            <li>
              Tap on the menu button (three vertical dots) in the bottom-right
              corner.
            </li>
            <li>
              Select <strong>&quot;Add to Home screen&quot;</strong> from the
              menu.
            </li>
            <li>Follow the prompts to add the app to your home screen.</li>
          </ol>
        </>
      );
    default:
      return (
        <p>
          How for installing the Companion on your browser are not available.
        </p>
      );
  }
};
