import { Deepgram } from "@deepgram/sdk";
import { LiveTranscription } from "@deepgram/sdk/dist/transcription/liveTranscription";
import dotenv from "dotenv";

dotenv.config();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || "";
if (!DEEPGRAM_API_KEY) {
  throw new Error(
    "DEEPGRAM_API_KEY is not defined in the environment variables."
  );
}

let keepAlive: NodeJS.Timeout;

type TranscriptReceivedEventHandler = (data: string) => Promise<void>;

export function getDeepgramLiveConnection(
  transcriptReceivedEventHandler: TranscriptReceivedEventHandler
): LiveTranscription {
  //   instantiate Deepgram object
  const deepgram = new Deepgram(DEEPGRAM_API_KEY);
  const deepgramLive = deepgram.transcription.live({
    language: "en",
    punctuate: true,
    smart_format: true,
    model: "nova",
  });

  //   clear keepAlive if it's been set, and restart it
  function clearKeepAlive() {
    if (keepAlive) clearInterval(keepAlive);
  }
  clearKeepAlive();
  keepAlive = setInterval(() => {
    deepgramLive.keepAlive();
  }, 10 * 1000);

  //   add event listeners for open, close, and error
  deepgramLive.addListener("open", async () => {
    console.log("deepgram: connected");

    deepgramLive.addListener("close", async (data) => {
      console.log("deepgram: disconnected: ");
      clearInterval(keepAlive);
      deepgramLive.finish();
    });

    deepgramLive.addListener("error", async (error) => {
      console.log("deepgram: error recieved");
      console.error(error);
    });
  });

  //   add event listener for transcriptReceived - passed in by caller
  deepgramLive.addListener(
    "transcriptReceived",
    transcriptReceivedEventHandler
  );
  return deepgramLive;
}
