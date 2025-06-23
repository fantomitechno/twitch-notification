import { APIMessage } from "discord-api-types/v9";

import { DiscordClient } from "./discord";
import { getToken, isInLive } from "./twitch";

import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

let lastStart: { [stream: string]: string | null } = {};
let lastMessage: { [stream: string]: null | APIMessage } = {};

const prisma = new PrismaClient();

const client = new DiscordClient(process.env.DISCORD);

const main = async () => {
  const token = await getToken();
  const channels = await prisma.channel.findMany();
  channels.forEach(async (streamer) => {
    const stream = await isInLive(token, streamer.id);
    console.log("Checking if streamer is live...");
    console.log(
      `isLive : ${stream} | lastStart : ${lastStart} | lastMessage : ${lastMessage?.id}`
    );
    if (stream) {
      if (lastStart[streamer.id] !== stream.started_at) {
        const channel = await client.createDM(process.env.DISCORD_USER_ID!);
        const msg = await client.sendMessage(
          channel.id,
          `${stream.user_name} is now in live for ${stream.viewer_count} on \`${stream.title}\` (${stream.game_name})`
        );
        lastStart[streamer.id] = stream.started_at;
        lastMessage[streamer.id] = msg;
      }
    } else if (lastStart[streamer.id] && lastMessage[streamer.id]) {
      await client.replyToMessage(
        lastMessage[streamer.id]!.channel_id,
        lastMessage[streamer.id]!.id,
        `Stream now ended (${streamer.id})`
      );
      lastMessage[streamer.id] = null;
      lastStart[streamer.id] = null;
    }
  });
};

main();
setInterval(main, 60000);
