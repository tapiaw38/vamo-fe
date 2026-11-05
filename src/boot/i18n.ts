import { boot } from "quasar/wrappers";
import { Lang } from "quasar";
import esLang from "quasar/lang/es";

// ponytail: single global locale, no runtime switcher — add one only if the app needs more than Spanish.
export default boot(() => {
    Lang.set(esLang as unknown as Parameters<typeof Lang.set>[0]);
});
