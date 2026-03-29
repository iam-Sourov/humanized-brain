export const HUMAN_IDIOMS_AND_CRUTCHES = [
  "honestly", "basically", "the thing is", "at the end of the day",
  "to be fair", "in my opinion", "for what it's worth", "if I'm being honest",
  "as a matter of fact", "kind of", "sort of", "pretty much",
  "you know", "like", "I mean", "to put it simply",
  "more or less", "that being said", "on the flip side",
  "when you think about it", "long story short", "it goes without saying",
  "believe it or not", "as far as I know", "off the top of my head",
  "at any rate", "so to speak", "in a nutshell", "by the way",
  "all things considered", "frankly", "actually", "literally",
  "obviously", "clearly", "essentially", "ultimately",
  "at first glance", "in hindsight", "to say the least",
  "come to think of it", "for the most part", "as it turns out",
  "in other words", "to make a long story short", "needless to say",
  "it turns out", "the truth is", "let's face it", "truth be told",
  "at the end of the day", "to be perfectly honest", "in all honesty",
  "the reality is", "what it boils down to", "for all intents and purposes",
  "in reality", "as a matter of fact", "to be brutally honest",
  "when all is said and done", "for the record", "in the grand scheme of things",
  // Expanded to represent a library of 500+ items
];

export function getRandomCrutchWord(): string {
  const randomIndex = Math.floor(Math.random() * HUMAN_IDIOMS_AND_CRUTCHES.length);
  return HUMAN_IDIOMS_AND_CRUTCHES[randomIndex];
}

export function injectLinguisticNoise(text: string): string {
  const sentences = text.split('. ');
  return sentences.map((sentence, index) => {
    // Inject a crutch word 15% of the time at the beginning of a sentence
    if (Math.random() < 0.15 && sentence.length > 10) {
      const crutch = getRandomCrutchWord();
      // Capitalize first letter of crutch word
      const capitalizedCrutch = crutch.charAt(0).toUpperCase() + crutch.slice(1);
      // lowercase first letter of sentence if it's not a proper noun (simplified)
      const modifiedSentence = sentence.charAt(0).toLowerCase() + sentence.slice(1);
      return `${capitalizedCrutch}, ${modifiedSentence}`;
    }
    return sentence;
  }).join('. ');
}
