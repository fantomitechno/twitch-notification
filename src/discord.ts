import { APIChannel, APIMessage } from "discord-api-types/v9";

class DiscordClient {
  private readonly token: string;
  constructor(token?: string) {
    if (!token) throw new Error("NO TOKEN PROVIDED");
    this.token = token;
  }

  /**
   * Create a DM channel with someone and return it
   */
  public createDM = async (user: string) => {
    const res = await fetch("https://discord.com/api/v9/users/@me/channels", {
      headers: {
        Authorization: "Bot " + this.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: user,
      }),
      method: "POST",
    });
    const json: APIChannel = await res.json();
    return json;
  };

  /**
   * Send a message in a channel (only text)
   */
  public sendMessage = async (channel: string, content: string) => {
    const res = await fetch(
      `https://discord.com/api/v9/channels/${channel}/messages`,
      {
        headers: {
          Authorization: "Bot " + this.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
        }),
        method: "POST",
      }
    );
    const json: APIMessage = await res.json();
    return json;
  };

  /**
   * Reply to a message in a given channel (only text)
   */
  public replyToMessage = async (
    channel: string,
    message: string,
    content: string
  ) => {
    const res = await fetch(
      `https://discord.com/api/v9/channels/${channel}/messages`,
      {
        headers: {
          Authorization: "Bot " + this.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          message_reference: {
            message_id: message,
          },
        }),
        method: "POST",
      }
    );
    const json: APIMessage = await res.json();
    return json;
  };
}

export { DiscordClient };
