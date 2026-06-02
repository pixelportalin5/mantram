import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PRODUCT_TYPE_CATEGORIES = [
  "BALLS",
  "BRACELETS",
  "CLUSTERS",
  "RAW CRYSTALS",
  "FREE SHAPES",
  "GEODE",
  "GUA SHA & FACE ROLLER",
  "HANGERS",
  "IDOLS",
  "KEYCHAINS",
  "MALAS",
  "MASSACRE",
  "PENCILS",
  "PENDENTS",
  "PLATES",
  "PYRAMIDS",
  "RINGS",
  "TREES",
  "TUMBLES",
  "WANDS",
];

const STONE_SUBCATEGORIES = [
  "Amethyst",
  "Aquamarine",
  "BLACK OBSIDIAN",
  "BLACK TOURMALINE",
  "CARNELIAN",
  "CAT'S EYE",
  "CITRINE",
  "CLEAR QUARTZ",
  "DOUBLE PROTECTION",
  "EVIL EYE AGATE",
  "GARNET",
  "GOLDEN OBSIDIAN",
  "GREEN AVENTURINE",
  "GREEN JADE",
  "HEMETITE",
  "HOWLITE",
  "LABRADORITE",
  "LAPIS LAZULI",
  "MALACHITE",
  "MONEY MAGNET",
  "MOON STONE",
  "PERIDOT",
  "PYRITE",
  "RAINBOW FLUORITE",
  "RED JASPER",
  "RHODONITE",
  "ROSE QUARTZ",
  "SEVEN CHAKRAS",
  "SMOKY QUARTZ",
  "SODALITE",
  "TIGER EYE",
  "TORQUISE",
  "TRIPLE PROTECTION",
  "UNAKITE",
  "WOOD JASPER",
  "YELLOW JADE",
];

const STONE_PARENT_CATEGORY = "CRYSTAL TYPES";
const isDryRun = process.argv.includes("--dry-run");

function loadDotEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const envFile = readFileSync(envPath, "utf8");

  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
      return;
    }

    const [key, ...valueParts] = trimmedLine.split("=");
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");

    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function getWooConfig() {
  loadDotEnvLocal();

  const backendUrl = process.env.NEXT_PUBLIC_WP_BACKEND_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_WP_BACKEND_URL is required.");
  }

  if (!isDryRun && (!consumerKey || !consumerSecret)) {
    throw new Error(
      "WC_CONSUMER_KEY and WC_CONSUMER_SECRET are required to create WooCommerce categories.",
    );
  }

  return {
    endpoint: `${backendUrl.replace(/\/$/, "")}/wp-json/wc/v3/products/categories`,
    consumerKey,
    consumerSecret,
  };
}

async function wooRequest(endpoint, consumerKey, consumerSecret, path = "", options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (consumerKey && consumerSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      "base64",
    )}`;
  }

  const response = await fetch(`${endpoint}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WooCommerce API failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

async function fetchAllCategories(config) {
  const categories = [];
  let page = 1;

  while (true) {
    const pageCategories = await wooRequest(
      config.endpoint,
      config.consumerKey,
      config.consumerSecret,
      `?per_page=100&page=${page}`,
    );

    categories.push(...pageCategories);

    if (pageCategories.length < 100) {
      return categories;
    }

    page += 1;
  }
}

function findCategory(categories, name, parentId = 0) {
  return categories.find(
    (category) => normalize(category.name) === normalize(name) && category.parent === parentId,
  );
}

async function ensureCategory(config, categories, name, parentId = 0) {
  const existingCategory = findCategory(categories, name, parentId);

  if (existingCategory) {
    console.log(`exists: ${name}`);
    return existingCategory;
  }

  const payload = {
    name,
    slug: slugify(parentId ? `${name}-${parentId}` : name),
    parent: parentId,
  };

  if (isDryRun) {
    console.log(`would create: ${name}${parentId ? ` under ${parentId}` : ""}`);
    return {
      id: -Math.floor(Math.random() * 1000000),
      name,
      parent: parentId,
    };
  }

  const createdCategory = await wooRequest(config.endpoint, config.consumerKey, config.consumerSecret, "", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  categories.push(createdCategory);
  console.log(`created: ${name}`);

  return createdCategory;
}

async function main() {
  const config = getWooConfig();

  if (isDryRun) {
    console.log("Dry run mode. No WooCommerce categories will be created.");
  }

  const categories = isDryRun ? [] : await fetchAllCategories(config);

  for (const categoryName of PRODUCT_TYPE_CATEGORIES) {
    await ensureCategory(config, categories, categoryName);
  }

  const stoneParent = await ensureCategory(config, categories, STONE_PARENT_CATEGORY);

  for (const categoryName of STONE_SUBCATEGORIES) {
    await ensureCategory(config, categories, categoryName, stoneParent.id);
  }

  console.log(
    `Done. ${PRODUCT_TYPE_CATEGORIES.length} product categories and ${STONE_SUBCATEGORIES.length} crystal type subcategories processed.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
