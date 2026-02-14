import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  outputFileTracingRoot: __dirname,
  experimental: {
    // Avoid Next.js devtools segment explorer issues that can break the dev RSC manifest.
    devtoolSegmentExplorer: false,
  },
};
