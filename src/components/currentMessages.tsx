"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FirstSentence from "@/lib/firstsentence";

const MessagesList = () => {
  const [messages, setMessages] = useState<
    { id: number; message: { en: string } }[]
  >([]);

  useEffect(() => {
    axios
      .get("https://helldivers-2.fly.dev/api/801/feed")
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Accordion type="single" collapsible className="w-full">
      {messages.length === 0 ? (
        <p className="py-4 font-medium">Currently no orders</p>
      ) : (
        messages.slice(-4).map((item) => (
          <AccordionItem key={item.id} value={`item-${item.id}`}>
            <p className="flex flex-1 items-center justify-between py-4 font-medium transition-all">
              <FirstSentence text={item.message.en} />
            </p>
          </AccordionItem>
        ))
      )}
    </Accordion>
  );
};

export default MessagesList;
