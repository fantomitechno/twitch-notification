type Auth = {
  access_token: string;
  expires_in: number;
  scope?: string[];
  token_type: "bearer";
};

type Stream = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
};

type Base<T> = {
  data: T[];
};

export { Stream, Base, Auth };
