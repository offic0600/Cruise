import enMessages from "./messages/en";
import zhCNMessages from "./messages/zh-CN";
import type { Locale } from "./config";

type DeepStringSchema<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringSchema<T[K]>;
};

export type Messages = DeepStringSchema<typeof enMessages>;

export function getMessages(locale: Locale): Messages {
  return locale === "en" ? enMessages : zhCNMessages;
}
