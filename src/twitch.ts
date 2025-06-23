import { Auth, Base, Stream } from "./types";

/**
 * Get a Twitch Token
 */
const getToken = async () => {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`,
    {
      method: "POST",
    }
  );
  const json: Auth = await res.json();
  return json.access_token;
};

/**
 * Get if a streamer is streaming right now
 */
const isInLive = async (token: string, streamer: string) => {
  const res = await fetch(
    "https://api.twitch.tv/helix/streams/?user_login=" + streamer,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": process.env.TWITCH_ID ?? "",
        Accept: "application/vnd.twitchtv.v5+json",
      },
      method: "GET",
    }
  );
  const json: Base<Stream> = await res.json();
  const data = json.data;
  if (!data.length) return false;
  const stream = data[0];
  return stream;
};

export { getToken, isInLive };
