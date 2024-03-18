import React from "react";

interface Props {
  text: string; // Define the type of the text prop as string
}

const FirstSentence: React.FC<Props> = ({ text }) => {
  // Function to extract the first sentence from the text
  const extractFirstSentence = (text: string) => {
    if (text) {
      // Regular expression to split the text into sentences
      const sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
      if (sentences && sentences.length > 0) {
        // Return the first sentence
        return sentences[0];
      }
    }
    // If no sentences found or text is empty, return an empty string
    return "";
  };

  return <>{extractFirstSentence(text)}</>;
};

export default FirstSentence;
