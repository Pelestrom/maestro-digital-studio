import { useEffect, useRef, useState } from "react";

/**
 * Typewriter that cycles through a list of words: type → hold → erase → next.
 * Calls onTypeChar each time a new character is appended (typing phase only).
 */
export function useTypewriter(
  words: string[],
  opts: {
    typeSpeed?: number;
    deleteSpeed?: number;
    holdTime?: number;
    pauseTime?: number;
    onTypeChar?: () => void;
  } = {},
) {
  const { typeSpeed = 60, deleteSpeed = 35, holdTime = 1800, pauseTime = 300, onTypeChar } = opts;
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing" | "pausing">("typing");
  const onTypeCharRef = useRef(onTypeChar);
  onTypeCharRef.current = onTypeChar;

  useEffect(() => {
    if (!words.length) return;
    const word = words[index % words.length];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < word.length) {
        timer = setTimeout(() => {
          setText(word.slice(0, text.length + 1));
          onTypeCharRef.current?.();
        }, typeSpeed);
      } else {
        timer = setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), holdTime);
    } else if (phase === "erasing") {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
      } else {
        timer = setTimeout(() => setPhase("pausing"), 0);
      }
    } else if (phase === "pausing") {
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase("typing");
      }, pauseTime);
    }
    return () => clearTimeout(timer);
  }, [text, phase, index, words, typeSpeed, deleteSpeed, holdTime, pauseTime]);

  return text;
}
