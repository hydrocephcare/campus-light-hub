import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, RefreshCw } from "lucide-react";

const verses = [
  {
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
    theme: "Love & Salvation"
  },
  {
    text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reference: "Proverbs 3:5-6",
    theme: "Trust & Guidance"
  },
  {
    text: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13",
    theme: "Strength & Courage"
  },
  {
    text: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    reference: "Psalm 23:1-3",
    theme: "Peace & Rest"
  },
  {
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    reference: "Romans 8:28",
    theme: "Hope & Purpose"
  },
  {
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    reference: "Philippians 4:6",
    theme: "Peace & Prayer"
  },
  {
    text: "The LORD is close to the brokenhearted and saves those who are crushed in spirit.",
    reference: "Psalm 34:18",
    theme: "Comfort & Hope"
  },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", reference: "Joshua 1:9", theme: "Courage" },
  { text: "Your word is a lamp for my feet, a light on my path.", reference: "Psalm 119:105", theme: "Guidance" },
  { text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary.", reference: "Isaiah 40:31", theme: "Renewal" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28", theme: "Rest" },
  { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7", theme: "Peace" },
  { text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11", theme: "Hope & Purpose" },
  { text: "The LORD is my light and my salvation — whom shall I fear? The LORD is the stronghold of my life — of whom shall I be afraid?", reference: "Psalm 27:1", theme: "Confidence" },
  { text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", reference: "Galatians 6:9", theme: "Perseverance" },
  { text: "Delight yourself in the LORD, and he will give you the desires of your heart.", reference: "Psalm 37:4", theme: "Delight" },
  { text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", reference: "2 Corinthians 5:17", theme: "New Life" },
  { text: "Seek first his kingdom and his righteousness, and all these things will be given to you as well.", reference: "Matthew 6:33", theme: "Priorities" },
  { text: "Give thanks to the LORD, for he is good; his love endures forever.", reference: "Psalm 107:1", theme: "Thanksgiving" },
  { text: "The joy of the LORD is your strength.", reference: "Nehemiah 8:10", theme: "Joy" },
  { text: "God is our refuge and strength, an ever-present help in trouble.", reference: "Psalm 46:1", theme: "Refuge" },
  { text: "Commit to the LORD whatever you do, and he will establish your plans.", reference: "Proverbs 16:3", theme: "Purpose" },
  { text: "Above all else, guard your heart, for everything you do flows from it.", reference: "Proverbs 4:23", theme: "Discipline" },
  { text: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", reference: "Matthew 5:16", theme: "Witness" },
  { text: "Be joyful in hope, patient in affliction, faithful in prayer.", reference: "Romans 12:12", theme: "Faithfulness" },
  { text: "The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning.", reference: "Lamentations 3:22-23", theme: "Mercy" },
  { text: "Wait for the LORD; be strong and take heart and wait for the LORD.", reference: "Psalm 27:14", theme: "Patience" },
  { text: "Do nothing out of selfish ambition, but in humility value others above yourselves.", reference: "Philippians 2:3", theme: "Humility" },
  { text: "The name of the LORD is a fortified tower; the righteous run to it and are safe.", reference: "Proverbs 18:10", theme: "Safety" },
  { text: "Whatever you do, work at it with all your heart, as working for the Lord.", reference: "Colossians 3:23", theme: "Excellence" },
  { text: "Blessed is the one who perseveres under trial, because having stood the test, that person will receive the crown of life.", reference: "James 1:12", theme: "Endurance" },
  { text: "Let us hold unswervingly to the hope we profess, for he who promised is faithful.", reference: "Hebrews 10:23", theme: "Faith" },
  { text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.", reference: "Isaiah 26:3", theme: "Peace" },
  { text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", reference: "Psalm 51:10", theme: "Renewal" },
  { text: "Two are better than one, because they have a good return for their labor.", reference: "Ecclesiastes 4:9", theme: "Fellowship" },
  { text: "This is the day the LORD has made; let us rejoice and be glad in it.", reference: "Psalm 118:24", theme: "Joy" },
  { text: "For where two or three gather in my name, there am I with them.", reference: "Matthew 18:20", theme: "Fellowship" },
  { text: "Love the Lord your God with all your heart and with all your soul and with all your mind.", reference: "Matthew 22:37", theme: "Love" },
];

export const DailyBibleVerse = () => {
  const [verseIndex, setVerseIndex] = useState(0);

  useEffect(() => {
    // Change verse based on day of year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setVerseIndex(dayOfYear % verses.length);
  }, []);

  const currentVerse = verses[verseIndex];

  const getNextVerse = () => {
    setVerseIndex((prev) => (prev + 1) % verses.length);
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-navy via-navy-light to-navy text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-4">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm md:text-base font-semibold">Verse of the Day</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              Today's Word
            </h2>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-gold/20 p-8 md:p-12 text-center">
            <div className="mb-6">
              <span className="inline-block bg-gold text-navy px-4 py-1 rounded-full text-sm font-semibold mb-4">
                {currentVerse.theme}
              </span>
            </div>
            
            <blockquote className="text-lg md:text-2xl leading-relaxed mb-6 italic">
              "{currentVerse.text}"
            </blockquote>
            
            <p className="text-gold text-lg md:text-xl font-bold mb-8">
              — {currentVerse.reference}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={getNextVerse}
                variant="outline" 
                className="border-2 border-gold text-gold hover:bg-gold hover:text-navy"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Next Verse
              </Button>
              <Button className="bg-gold hover:bg-gold/90 text-navy">
                <BookOpen className="w-4 h-4 mr-2" />
                Read Full Bible
              </Button>
            </div>
          </Card>

          <p className="text-center text-gold-light text-sm mt-6">
            Verse changes daily. Come back tomorrow for a new word from God!
          </p>
        </div>
      </div>
    </section>
  );
};
