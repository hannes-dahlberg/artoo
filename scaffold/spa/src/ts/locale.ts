import { readFileSync } from "fs";
import VueI18n from "vue-i18n";

const translationsPath: string = "spa/resources/translations/";

export const i18n = new VueI18n({
  locale: "en", // set locale,
  messages: {
    en: JSON.parse(readFileSync(`${translationsPath}en.json`, "utf8")),
  },
});
