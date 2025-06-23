import { APIMessage } from "discord-api-types/v9";

import { DiscordClient } from "./discord";
import { getToken, isInLive } from "./twitch";

import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

let lastStart: { [stream: string]: string | null } = {};
let lastCheck: { [stream: string]: number } = {};
let lastMessage: { [stream: string]: null | APIMessage } = {};

const prisma = new PrismaClient();

const client = new DiscordClient(process.env.DISCORD);

const queue: string[] = [];

const main = async () => {
  const channels = await prisma.channel.findMany();
  const now = Date.now();
  if (!channels || channels.length === 0) {
    console.error("No channels found in the database.");
    return;
  }

  channels.forEach(async (streamer) => {
    if (
      lastCheck[streamer.id] &&
      now - lastCheck[streamer.id] < 10 * 60000 &&
      lastStart[streamer.id]
    ) {
      console.log(
        `Skipping ${streamer.id} check, last check was less than 10 minutes ago and stream was live.`
      );
      return;
    }
    if (!queue.includes(streamer.id)) queue.push(streamer.id);
  });
};

const check = async (streamer: string) => {
  const token = await getToken();
  const stream = await isInLive(token, streamer);
  console.log(`Checking if ${streamer} is live...`);
  console.log(
    `isLive : ${
      typeof stream == "boolean"
    } | lastStart : ${lastStart} | lastMessage : ${lastMessage?.id}`
  );
  lastCheck[streamer] = Date.now();
  if (stream) {
    if (lastStart[streamer] !== stream.started_at) {
      const channel = await client.createDM(process.env.DISCORD_USER_ID!);
      const msg = await client.sendMessage(
        channel.id,
        `[${stream.user_name}](<https://twitch.tv/${stream.user_name}>) is now in live for **${stream.viewer_count}** on \`${stream.title}\` (${stream.game_name})`
      );
      lastStart[streamer] = stream.started_at;
      lastMessage[streamer] = msg;
    }
  } else if (lastStart[streamer] && lastMessage[streamer]) {
    await client.replyToMessage(
      lastMessage[streamer]!.channel_id,
      lastMessage[streamer]!.id,
      `Stream now ended (${streamer})`
    );
    delete lastMessage[streamer];
    delete lastStart[streamer];
  }
};

main();
setInterval(main, 3 * 60000);
setInterval(() => {
  if (queue.length > 0) {
    const streamer = queue.shift();
    if (streamer) {
      check(streamer);
    }
  }
}, 30000);
